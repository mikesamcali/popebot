Goal: Automate a Prophet 21 ERP session using Playwright, gather navigation data, and output a JSON report.

Steps:
1. Launch Chromium in headless mode with flags: --no-sandbox --ignore-certificate-errors.
2. Navigate to process.env.P21_URL.
3. Locate the username and password fields, fill them with process.env.P21_USERNAME and process.env.P21_PASSWORD, and submit the form.
4. Wait for networkidle. Take a screenshot of the post‑login page and save to /tmp/p21-login.png.
5. Verify login succeeded by ensuring the current URL does not contain "login" or that the page title does not contain "Login".
6. Enumerate all top‑level navigation items visible after login (e.g., links in nav, sidebar, or menu tabs). For each link, record its label (innerText) and href/target.
7. For each nav item:
   a. Click the link (handle new tabs if opened).
   b. Wait for networkidle.
   c. Take a screenshot and save as /tmp/p21-<label>.png (sanitize label to alphanumerics + underscore).
   d. Record label, current URL, page title, and any visible sub‑menu items (innerText of links under the current page).
8. Assemble a report object:
   {
     "login_success": <true|false>,
     "pages_visited": [
       { "label": "...", "url": "...", "title": "...", "sub_items": [...], "screenshot": "/tmp/p21-<label>.png" }
     ],
     "errors": [ ... ],
     "summary": { "total_pages": <count>, "total_errors": <count> }
   }
9. Write the report JSON to /tmp/p21-report.json.
10. Print the JSON to stdout.

Error handling: any exception should be caught and its message pushed into the `errors` array; the corresponding page should still be processed if possible.

Environment variables used: P21_URL, P21_USERNAME, P21_PASSWORD.

Dependencies: Playwright (npm package). The job will run in the Docker container with full root access, so it can install packages and run scripts locally.