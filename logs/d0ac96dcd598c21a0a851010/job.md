# Job Prompt

Goal: Automate a Prophet 21 ERP session using Playwright, gather navigation data, and output a JSON report.

Steps:
1. Launch Chromium in headless mode with flags: `--no-sandbox --ignore-certificate-errors`.
2. Navigate to `process.env.P21_URL`.
3. Find the username and password fields, fill them with `process.env.P21_USERNAME` and `process.env.P21_PASSWORD`, then submit the form.
4. Wait for `networkidle`. Take a screenshot of the logged‑in page and save to `/tmp/p21-login.png`.
5. Verify login succeeded by ensuring the URL or page title no longer indicates “login”.
6. Enumerate all top‑level navigation items visible after login (links in nav, sidebar, or menu tabs). Record each item's label and href/target.
7. For each nav item:
   a. Click the link (handle any new tabs that open).
   b. Wait for `networkidle`.
   c. Take a screenshot and save as `/tmp/p21-<label>.png` (sanitize `<label>` to alphanumerics+underscore).
   d. Record label, current URL, page title, and any visible sub‑menu items (innerText of sub‑links).
8. Assemble a report object:
```json
{
  "login_success": <true|false>,
  "pages_visited": [
    { "label": "...", "url": "...", "title": "...", "sub_items": [...], "screenshot": "/tmp/p21-<label>.png" }
  ],
  "errors": [...],
  "summary": { "total_pages": <count>, "total_errors": <count> }
}
```
9. Write the report JSON to `/tmp/p21-report.json`.
10. Print the JSON to stdout.

Error handling: catch any exception, push its message into the `errors` array, and continue if possible.

Environment variables used: `P21_URL`, `P21_USERNAME`, `P21_PASSWORD`.

Dependencies: Playwright (npm package). The job will install Playwright locally in the container.

**Implementation notes for the Pi coding agent:**
- Use Node.js script with Playwright (`npm install playwright`).
- Ensure the script runs with `node script.js` inside the job container.
- The script should create any needed directories (`/tmp`).
- Include robust try/catch blocks and populate the `errors` array.
- At the end, `console.log(JSON.stringify(report, null, 2));`.
