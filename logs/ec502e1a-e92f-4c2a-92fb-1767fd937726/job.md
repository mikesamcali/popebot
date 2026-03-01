Goal: Find the pull request that was opened by the job branch job/67255709-44be-46a9-b234-2a49b93bf85c.

Steps:
1. Use the GitHub API to list open PRs with a head ref matching the job branch.
2. Query: GET https://api.github.com/repos/$GH_OWNER/$GH_REPO/pulls?head=$GH_OWNER:job/67255709-44be-46a9-b234-2a49b93bf85c
3. Parse the JSON response. If a PR is found, extract its number and URL.
4. Print the PR number and URL to stdout.
5. If no PR is found, print "No PR found for branch job/67255709-44be-46a9-b234-2a49b93bf85c".

Environment variables used: GH_OWNER, GH_REPO.

Use bash with curl and jq to parse the JSON.
