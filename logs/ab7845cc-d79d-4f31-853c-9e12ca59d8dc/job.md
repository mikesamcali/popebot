Goal: Find the pull request that was opened by the job branch job/67255709-44be-46a9-b234-2a49b93bf85c.

Steps:
1. Use `curl` to query the GitHub API for PRs with the head ref `job/67255709-44be-46a9-b234-2a49b93bf85c`:
   https://api.github.com/repos/$GH_OWNER/$GH_REPO/pulls?head=$GH_OWNER:job/67255709-44be-46a9-b234-2a49b93bf85c
2. Pass the `Authorization: Bearer $GH_TOKEN` header (the container has `$GH_TOKEN`).
3. Pipe the JSON response to a short Python one‑liner that prints:
   • “PR #<number>: <html_url>” if a PR is found
   • “No PR found for branch job/67255709-44be-46a9-b234-2a49b93bf85c” if the array is empty.
4. Run the whole command in a single shell invocation:  
   ```bash
   bash -lc "curl -H \"Authorization: Bearer $GH_TOKEN\" -s https://api.github.com/repos/$GH_OWNER/$GH_REPO/pulls?head=$GH_OWNER:job/67255709-44be-46a9-b234-2a49b93bf85c | python3 - <<'PY'
import sys, json
prs=json.load(sys.stdin)
if prs:
    print(f'PR #{prs[0][\"number\"]}: {prs[0][\"html_url\"]}')
else:
    print('No PR found for branch job/67255709-44be-46a9-b234-2a49b93bf85c')
PY"
   ```
