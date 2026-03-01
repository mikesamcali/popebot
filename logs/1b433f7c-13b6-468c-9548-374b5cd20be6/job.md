Goal: Automate a Prophet 21 ERP session using Playwright, gather navigation data, and output a JSON report.

Steps:
1. Create a temporary working directory: `/tmp/p21-automation`.
2. In that directory, run `npm init -y` to create a package.json.
3. Install Playwright: `npm i playwright` and run `npx playwright install --with-deps chromium`.
4. Create a Node script `run.js` in that directory with code that:
   - Launches Chromium in headless mode with flags: `--no-sandbox`, `--ignore-certificate-errors`.
   - Navigates to `process.env.P21_URL`.
   - Fills username and password fields (use selectors like `input[name="username"]` or `input[type="email"]` and `input[type="password"]`), and submits the form (press Enter or click login button).
   - Waits for networkidle.
   - Takes a screenshot to `/tmp/p21-login.png`.
   - Checks if login succeeded by ensuring the URL no longer contains "login" or the page title does not contain "Login".
   - Finds all top‑level navigation items: use selectors like `nav a`, `.sidebar a`, `.menu a`, etc.
   - For each nav item:
     * Retrieve label via innerText and href/target.
     * Click the link (handle new tabs if a new target opens).
     * Wait for networkidle.
     * Take screenshot to `/tmp/p21-<label>.png` (sanitize label: replace non‑alphanumeric characters with underscore).
     * Record label, URL (`page.url()`), title (`page.title()`), and any visible sub‑menu items (collect innerText of sub‑links).
   - Assemble a report object with structure:
     ```json
     {
       "login_success": true/false,
       "pages_visited": [
         { "label": "...", "url": "...", "title": "...", "sub_items": [], "screenshot": "/tmp/p21-<label>.png" }
       ],
       "errors": [],
       "summary": { "total_pages": X, "total_errors": Y }
     }
     ```
   - Write the report JSON to `/tmp/p21-report.json` using `JSON.stringify(report, null, 2)`.
   - Print the JSON to stdout.
5. After script creation, execute it: `node run.js`.
6. Capture any errors: if any step fails, log the error message into `report.errors`.

Implementation notes:
- Use async/await with Playwright.
- Use `page.waitForLoadState('networkidle')` after navigation.
- For new tabs, use `page.waitForEvent('popup')` or check for new pages.
- Sanitize label for filenames: replace non‑alphanumeric characters with underscores.
- Ensure all screenshots are PNG.

The environment variables `P21_URL`, `P21_USERNAME`, `P21_PASSWORD` are available to the Docker agent. This job will create the report at `/tmp/p21-report.json` and print the JSON to stdout. Let me know if this looks good or if you’d like any changes.