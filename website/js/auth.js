/**
 * PolicyRaj — Auth Helper
 * DEV MODE: works in browser right now using localStorage (no AWS needed)
 * PROD MODE: switches to real AWS Cognito automatically once you fill in the IDs below
 *
 * To go live:
 *   1. Run:  bash aws/cognito/setup.sh
 *   2. Paste the two output values into COGNITO below (userPoolId + clientId)
 */

const COGNITO = {
  region:      'ap-south-1',
  userPoolId:  'FILL_AFTER_SETUP',
  clientId:    'FILL_AFTER_SETUP',
  domain:      'policyraj-auth.auth.ap-south-1.amazoncognito.com',
  redirectUri: 'https://policyraj.in/index.html',
  logoutUri:   'https://policyraj.in/index.html',
};

const IS_DEV = COGNITO.userPoolId === 'FILL_AFTER_SETUP';

// ── DEV MODE: localStorage-based auth ────────────────────────────────────────
const _db = {
  getUsers: () => JSON.parse(localStorage.getItem('pr_dev_users') || '{}'),
  saveUsers: (u) => localStorage.setItem('pr_dev_users', JSON.stringify(u)),
  getPending: () => JSON.parse(localStorage.getItem('pr_dev_pending') || '{}'),
  savePending: (p) => localStorage.setItem('pr_dev_pending', JSON.stringify(p)),
};

function _devSession(user) {
  const session = { email: user.email, name: user.name, phone: user.phone || '', sub: user.email };
  localStorage.setItem('pr_dev_session', JSON.stringify(session));
  localStorage.setItem('pr_id_token', 'dev_' + btoa(JSON.stringify(session)));
}

function _devLogout() {
  localStorage.removeItem('pr_dev_session');
  localStorage.removeItem('pr_id_token');
  localStorage.removeItem('pr_access_token');
}

function _devGetSession() {
  try { return JSON.parse(localStorage.getItem('pr_dev_session')); }
  catch { return null; }
}

// ── PUBLIC API ────────────────────────────────────────────────────────────────

export function loginEmail(email, password) {
  if (IS_DEV) {
    return new Promise((resolve, reject) => {
      const users = _db.getUsers();
      const user = users[email.toLowerCase()];
      if (!user) return reject({ message: 'No account found with this email. Please sign up first.' });
      if (user.password !== btoa(password)) return reject({ message: 'Incorrect password. Please try again.' });
      _devSession(user);
      resolve(user);
    });
  }
  return new Promise((resolve, reject) => {
    const pool = _pool();
    const user = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: pool });
    const auth = new AmazonCognitoIdentity.AuthenticationDetails({ Username: email, Password: password });
    user.authenticateUser(auth, {
      onSuccess: (session) => { _saveSession(session); resolve(session); },
      onFailure: reject,
      newPasswordRequired: (attrs) => reject({ code: 'NewPasswordRequired', attrs }),
    });
  });
}

export function signUp(name, email, phone, password) {
  if (IS_DEV) {
    return new Promise((resolve, reject) => {
      const key = email.toLowerCase();
      const users = _db.getUsers();
      if (users[key]) return reject({ message: 'An account already exists with this email.' });
      // store pending (awaiting OTP verification)
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const pending = _db.getPending();
      pending[key] = { name, email, phone, password: btoa(password), code };
      _db.savePending(pending);
      console.info(`[PolicyRaj DEV] Verification code for ${email}: ${code}`);
      // Show code in a visible place for development
      _devShowCode(email, code);
      resolve({ user: { username: email } });
    });
  }
  return new Promise((resolve, reject) => {
    const attrs = [
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name',         Value: name }),
      new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'phone_number', Value: phone }),
    ];
    _pool().signUp(email, password, attrs, null, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function confirmSignUp(email, code) {
  if (IS_DEV) {
    return new Promise((resolve, reject) => {
      const key = email.toLowerCase();
      const pending = _db.getPending();
      const entry = pending[key];
      if (!entry) return reject({ message: 'No pending registration found. Please sign up again.' });
      if (entry.code !== code.trim()) return reject({ message: 'Incorrect code. Please try again.' });
      // Move from pending to users
      const users = _db.getUsers();
      const user = { name: entry.name, email: entry.email, phone: entry.phone, password: entry.password };
      users[key] = user;
      _db.saveUsers(users);
      delete pending[key];
      _db.savePending(pending);
      _devSession(user); // auto-login after email verification
      resolve('SUCCESS');
    });
  }
  return new Promise((resolve, reject) => {
    const user = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: _pool() });
    user.confirmRegistration(code, true, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function resendCode(email) {
  if (IS_DEV) {
    return new Promise((resolve, reject) => {
      const pending = _db.getPending();
      const entry = pending[email.toLowerCase()];
      if (!entry) return reject({ message: 'No pending registration found.' });
      const code = String(Math.floor(100000 + Math.random() * 900000));
      entry.code = code;
      _db.savePending(pending);
      _devShowCode(email, code);
      resolve('RESENT');
    });
  }
  return new Promise((resolve, reject) => {
    const user = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: _pool() });
    user.resendConfirmationCode((err, result) => err ? reject(err) : resolve(result));
  });
}

// Mobile OTP login
let _devOtpStore = {};
export function requestOtp(phone) {
  if (IS_DEV) {
    return new Promise((resolve) => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      _devOtpStore[phone] = code;
      _devShowCode(phone, code);
      resolve({ _devPhone: phone });
    });
  }
  return new Promise((resolve, reject) => {
    const user = new AmazonCognitoIdentity.CognitoUser({ Username: phone, Pool: _pool() });
    const auth = new AmazonCognitoIdentity.AuthenticationDetails({
      Username: phone,
      AuthParameters: { USERNAME: phone },
    });
    user.initiateAuth(auth, {
      customChallenge: () => resolve(user),
      onFailure: reject,
      onSuccess: (s) => { _saveSession(s); resolve(null); },
    });
  });
}

export function verifyOtp(cognitoUserOrDev, otp) {
  if (IS_DEV) {
    return new Promise((resolve, reject) => {
      const phone = cognitoUserOrDev._devPhone;
      if (_devOtpStore[phone] !== otp.trim()) {
        return reject({ message: 'Incorrect OTP. Please try again.' });
      }
      delete _devOtpStore[phone];
      _devSession({ email: phone, name: 'Mobile User', phone });
      resolve({});
    });
  }
  return new Promise((resolve, reject) => {
    cognitoUserOrDev.sendCustomChallengeAnswer(otp, {
      onSuccess: (s) => { _saveSession(s); resolve(s); },
      onFailure: reject,
      customChallenge: () => reject({ message: 'Incorrect OTP. Please try again.' }),
    });
  });
}

export function forgotPassword(email) {
  if (IS_DEV) {
    return new Promise((resolve) => {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const pending = _db.getPending();
      pending['reset_' + email.toLowerCase()] = { code };
      _db.savePending(pending);
      _devShowCode(email, code);
      resolve({});
    });
  }
  return new Promise((resolve, reject) => {
    const user = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: _pool() });
    user.forgotPassword({ onSuccess: resolve, onFailure: reject });
  });
}

export function confirmForgotPassword(email, code, newPassword) {
  if (IS_DEV) {
    return new Promise((resolve, reject) => {
      const pending = _db.getPending();
      const key = 'reset_' + email.toLowerCase();
      if (!pending[key] || pending[key].code !== code.trim()) return reject({ message: 'Incorrect reset code.' });
      const users = _db.getUsers();
      if (!users[email.toLowerCase()]) return reject({ message: 'Account not found.' });
      users[email.toLowerCase()].password = btoa(newPassword);
      _db.saveUsers(users);
      delete pending[key];
      _db.savePending(pending);
      resolve({});
    });
  }
  return new Promise((resolve, reject) => {
    const user = new AmazonCognitoIdentity.CognitoUser({ Username: email, Pool: _pool() });
    user.confirmPassword(code, newPassword, { onSuccess: resolve, onFailure: reject });
  });
}

export function loginWithGoogle() {
  if (IS_DEV) {
    _devSession({ email: 'google.user@gmail.com', name: 'Google User', phone: '' });
    window.location.href = 'index.html';
    return;
  }
  const url = `https://${COGNITO.domain}/oauth2/authorize` +
    `?response_type=code&client_id=${COGNITO.clientId}` +
    `&redirect_uri=${encodeURIComponent(COGNITO.redirectUri)}` +
    `&identity_provider=Google&scope=openid+email+profile`;
  window.location.href = url;
}

export async function handleOAuthCallback() {
  if (IS_DEV) return null;
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (!code) return null;
  const res = await fetch(`https://${COGNITO.domain}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:   'authorization_code',
      client_id:    COGNITO.clientId,
      redirect_uri: COGNITO.redirectUri,
      code,
    }),
  });
  const tokens = await res.json();
  if (tokens.id_token) {
    localStorage.setItem('pr_id_token',      tokens.id_token);
    localStorage.setItem('pr_access_token',  tokens.access_token);
    localStorage.setItem('pr_refresh_token', tokens.refresh_token);
    window.history.replaceState({}, '', window.location.pathname);
    return tokens;
  }
  return null;
}

export function getCurrentUser() {
  if (IS_DEV) {
    const session = _devGetSession();
    if (!session) return Promise.reject('Not logged in');
    return Promise.resolve(session);
  }
  const user = _pool().getCurrentUser();
  if (!user) return Promise.reject('Not logged in');
  return new Promise((resolve, reject) => {
    user.getSession((err, session) => {
      if (err || !session.isValid()) return reject('Session expired');
      user.getUserAttributes((attrErr, attrs) => {
        if (attrErr) return reject(attrErr);
        const profile = { username: user.getUsername() };
        attrs.forEach(a => { profile[a.getName()] = a.getValue(); });
        resolve(profile);
      });
    });
  });
}

export async function requireAuth() {
  try {
    return await getCurrentUser();
  } catch {
    window.location.href = 'login.html';
    return null;
  }
}

export function logout() {
  if (IS_DEV) { _devLogout(); window.location.href = 'login.html'; return; }
  const user = _pool().getCurrentUser();
  if (user) user.signOut();
  localStorage.removeItem('pr_id_token');
  localStorage.removeItem('pr_access_token');
  localStorage.removeItem('pr_refresh_token');
  window.location.href = 'login.html';
}

// ── INTERNALS ─────────────────────────────────────────────────────────────────
function _pool() {
  return new AmazonCognitoIdentity.CognitoUserPool({
    UserPoolId: COGNITO.userPoolId,
    ClientId:   COGNITO.clientId,
  });
}

function _saveSession(session) {
  localStorage.setItem('pr_id_token',     session.getIdToken().getJwtToken());
  localStorage.setItem('pr_access_token', session.getAccessToken().getJwtToken());
}

function _devShowCode(target, code) {
  // Creates a visible banner on screen showing the OTP (dev mode only)
  const existing = document.getElementById('dev-code-banner');
  if (existing) existing.remove();
  const banner = document.createElement('div');
  banner.id = 'dev-code-banner';
  banner.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#1E3A8A;color:#fff;text-align:center;padding:12px 16px;font-family:monospace;font-size:1rem;z-index:9999;cursor:pointer';
  banner.innerHTML = `<strong>DEV MODE — OTP for ${target}:</strong> <span style="font-size:1.4rem;letter-spacing:4px;font-weight:bold">${code}</span> &nbsp; <small style="opacity:0.7">(click to dismiss)</small>`;
  banner.onclick = () => banner.remove();
  document.body.prepend(banner);
}
