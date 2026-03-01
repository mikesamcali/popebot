Goal: Find the pull request that was opened by the job branch job/67255709-44be-46a9-b234-2a49b93bf85c.

Steps:
1. Use curl to query the GitHub API for pull requests with the head ref matching the job branch: https://api.github.com/repos/$GH_OWNER/$GH_REPO/pulls?head=$GH_OWNER:job/67255709-44be-46a9-b234-2a49b93bf85c
2. Include the Authorization header "Bearer $GH_TOKEN" (the GH token is available as an environment variable in the agent container).
3. Pipe the JSON response to jq to extract the first PR's number and html_url.
4. If a PR is found, print "PR #<number>: <html_url>" to stdout.
5. If no PR is found, print "No PR found for branch job/67255709-44be-46a9-b234-2a49b93bf85c".

The job will run a single shell command: `bash -c "<command>"`.
