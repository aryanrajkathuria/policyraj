const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 300 });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:5500/index.html', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);

  // Navbar closed
  await page.screenshot({ path: 'ss-nav1-closed.png', clip: { x: 0, y: 36, width: 1440, height: 70 } });

  // Click Products
  await page.click('.nav-mega .nav-dropdown-trigger');
  await page.waitForTimeout(400);
  await page.screenshot({ path: 'ss-nav2-open.png', clip: { x: 0, y: 36, width: 1440, height: 420 } });

  await browser.close();
})();
