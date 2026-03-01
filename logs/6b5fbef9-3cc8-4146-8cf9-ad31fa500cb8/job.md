# Job: Automate Prophet 21 ERP navigation and reporting

**Goal:** Launch a headless Chromium browser (no‑sandbox, ignore‑certificate‑errors), log in to Prophet 21 using the credentials stored in the environment, enumerate the top‑level navigation menu items, visit each one (handling new tabs), capture screenshots, collect page data, and write a JSON report to `/tmp/p21-report.json`. Finally, print the JSON to stdout.

**Environment variables used:**
- `P21_URL` – the ERP login URL
- `P21_USERNAME` – login username
- `P21_PASSWORD` – login password

**Procedure (via the Playwright skill):**

1. **Launch browser**
   - Use `playwright launch chromium --no-sandbox --ignore-certificate-errors --headless`.
2. **Navigate to login**
   - `playwright goto ${P21_URL}`
   - Find username/password fields (e.g., selectors `input[name="username"]` and `input[name="password"]`), fill with `${P21_USERNAME}` / `${P21_PASSWORD}`, and submit.
   - Wait for `networkidle`. Take a screenshot to `/tmp/p21-login.png`.
   - Verify login succeeded by checking the new page’s URL does not contain `/login` and the page title changes.
3. **Enumerate top‑level navigation**
   - Locate navigation containers (e.g., `nav`, `.sidebar`, `.top-menu`). For each visible `<a>` or button, capture its text (`label`) and `href`/`target` (or use `page.evaluate` to get the URL from `onclick` if necessary).
   - Store this list as `navItems`.
4. **Visit each section**
   - For each item in `navItems`:
     - Click the link (use `page.click` and await navigation). If clicking opens a new tab, switch to it.
     - Wait for `networkidle`.
     - Take a screenshot to `/tmp/p21-${label}.png` (sanitize the label for filename).
     - Record: `label`, current `url`, `title`, and any visible sub‑menu items (captured similarly as in step 3).
     - Close the tab if it’s a new one and return to the original page.
5. **Output results**
   - Build a JSON object:
     ```json
     {
       "login_success": true,
       "pages_visited": [ … ],
       "errors": [ … ],
       "summary": { "total_pages": N, "total_errors": M }
     }
     ```
   - Write it to `/tmp/p21-report.json` and print the JSON to stdout.

**Notes:**
- All paths are relative to the job’s working directory; `/tmp` is accessible for temporary files.
- The job will run with full root access inside the Docker container, so no further permissions are needed.
- If any element selectors differ, the Playwright skill will attempt to use best‑effort fallback strategies (e.g., text matching).