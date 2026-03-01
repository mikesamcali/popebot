#!/usr/bin/env node
/**
 * playwright/screenshot.js — quick full-page screenshot
 * Usage: node screenshot.js <url> <output-path>
 */
import { chromium } from 'playwright';

const [,, url, outputPath = '/tmp/screenshot.png'] = process.argv;
if (!url) { console.error('Usage: node screenshot.js <url> [output-path]'); process.exit(1); }

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await page.screenshot({ path: outputPath, fullPage: true });
console.log(`Screenshot saved: ${outputPath}`);
console.log(`Title: ${await page.title()}`);
console.log(`URL: ${page.url()}`);

await browser.close();
