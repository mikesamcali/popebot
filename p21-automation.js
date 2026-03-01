#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const report = {
    login_success: false,
    pages_visited: [],
    errors: [],
    summary: { total_pages: 0, total_errors: 0 }
  };

  const sanitize = str => str.replace(/[^a-zA-Z0-9_]/g, '_');
  const ensureDir = dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  };

  const P21_URL = process.env.P21_URL;
  const USERNAME = process.env.P21_USERNAME;
  const PASSWORD = process.env.P21_PASSWORD;

  if (!P21_URL || !USERNAME || !PASSWORD) {
    report.errors.push('Missing required environment variables P21_URL, P21_USERNAME, or P21_PASSWORD');
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--ignore-certificate-errors']
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(P21_URL, { waitUntil: 'networkidle' });

    // Attempt to locate username and password fields heuristically
    const usernameSelector = await page.$('input[name*="user" i], input[id*="user" i], input[type="email"]');
    const passwordSelector = await page.$('input[name*="pass" i], input[id*="pass" i], input[type="password"]');

    if (!usernameSelector || !passwordSelector) {
      throw new Error('Could not locate username or password fields');
    }

    await usernameSelector.fill(USERNAME);
    await passwordSelector.fill(PASSWORD);

    // Try to submit the form
    // Prefer a button of type submit or containing text login
    const submitBtn = await page.$('button[type="submit"], input[type="submit"], button:has-text(/login|sign in/i)');
    if (submitBtn) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle' }),
        submitBtn.click()
      ]);
    } else {
      // Fallback: press Enter in password field
      await passwordSelector.press('Enter');
      await page.waitForLoadState('networkidle');
    }

    // Verify login succeeded
    const currentURL = page.url();
    const title = await page.title();
    if (/login/i.test(currentURL) || /login/i.test(title)) {
      throw new Error('Login appears to have failed; still on login page');
    }
    report.login_success = true;

    ensureDir('/tmp');
    const loginScreenshot = '/tmp/p21-login.png';
    await page.screenshot({ path: loginScreenshot, fullPage: true });

    // Gather top‑level navigation items
    // This is heuristic: look for nav a tags, sidebar links, or menu tabs
    const navLinks = await page.$$eval('nav a, [role="navigation"] a, .sidebar a, .menu a, .tabs a', els =>
      els.map(el => ({ label: el.innerText.trim(), href: el.href }))
    );

    const seen = new Set();
    for (const item of navLinks) {
      const label = item.label || item.href;
      if (!label) continue;
      const key = label.toLowerCase();
      if (seen.has(key)) continue; // avoid duplicates
      seen.add(key);

      try {
        // Open in same page or new page if target=_blank
        const [newPage] = await Promise.all([
          context.waitForEvent('page', { timeout: 5000 }).catch(() => null),
          page.evaluate((href) => {
            const a = Array.from(document.querySelectorAll('a')).find(el => el.href === href);
            if (a) a.click();
          }, item.href)
        ]);
        const targetPage = newPage || page;
        await targetPage.waitForLoadState('networkidle');
        const pageURL = targetPage.url();
        const pageTitle = await targetPage.title();
        const screenshotPath = `/tmp/p21-${sanitize(label)}.png`;
        await targetPage.screenshot({ path: screenshotPath, fullPage: true });
        // Sub‑menu items: look for nested links within the same container
        const subItems = await targetPage.$$eval('nav a, [role="navigation"] a, .sidebar a, .menu a, .tabs a', els =>
          els.map(el => el.innerText.trim()).filter(t => t)
        );
        report.pages_visited.push({
          label,
          url: pageURL,
          title: pageTitle,
          sub_items: subItems,
          screenshot: screenshotPath
        });
        // Return to main page for next iteration
        if (newPage) await newPage.close();
      } catch (e) {
        report.errors.push(`Error processing nav item "${label}": ${e.message}`);
      }
    }

  } catch (err) {
    report.errors.push(err.message);
  } finally {
    await browser.close();
    report.summary.total_pages = report.pages_visited.length;
    report.summary.total_errors = report.errors.length;
    const reportPath = '/tmp/p21-report.json';
    try {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    } catch (e) {
      // ignore write errors
    }
    console.log(JSON.stringify(report, null, 2));
  }
})();
