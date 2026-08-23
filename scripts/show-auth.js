const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 350 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 800 });

  // Clear session
  await page.goto('http://localhost:5500/login.html');
  await page.evaluate(() => {
    localStorage.clear();
  });

  // ── Screenshot 1: Login page ──
  await page.reload();
  await page.screenshot({ path: 'ss1-login.png' });
  console.log('📸 1: Login page');

  // Click Google button
  await page.click('.btn-google');
  await page.waitForURL('**/index.html', { timeout: 5000 });
  await page.waitForTimeout(800);

  // ── Screenshot 2: Homepage logged in via Google ──
  await page.screenshot({ path: 'ss2-homepage-google.png' });
  console.log('📸 2: Homepage after Google login');

  // Click avatar dropdown
  await page.click('.nav-user-btn');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'ss3-dropdown.png' });
  console.log('📸 3: Nav dropdown open');

  // Click My Account → dashboard
  await page.click('text=My Account');
  await page.waitForURL('**/dashboard.html', { timeout: 5000 });
  await page.waitForTimeout(800);

  // ── Screenshot 4: Dashboard with real name ──
  await page.screenshot({ path: 'ss4-dashboard.png' });
  console.log('📸 4: Dashboard showing name');

  console.log('\n✅ Done!');
})();
