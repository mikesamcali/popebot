Write a script that scans the `logs/` directory, lists the most recent job directories sorted by modification time, and prints a summary for the last 5 completed jobs. For each job, output:
1. Job ID (directory name)
2. Last modified timestamp (ISO format)
3. First line of the `job.md` file (the original prompt).
4. First line of the `<JOB_ID>.jsonl` session log (the first message from Pi).

The script should write the summary to `reports/job-history.md` in markdown format and also print it to stdout. It should be idempotent and not modify any other files. Use only built‑in shell utilities (bash, ls, head, tail, date, etc.).

Once the script runs, commit the new `reports/job-history.md` file and push it back to the repository with a commit message "Generate job history report".