---
name: playwright
description: Headless browser automation using Playwright on Linux. Use for login flows, multi-page navigation, screenshots, DOM inspection, and form interaction on real websites.
---

# Playwright Browser Tools

Headless Chromium automation via Playwright. Runs on the Linux VPS — no display required.

## Setup (run once)

```bash
cd {baseDir} && npm install && npx playwright install chromium --with-deps
```

## Run a Script

```bash
node {baseDir}/run.js {baseDir}/scripts/my-script.js
```

Write a Playwright script at any path, then execute it with `run.js`.

## Screenshot

```bash
node {baseDir}/screenshot.js https://example.com /tmp/screenshot.png
```

## Evaluate JavaScript on a Page

```bash
node {baseDir}/eval.js https://example.com 'document.title'
```

## Script Template

```javascript
// my-script.js
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();

await page.goto('https://example.com');
await page.waitForLoadState('networkidle');

console.log('Title:', await page.title());
console.log('URL:', page.url());

await page.screenshot({ path: '/tmp/screenshot.png', fullPage: true });

await browser.close();
```

## Environment Variables Available

- `P21_USERNAME`, `P21_PASSWORD`, `P21_URL` — Prophet 21 credentials
- All other `.env` variables are available

## Tips

- Always use `args: ['--no-sandbox', '--disable-setuid-sandbox']` on Linux
- Use `page.waitForLoadState('networkidle')` after navigation
- Save screenshots to `/tmp/` or `/job/tmp/`
- Use `page.waitForSelector()` before interacting with elements
