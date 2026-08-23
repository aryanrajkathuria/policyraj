/**
 * PolicyRaj — Full Site Audit
 * Tests every page, every form, every critical feature A to Z.
 */
const { chromium } = require('playwright');

const ALL_PAGES = [
  'index.html','health.html','motor.html','life.html','blog.html',
  'login.html','signup.html','dashboard.html','ai-scan.html',
  'annuity-plans.html','bajaj-allianz.html','business.html',
  'child-plan.html','claims.html','compare.html','endowment-policy.html',
  'faq.html','hdfc-ergo.html','hdfc-life.html','home.html',
  'icici-lombard.html','insurance-companies.html','lic-india.html',
  'money-back-policy.html','niva-bupa.html','pension-plan.html',
  'privacy-policy.html','tata-aig.html','tax-saving.html','travel.html',
];

const BASE = 'http://localhost:5500';
const passes = [], failures = [], warnings = [];

async function check(label, fn, page) {
  try { await fn(page); passes.push(`✅ ${label}`); }
  catch (e) { failures.push(`❌ ${label}\n     → ${e.message.slice(0,140)}`); }
}

async function warn(label, fn, page) {
  try { await fn(page); passes.push(`✅ ${label}`); }
  catch (e) { warnings.push(`⚠️  ${label}\n     → ${e.message.slice(0,140)}`); }
}

(async () => {
  const browser = await chromium.launch({ headless: true });

  // ══════════════════════════════════════════════════════════════
  // SECTION 1 — All pages load without crash
  // ══════════════════════════════════════════════════════════════
  console.log('\n[1/8] Checking all pages load...');
  for (const pg of ALL_PAGES) {
    const page = await browser.newPage();
    const jsErrors = [];
    page.on('pageerror', e => jsErrors.push(e.message));
    page.on('response', r => {
      if (r.status() === 404 && (r.url().endsWith('.css') || r.url().endsWith('.js')))
        jsErrors.push(`404: ${r.url().split('/').pop()}`);
    });
    await check(`Page loads: ${pg}`, async () => {
      const res = await page.goto(`${BASE}/${pg}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      if (res.status() >= 400) throw new Error(`HTTP ${res.status()}`);
      if (jsErrors.length) throw new Error(jsErrors.slice(0,2).join(' | '));
    }, page);
    await page.close();
  }

  // ══════════════════════════════════════════════════════════════
  // SECTION 2 — Every page: required tags & structure
  // ══════════════════════════════════════════════════════════════
  console.log('[2/8] Checking page structure on all pages...');
  for (const pg of ALL_PAGES) {
    const page = await browser.newPage();
    await page.goto(`${BASE}/${pg}`, { waitUntil: 'domcontentloaded', timeout: 8000 }).catch(() => {});
    await check(`<title> tag: ${pg}`, async () => {
      const t = await page.title();
      if (!t || t.trim() === '') throw new Error('Empty title');
      if (!t.includes('PolicyRaj')) throw new Error(`Title missing "PolicyRaj": "${t}"`);
    }, page);
    await check(`Viewport meta: ${pg}`, async () => {
      const vp = await page.$('meta[name="viewport"]');
      if (!vp) throw new Error('Missing viewport meta tag');
    }, page);
    await warn(`Nav present: ${pg}`, async () => {
      const nav = await page.$('nav');
      if (!nav) throw new Error('No <nav> element');
    }, page);
    await warn(`Footer present: ${pg}`, async () => {
      const ft = await page.$('footer');
      if (!ft) throw new Error('No <footer> element');
    }, page);
    await page.close();
  }

  // ══════════════════════════════════════════════════════════════
  // SECTION 3 — Homepage critical content
  // ══════════════════════════════════════════════════════════════
  console.log('[3/8] Checking homepage content...');
  const hp = await browser.newPage();
  await hp.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });

  await check('Homepage: Hero section exists', async () => {
    const hero = await hp.$('.hero-section, .hero, #hero, section');
    if (!hero) throw new Error('No hero section');
  }, hp);
  await check('Homepage: navbar Login button present', async () => {
    const btn = await hp.$('#navAuthBtn');
    if (!btn) throw new Error('navAuthBtn not found');
  }, hp);
  await check('Homepage: WhatsApp float button', async () => {
    const wa = await hp.$('.whatsapp-float, a[href*="wa.me"]');
    if (!wa) throw new Error('No WhatsApp float button');
  }, hp);
  await check('Homepage: Back-to-top button', async () => {
    const btt = await hp.$('.back-to-top, #backToTop, .btt, [onclick*="scrollToTop"]');
    if (!btt) throw new Error('No back-to-top button');
  }, hp);
  await check('Homepage: quote-api.js loaded', async () => {
    const fn = await hp.evaluate(() => typeof submitQuoteLead);
    if (fn !== 'function') throw new Error(`submitQuoteLead is ${fn}`);
  }, hp);
  await check('Homepage: chatbot toggle function', async () => {
    const fn = await hp.evaluate(() => typeof toggleChat);
    if (fn !== 'function') throw new Error(`toggleChat is ${fn}`);
  }, hp);
  await check('Homepage: Est. 2004 shown', async () => {
    const body = await hp.textContent('body');
    if (!body.includes('2004')) throw new Error('"2004" not found on homepage');
  }, hp);
  await check('Homepage: copyright 2004-2026', async () => {
    const body = await hp.textContent('body');
    if (!body.includes('2004') || !body.includes('2026')) throw new Error('Copyright year incorrect');
  }, hp);
  await check('Homepage: Sachin Kathuria mentioned', async () => {
    const body = await hp.textContent('body');
    if (!body.includes('Sachin Kathuria')) throw new Error('Advisor name missing');
  }, hp);
  await check('Homepage: phone 9013976999 present', async () => {
    const body = await hp.textContent('body');
    if (!body.includes('9013976999')) throw new Error('Primary phone missing');
  }, hp);
  await check('Homepage: correct email (policyraj.com not .in)', async () => {
    const body = await hp.innerHTML('body');
    if (body.includes('sachin@policyraj.in')) throw new Error('Old email sachin@policyraj.in still present');
  }, hp);
  await check('Homepage: Insurance cards (health/life/motor)', async () => {
    const cards = await hp.$$('.ins-3d-card, .insurance-card, [href="health.html"], [href="life.html"]');
    if (cards.length < 2) throw new Error(`Only ${cards.length} insurance card links`);
  }, hp);
  await check('Homepage: Get Free Quote modal button', async () => {
    const btn = await hp.$('.btn-nav-quote, [onclick*="openModal"]');
    if (!btn) throw new Error('Get Free Quote button missing');
  }, hp);
  await check('Homepage: modal opens on click', async () => {
    await hp.click('[onclick*="openModal"]');
    await hp.waitForTimeout(400);
    const modal = await hp.$('#modalOverlay.open, .modal.open, .modal-overlay.open');
    if (!modal) throw new Error('Modal did not open');
    await hp.keyboard.press('Escape');
  }, hp);
  await hp.close();

  // ══════════════════════════════════════════════════════════════
  // SECTION 4 — Auth flow A-Z
  // ══════════════════════════════════════════════════════════════
  console.log('[4/8] Checking auth flow...');
  const ap = await browser.newPage();

  // Fresh signup
  await ap.goto(`${BASE}/signup.html`);
  await ap.evaluate(() => localStorage.clear());
  await ap.reload();
  await check('Auth: Signup form fields present', async () => {
    await ap.waitForSelector('#signupFirst');
    await ap.waitForSelector('#signupLast');
    await ap.waitForSelector('#signupEmail');
    await ap.waitForSelector('#signupPhone');
    await ap.waitForSelector('#signupPassword');
    await ap.waitForSelector('#agreeTerms');
  }, ap);
  await check('Auth: Signup → OTP banner appears', async () => {
    await ap.fill('#signupFirst', 'Aryan');
    await ap.fill('#signupLast', 'Raj');
    await ap.fill('#signupEmail', 'aryan@policyraj.com');
    await ap.fill('#signupPhone', '9013976999');
    await ap.fill('#signupPassword', 'Test@2024');
    await ap.check('#agreeTerms');
    await ap.click('button[type="submit"]');
    await ap.waitForTimeout(700);
    const banner = await ap.$('#dev-code-banner');
    if (!banner) throw new Error('OTP banner did not appear');
  }, ap);
  await check('Auth: OTP verify → redirects to homepage', async () => {
    const otp = await ap.$eval('#dev-code-banner span', el => el.textContent.replace(/\s/g, ''));
    const boxes = await ap.$$('.otp-digit');
    for (let i = 0; i < 6; i++) await boxes[i].fill(otp[i]);
    await ap.click('button:has-text("Verify")');
    await ap.waitForURL('**/index.html', { timeout: 6000 });
  }, ap);
  await check('Auth: After signup, navbar shows avatar (not Login)', async () => {
    await ap.waitForTimeout(400);
    const avatar = await ap.$('.nav-user-btn');
    if (!avatar) throw new Error('.nav-user-btn not found after signup');
    const loginBtn = await ap.$('#navAuthBtn');
    if (loginBtn) throw new Error('Login button still showing after signup');
  }, ap);
  await check('Auth: Nav dropdown has correct items', async () => {
    await ap.click('.nav-user-btn');
    await ap.waitForTimeout(200);
    const items = await ap.$$('.num-item');
    if (items.length < 4) throw new Error(`Only ${items.length} dropdown items`);
    const texts = await Promise.all(items.map(i => i.textContent()));
    const hasAccount = texts.some(t => t.includes('My Account'));
    const hasSignout = texts.some(t => t.includes('Sign Out'));
    if (!hasAccount) throw new Error('My Account missing from dropdown');
    if (!hasSignout) throw new Error('Sign Out missing from dropdown');
  }, ap);
  await check('Auth: Logout → back to homepage, Login button restored', async () => {
    await ap.click('button:has-text("Sign Out")');
    await ap.waitForTimeout(500);
    const session = await ap.evaluate(() => localStorage.getItem('pr_dev_session'));
    if (session) throw new Error('Session not cleared after logout');
    const loginBtn = await ap.$('#navAuthBtn');
    if (!loginBtn) throw new Error('Login button not restored after logout');
  }, ap);
  await check('Auth: Login with wrong password shows error', async () => {
    await ap.goto(`${BASE}/login.html`);
    await ap.fill('#loginEmail', 'nobody@fake.com');
    await ap.fill('#loginPassword', 'wrongpass');
    await ap.click('button[type="submit"]');
    await ap.waitForTimeout(500);
    const err = await ap.$('.auth-error.show');
    if (!err) throw new Error('Error not shown for wrong password');
  }, ap);
  await check('Auth: Login with correct credentials → homepage', async () => {
    await ap.goto(`${BASE}/login.html`);
    await ap.fill('#loginEmail', 'aryan@policyraj.com');
    await ap.fill('#loginPassword', 'Test@2024');
    await ap.click('button[type="submit"]');
    await ap.waitForURL('**/index.html', { timeout: 5000 });
    const session = await ap.evaluate(() => localStorage.getItem('pr_dev_session'));
    if (!session) throw new Error('No session after correct login');
  }, ap);
  await check('Auth: Google login → homepage with session', async () => {
    await ap.goto(`${BASE}/login.html`);
    await ap.evaluate(() => localStorage.clear());
    await ap.reload();
    await ap.click('.btn-google');
    await ap.waitForURL('**/index.html', { timeout: 4000 });
    const session = await ap.evaluate(() => localStorage.getItem('pr_dev_session'));
    if (!session) throw new Error('No session after Google login');
  }, ap);
  await check('Auth: Dashboard redirects to login when logged out', async () => {
    await ap.evaluate(() => localStorage.clear());
    await ap.goto(`${BASE}/dashboard.html`);
    await ap.waitForURL('**/login.html', { timeout: 4000 });
  }, ap);
  await check('Auth: Dashboard shows correct name & initials', async () => {
    await ap.evaluate(() => {
      localStorage.setItem('pr_id_token', 'dev_xyz');
      localStorage.setItem('pr_dev_session', JSON.stringify({ name: 'Ravi Verma', email: 'ravi@test.com' }));
    });
    await ap.goto(`${BASE}/dashboard.html`, { waitUntil: 'domcontentloaded' });
    await ap.waitForTimeout(300);
    const greet = await ap.$eval('#greetName', el => el.textContent);
    if (greet !== 'Ravi') throw new Error(`greetName = "${greet}"`);
    const initials = await ap.$eval('#dbAvatar', el => el.textContent);
    if (initials !== 'RV') throw new Error(`Avatar initials = "${initials}"`);
  }, ap);
  await check('Auth: Dashboard all tabs clickable', async () => {
    await ap.evaluate(() => {
      localStorage.setItem('pr_id_token', 'dev_xyz');
      localStorage.setItem('pr_dev_session', JSON.stringify({ name: 'Test User', email: 't@t.com' }));
    });
    await ap.goto(`${BASE}/dashboard.html`, { waitUntil: 'domcontentloaded' });
    await ap.waitForTimeout(300);
    for (const tab of ['policies','claims','renewals','documents']) {
      await ap.click(`button[onclick*="${tab}"]`);
      await ap.waitForTimeout(150);
      const active = await ap.$(`#tab-${tab}`);
      if (!active) throw new Error(`Tab ${tab} not found`);
    }
  }, ap);
  await ap.close();

  // ══════════════════════════════════════════════════════════════
  // SECTION 5 — Forms & submissions
  // ══════════════════════════════════════════════════════════════
  console.log('[5/8] Checking forms...');
  const fp = await browser.newPage();

  await check('Form: Contact form on homepage present & wired', async () => {
    await fp.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    const form = await fp.$('form[onsubmit*="submitForm"]');
    if (!form) throw new Error('Contact form not found');
    // Check submitQuoteLead is available (form will call it on submit)
    const fn = await fp.evaluate(() => typeof submitQuoteLead);
    if (fn !== 'function') throw new Error('submitQuoteLead not available');
    // Check required fields exist inside the form
    const nameInput = await fp.$('form[onsubmit*="submitForm"] input[placeholder="Your Full Name"]');
    if (!nameInput) throw new Error('Name field missing in contact form');
    const phoneInput = await fp.$('form[onsubmit*="submitForm"] input[placeholder="Mobile Number"]');
    if (!phoneInput) throw new Error('Phone field missing in contact form');
  }, fp);

  await check('Form: Health proposal form present & has required fields', async () => {
    await fp.goto(`${BASE}/health.html`, { waitUntil: 'domcontentloaded' });
    await fp.waitForSelector('#hipForm');
    await fp.waitForSelector('#hipName');
    await fp.waitForSelector('#hipDob');
    await fp.waitForSelector('#hipMobile1');
    await fp.waitForSelector('#hipEmail');
    const fn = await fp.evaluate(() => typeof submitQuoteLead);
    if (fn !== 'function') throw new Error('submitQuoteLead missing');
  }, fp);

  await check('Form: Motor proposal form present & has required fields', async () => {
    await fp.goto(`${BASE}/motor.html`, { waitUntil: 'domcontentloaded' });
    await fp.waitForSelector('#mipForm, form');
    await fp.waitForSelector('#mipOwnerName, input[placeholder*="Owner"]');
    const fn = await fp.evaluate(() => typeof submitQuoteLead);
    if (fn !== 'function') throw new Error('submitQuoteLead missing');
  }, fp);

  await check('Form: Blog newsletter form present', async () => {
    await fp.goto(`${BASE}/blog.html`, { waitUntil: 'domcontentloaded' });
    const form = await fp.$('#newsletterEmail, input[type="email"]');
    if (!form) throw new Error('Newsletter email input not found');
  }, fp);

  await fp.close();

  // ══════════════════════════════════════════════════════════════
  // SECTION 6 — Navigation links on homepage
  // ══════════════════════════════════════════════════════════════
  console.log('[6/8] Checking navigation links...');
  const np = await browser.newPage();
  await np.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });

  const navLinks = await np.$$eval('nav a[href]', els =>
    els.map(a => ({ href: a.getAttribute('href'), text: a.textContent.trim() }))
       .filter(l => l.href && !l.href.startsWith('#') && !l.href.startsWith('tel:') && !l.href.startsWith('mailto:') && !l.href.startsWith('http'))
  );
  for (const link of navLinks.slice(0, 15)) {
    await check(`Nav link works: ${link.text || link.href}`, async () => {
      const res = await np.request.get(`${BASE}/${link.href}`).catch(() => null);
      if (!res) throw new Error('Request failed');
      if (res.status() === 404) throw new Error(`404 — ${link.href}`);
    }, np);
  }
  await np.close();

  // ══════════════════════════════════════════════════════════════
  // SECTION 7 — Static assets (CSS, JS, images)
  // ══════════════════════════════════════════════════════════════
  console.log('[7/8] Checking static assets...');
  const sp = await browser.newPage();
  const assetErrors = [];
  sp.on('response', r => {
    if (r.status() === 404) {
      const url = r.url();
      if (url.includes('localhost:5500') && (url.match(/\.(css|js|png|svg|jpg|woff)$/)))
        assetErrors.push(url.replace(`${BASE}/`, ''));
    }
  });
  await sp.goto(`${BASE}/index.html`, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
  await check('Assets: No 404 errors on homepage (CSS/JS/images)', async () => {
    if (assetErrors.length) throw new Error('Missing: ' + assetErrors.join(', '));
  }, sp);

  await check('Assets: style.css loads', async () => {
    const res = await sp.request.get(`${BASE}/style.css`);
    if (res.status() !== 200) throw new Error(`style.css returned ${res.status()}`);
  }, sp);
  await check('Assets: script.js loads', async () => {
    const res = await sp.request.get(`${BASE}/script.js`);
    if (res.status() !== 200) throw new Error(`script.js returned ${res.status()}`);
  }, sp);
  await check('Assets: chatbot.js loads', async () => {
    const res = await sp.request.get(`${BASE}/chatbot.js`);
    if (res.status() !== 200) throw new Error(`chatbot.js returned ${res.status()}`);
  }, sp);
  await check('Assets: quote-api.js loads', async () => {
    const res = await sp.request.get(`${BASE}/js/quote-api.js`);
    if (res.status() !== 200) throw new Error(`js/quote-api.js returned ${res.status()}`);
  }, sp);
  await check('Assets: auth-nav.js loads', async () => {
    const res = await sp.request.get(`${BASE}/js/auth-nav.js`);
    if (res.status() !== 200) throw new Error(`js/auth-nav.js returned ${res.status()}`);
  }, sp);
  await check('Assets: auth.js loads', async () => {
    const res = await sp.request.get(`${BASE}/js/auth.js`);
    if (res.status() !== 200) throw new Error(`js/auth.js returned ${res.status()}`);
  }, sp);
  await check('Assets: policyraj.png loads', async () => {
    const res = await sp.request.get(`${BASE}/policyraj.png`);
    if (res.status() !== 200) throw new Error(`policyraj.png returned ${res.status()}`);
  }, sp);
  await check('Assets: rakesh-avatar.svg loads', async () => {
    const res = await sp.request.get(`${BASE}/rakesh-avatar.svg`);
    if (res.status() !== 200) throw new Error(`rakesh-avatar.svg returned ${res.status()}`);
  }, sp);
  await check('Assets: dashboard.css loads', async () => {
    const res = await sp.request.get(`${BASE}/dashboard.css`);
    if (res.status() !== 200) throw new Error(`dashboard.css returned ${res.status()}`);
  }, sp);
  await sp.close();

  // ══════════════════════════════════════════════════════════════
  // SECTION 8 — Mobile viewport check
  // ══════════════════════════════════════════════════════════════
  console.log('[8/8] Checking mobile responsiveness...');
  const mp = await browser.newPage();
  await mp.setViewportSize({ width: 375, height: 812 });

  await check('Mobile: Homepage no horizontal scroll', async () => {
    await mp.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    const scrollWidth = await mp.evaluate(() => document.documentElement.scrollWidth);
    if (scrollWidth > 390) throw new Error(`Horizontal scroll: scrollWidth=${scrollWidth}px > 390px`);
  }, mp);
  await check('Mobile: Hamburger menu visible', async () => {
    await mp.goto(`${BASE}/index.html`, { waitUntil: 'domcontentloaded' });
    const hamburger = await mp.$('#hamburger, .hamburger');
    if (!hamburger) throw new Error('Hamburger not found on mobile');
    const visible = await hamburger.isVisible();
    if (!visible) throw new Error('Hamburger not visible on mobile');
  }, mp);
  await check('Mobile: Login page no horizontal scroll', async () => {
    await mp.goto(`${BASE}/login.html`, { waitUntil: 'domcontentloaded' });
    const scrollWidth = await mp.evaluate(() => document.documentElement.scrollWidth);
    if (scrollWidth > 390) throw new Error(`Horizontal scroll: ${scrollWidth}px`);
  }, mp);
  await check('Mobile: Dashboard no horizontal scroll', async () => {
    await mp.evaluate(() => {
      localStorage.setItem('pr_id_token', 'dev_xyz');
      localStorage.setItem('pr_dev_session', JSON.stringify({ name: 'Test User', email: 't@t.com' }));
    });
    await mp.goto(`${BASE}/dashboard.html`, { waitUntil: 'domcontentloaded' });
    const scrollWidth = await mp.evaluate(() => document.documentElement.scrollWidth);
    if (scrollWidth > 390) throw new Error(`Horizontal scroll: ${scrollWidth}px`);
  }, mp);
  await check('Mobile: Health page no horizontal scroll', async () => {
    await mp.goto(`${BASE}/health.html`, { waitUntil: 'domcontentloaded' });
    const scrollWidth = await mp.evaluate(() => document.documentElement.scrollWidth);
    if (scrollWidth > 390) throw new Error(`Horizontal scroll: ${scrollWidth}px`);
  }, mp);
  await mp.close();

  await browser.close();

  // ══════════════════════════════════════════════════════════════
  // REPORT
  // ══════════════════════════════════════════════════════════════
  const total = passes.length + failures.length + warnings.length;
  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║      PolicyRaj — Full Site Audit Report      ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  if (passes.length) { console.log('PASSED:\n'); passes.forEach(p => console.log(' ' + p)); }
  if (warnings.length) { console.log('\nWARNINGS:\n'); warnings.forEach(w => console.log(' ' + w)); }
  if (failures.length) { console.log('\nFAILED:\n'); failures.forEach(f => console.log(' ' + f)); }

  console.log(`\n══════════════════════════════════════════════`);
  console.log(`  ${passes.length} passed  |  ${warnings.length} warnings  |  ${failures.length} failed  |  ${total} total`);
  console.log(`══════════════════════════════════════════════\n`);
})();
