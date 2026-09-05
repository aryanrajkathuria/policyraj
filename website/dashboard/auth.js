// Cognito Hosted UI sign-in with authorization code + PKCE.
// Tokens live in sessionStorage only — never localStorage, so they do not
// survive the tab and cannot be read back on a shared machine later.
const Auth = (() => {
  const cfg = DASHBOARD_CONFIG;
  const STORE = {
    id: 'pr_id_token',
    refresh: 'pr_refresh_token',
    expires: 'pr_expires_at',
    verifier: 'pr_pkce_verifier',
    state: 'pr_oauth_state'
  };

  const redirectUri = () => `${window.location.origin}${cfg.redirectPath}`;

  const b64url = (bytes) =>
    btoa(String.fromCharCode(...new Uint8Array(bytes)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

  const randomString = () => {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return b64url(bytes);
  };

  const challengeFor = async (verifier) =>
    b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));

  const decode = (token) => {
    try {
      let payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      payload += '='.repeat((4 - (payload.length % 4)) % 4);
      // TextDecoder rather than atob alone, so non-ASCII names survive the round trip.
      const bytes = Uint8Array.from(atob(payload), (ch) => ch.charCodeAt(0));
      return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      return null;
    }
  };

  const clear = () => Object.values(STORE).forEach((k) => sessionStorage.removeItem(k));

  const store = (tokens) => {
    sessionStorage.setItem(STORE.id, tokens.id_token);
    if (tokens.refresh_token) sessionStorage.setItem(STORE.refresh, tokens.refresh_token);
    sessionStorage.setItem(STORE.expires, String(Date.now() + tokens.expires_in * 1000));
  };

  const signIn = async () => {
    const verifier = randomString();
    const state = randomString();
    sessionStorage.setItem(STORE.verifier, verifier);
    sessionStorage.setItem(STORE.state, state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: cfg.clientId,
      redirect_uri: redirectUri(),
      scope: 'openid email profile',
      state,
      code_challenge: await challengeFor(verifier),
      code_challenge_method: 'S256'
    });

    window.location.assign(`${cfg.hostedUi}/oauth2/authorize?${params}`);
  };

  const signOut = () => {
    clear();
    const params = new URLSearchParams({
      client_id: cfg.clientId,
      logout_uri: `${window.location.origin}/`
    });
    window.location.assign(`${cfg.hostedUi}/logout?${params}`);
  };

  const exchange = async (body) => {
    const res = await fetch(`${cfg.hostedUi}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(body)
    });
    if (!res.ok) throw new Error(`token endpoint returned ${res.status}`);
    return res.json();
  };

  // Returns true when a ?code= callback was consumed, so the caller knows to
  // re-read the token rather than bounce the user back to sign-in.
  const handleCallback = async () => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    if (!code) return false;

    const expected = sessionStorage.getItem(STORE.state);
    const got = url.searchParams.get('state');
    const verifier = sessionStorage.getItem(STORE.verifier);

    window.history.replaceState({}, document.title, url.pathname);

    if (!expected || expected !== got || !verifier) {
      clear();
      throw new Error('sign-in state mismatch, please try again');
    }

    store(
      await exchange({
        grant_type: 'authorization_code',
        client_id: cfg.clientId,
        code,
        redirect_uri: redirectUri(),
        code_verifier: verifier
      })
    );

    sessionStorage.removeItem(STORE.verifier);
    sessionStorage.removeItem(STORE.state);
    return true;
  };

  const refresh = async () => {
    const token = sessionStorage.getItem(STORE.refresh);
    if (!token) return null;
    try {
      const tokens = await exchange({
        grant_type: 'refresh_token',
        client_id: cfg.clientId,
        refresh_token: token
      });
      store({ ...tokens, refresh_token: token });
      return tokens.id_token;
    } catch {
      clear();
      return null;
    }
  };

  // Refreshes a few minutes early so a long form submit never lands on an
  // expired token mid-request.
  const getIdToken = async () => {
    const token = sessionStorage.getItem(STORE.id);
    const expiresAt = Number(sessionStorage.getItem(STORE.expires) || 0);
    if (!token) return null;
    if (Date.now() > expiresAt - 5 * 60 * 1000) return refresh();
    return token;
  };

  const claims = () => {
    const token = sessionStorage.getItem(STORE.id);
    return token ? decode(token) : null;
  };

  const isAdmin = () => {
    const c = claims();
    return Boolean(c && Array.isArray(c['cognito:groups']) && c['cognito:groups'].includes('admin'));
  };

  return { signIn, signOut, handleCallback, getIdToken, claims, isAdmin, clear };
})();
