#!/usr/bin/env node
/**
 * playwright/eval.js — evaluate JS on a live page
 * Usage: node eval.js <url> <js-expression>
 */
import { chromium } from 'playwright';

const [,, url, expression] = process.argv;
if (!url || !expression) { console.error('Usage: node eval.js <url> <js-expression>'); process.exit(1); }

const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();

await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
const result = await page.evaluate(expression);
console.log(JSON.stringify(result, null, 2));

await browser.close();
