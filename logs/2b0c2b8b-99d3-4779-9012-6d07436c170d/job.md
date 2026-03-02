# Job: Monitor Prophet 21 automation job

**Goal:** Periodically poll the status of job `6b5fbef9-3cc8-4146-8cf9-ad31fa500cb8` and print a concise report to stdout. Stop polling when the job reports a terminal state (completed, failed, cancelled).

**Procedure:**

1. Every 30 seconds run:
   - `get_job_status job_id=6b5fbef9-3cc8-4146-8cf9-ad31fa500cb8`
   - Parse the JSON response.
   - If `running` > 0, print:
     ```
     [<timestamp>] Job is running. Steps completed: <step>
     ```
   - If `completed` > 0, print:
     ```
     [<timestamp>] Job finished successfully. Check output at /tmp/p21-report.json
     ```
   - If `failed` > 0, print:
     ```
     [<timestamp>] Job failed. See logs for details.
     ```
2. Exit the loop once the job is no longer running.