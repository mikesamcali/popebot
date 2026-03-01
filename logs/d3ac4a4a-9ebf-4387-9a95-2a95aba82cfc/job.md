# Job: Prophet 21 navigation + Telegram notification

## 1. Create a Node.js script
Create the file `scripts/playwright_nav_with_notify.js` with the following contents:

```js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { execSync } = require('child_process');

(async () => {
  const report = { pages_visited: [], errors: [], summary: {} };
  const screenshotsDir = path.join('output', 'screenshots');
  fs.mkdirSync(screenshotsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Phase 1 & 2: Login
    await page.goto('https://221-35-167-72.prophet21tools.com:3128/Prophet21/', { waitUntil: 'networkidle' });
    await page.fill('#loginUsername', process.env.P21_USERNAME || '');
    await page.fill('#loginPassword', process.env.P21_PASSWORD || '');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 60000 });

    const loggedIn = await page.isVisible('nav');
    if (!loggedIn) throw new Error('Login failed: navigation bar not visible');

    // Phase 3: Enumerate top‑level menu items
    const menuSelector = 'nav > ul > li > a'; // adjust if needed
    const menuItems = await page.$$(menuSelector);
    for (let i = 0; i < menuItems.length; i++) {
      const menu = menuItems[i];
      const title = await menu.innerText();
      try {
        const [newPage] = await Promise.all([
          context.waitForEvent('page'),
          menu.click({ force: true })
        ]);
        await newPage.waitForLoadState('networkidle', { timeout: 60000 });
        const url = newPage.url();
        const screenshotPath = path.join(screenshotsDir, `page_${i+1}.png`);
        await newPage.screenshot({ path: screenshotPath });
        report.pages_visited.push({ title, url, screenshot: screenshotPath });
      } catch (e) {
        report.errors.push({ title, error: e.message });
      }
    }

    // Summary
    report.summary.total_pages = report.pages_visited.length;
    report.summary.total_errors = report.errors.length;
    report.summary.total_screenshots = report.pages_visited.length;
  } catch (e) {
    report.errors.push({ stage: 'overall', error: e.message });
  } finally {
    await browser.close();
    const outPath = path.join('output', 'navigation_report.json');
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`Report written to ${outPath}`);

    // Phase 5: Send Telegram notification
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (botToken && chatId) {
      const msg = `Prophet 21 navigation run completed.\nPages visited: ${report.summary.total_pages}\nErrors: ${report.summary.total_errors}`;
      const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(msg)}`;
      try {
        execSync(`curl -s -X GET "${url}"`);
        console.log('Telegram notification sent.');
      } catch (e) {
        console.error('Failed to send Telegram message:', e.message);
      }
    } else {
      console.warn('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set – skipping notification.');
    }
  }
})();
```

*Important:* Adjust CSS selectors (`#loginUsername`, `#loginPassword`, `nav > ul > li > a`) to match the actual page markup. Ensure `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are present as env vars; otherwise the job will simply skip the notification.

## 2. Run the script
After creating the file, execute:

```bash
node scripts/playwright_nav_with_notify.js
```

This will create the JSON report at `output/navigation_report.json`, save screenshots in `output/screenshots/`, and push a quick Telegram message when done.