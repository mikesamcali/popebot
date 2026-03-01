Goal: Automate a Prophet 21 ERP session with Playwright, collect navigation data, and output a JSON report.

Steps:
1. Create a temporary working directory: /tmp/p21-automation.
2. In that directory:
   a. Run `npm init -y` to create a package.json.
   b. Install Playwright: `npm i playwright@latest` and run `npx playwright install --with-deps chromium`.
3. Write a Node script (`run.js`) that:
   • Launches Chromium headlessly with `--no-sandbox --ignore-certificate-errors`.
   • Navigates to process.env.P21_URL.
   • Locates the username and password fields, fills them with process.env.P21_USERNAME / P21_PASSWORD, and submits the form.
   • Waits for `networkidle` and takes a screenshot to `/tmp/p21-login.png`.
   • Confirms login succeeded by checking that the URL or title no longer contains “login”.
   • Enumerates all top‑level navigation links (e.g., `nav a`, `.sidebar a`, `.menu a`), recording each link’s label and href.
   • For each nav link:
        – Click the link (handle new tabs via `page.waitForEvent('popup')` if needed).
        – Wait for `networkidle`.
        – Take a screenshot to `/tmp/p21-<label>.png` (sanitize <label> to alphanumerics+underscore).
        – Record label, current URL, page title, and any visible sub‑menu links’ innerText.
   • Assemble a report object:
        {
          "login_success": true/false,
          "pages_visited": [
            { "label": "...", "url": "...", "title": "...", "sub_items": [...], "screenshot": "/tmp/p21-<label>.png" }
          ],
          "errors": [...],
          "summary": { "total_pages": <count>, "total_errors": <count> }
        }
   • Write the report to `/tmp/p21-report.json` (pretty‑printed JSON) and print the JSON to stdout.
4. Catch any exception, push its message into the `errors` array, and continue if possible.
5. After script completion, exit.

Environment variables used: P21_URL, P21_USERNAME, P21_PASSWORD.
Dependencies: Playwright (installed locally in the container). The container has full root access and can run `npm` and `bash`.

This job will produce `/tmp/p21-report.json` and print the final JSON to stdout when finished.