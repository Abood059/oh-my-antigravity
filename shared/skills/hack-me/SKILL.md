---
name: hack-me
description: Attack the user's own running app on localhost, prove each vulnerability with a real request, report findings to the Coordinator for patching, then re-verify and sweep for the same bug on paths no probe touched.
---

# Hack Me

Prove the app's vulnerabilities against itself on localhost. Instead of telling the Coordinator the code has an IDOR, demonstrate it with a real request, hand the finding off for patching, then re-verify once the fix lands.

## Scope — Enforce Before Any Request

This skill runs only against an app the user owns and is running locally.

- Target must be local. `localhost`, `127.0.0.1`, `::1`, or a private dev host the user names. If a target resolves to a public IP or a domain the user does not own, stop and say why.
- Non-destructive proofs only. Prove read access by reading one record that should not be readable. Prove a write bug by writing to a throwaway or seeded record. Never delete data. Never mass-mutate. Never exfiltrate real user data. Redact anything sensitive you surface as proof.
- No DoS. Demonstrate a missing rate limit with a small, bounded burst (about 20 requests) and describe the risk. Do not flood.
- This is authorized pentesting of the user's own code. It is not for third-party systems, detection evasion, or persistent tooling. If the request drifts there, decline.

State the scope back to the user and get explicit approval before the first request.

## Workflow

### 1. Map

Find the app's routes and handlers and how it runs: framework, port, start command, whether seed or test users exist. Ask the user for the base URL and, if needed, two test accounts (attacker and victim). Never use real credentials beyond a local dev login.

### 2. Prioritize

Pick the vulnerability classes the app is actually exposed to. Order by likelihood multiplied by impact. Broken access control and missing auth come first — they are the most common and the easiest to prove.

The classes to consider:

- Broken access control (IDOR, missing auth, client-side trust)
- Injection (SQL, command, template)
- Cross-site scripting (reflected, stored)
- Server-side request forgery (SSRF)
- Mass assignment
- Sensitive data exposure
- Missing rate limiting

### 3. Probe, One Class at a Time

For each candidate class, craft the minimal request that would succeed only if the bug exists. Use `curl` or any HTTP client against localhost.

Examples of proofs (adapt to the app):

- **IDOR:** log in as user A, request user B's object id. If B's data is returned, it is real.
- **Missing auth:** call the endpoint with no session or token. If it returns data, it is real.
- **Client trust:** replay the request with `amount`, `role`, or `isAdmin` edited. If the server honors it, it is real.
- **Injection:** send a single benign marker (`' OR '1'='1` on a seeded row, or `<b>xss</b>` reflected). Enough to show the sink. Never a destructive payload.
- **SSRF:** point a user-URL field at `http://127.0.0.1:<internal>` or a metadata IP. If it fetches, it is real.

### 4. Report Each Finding

Report each finding to the Coordinator. Include:

- What you sent (the exact request).
- What came back (redacted as needed).
- Why it is a vulnerability.
- Which class it belongs to.
- Severity.

Show the actual request and response so the finding is undeniable. Do not patch. The implementation team owns the fix.

### 5. Re-Verify After Patch

After the Coordinator confirms the implementation team has patched the finding, re-run the exact same probe. The finding is not closed until the original exploit fails — it must now return `401`, `403`, `404`, or a validation error.

If the probe still succeeds, report back to the Coordinator. The patch is incomplete.

### 6. Sweep for the Same Bug Elsewhere

This step is skipped too often, and it is where fixes leak. A passing re-verify proves the request you sent is dead. It does not prove the class is gone.

Before closing a finding, search the code for the same pattern on paths no probe touched:

- **Sibling branches in the same function.** A second database backend, a second content type, an `if/else` that builds the same query twice.
- **The same resource under a different method.** Ownership checked on `GET`, forgotten on `PATCH` or `DELETE`.
- **Duplicated handlers.** `/api/v1` and `/api/v2`, admin and public copies.
- **Non-HTTP entry points.** CLI commands, cron jobs, queue consumers, and webhooks that reach the same sink while bypassing the route's auth.

Report each additional instance to the Coordinator for patching. Then re-verify the same way as step 5.

Be precise about evidence. A path you fixed but could not reach with a request is "same pattern, fixed, not separately proven" — never report it as verified.

### 7. Summarize

Return a short table to the Coordinator:

| Finding | Class | Severity | Status |
|---|---|---|---|
| ... | ... | ... | proven & closed / re-verify pending / same pattern, not separately proven / needs-owner-decision |

Note anything you could not safely test locally, and anything the sweep found that you could not reach with a request.

## Output Style

Lead with the most severe confirmed finding, with its request and response. Be concrete, not alarmist. Every claim must be backed by a request the user can re-run.
