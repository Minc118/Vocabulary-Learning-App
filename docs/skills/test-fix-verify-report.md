# Skill: Test → Fix → Verify → Report Loop

## Purpose

Use this skill when a software project has bugs, unfinished UI flows, broken API behavior, inconsistent UX, suspected regressions, or deployment issues.

The AI agent must not blindly edit code. It must follow a controlled four-phase workflow:

1. Test / Investigate
2. Fix
3. Verify
4. Report

This skill is designed for full-stack projects with frontend, backend, database, authentication, deployment, and AI-agent-assisted development workflows.

---

## Core Principle

**Always investigate before modifying code.**

Do not start coding immediately unless the root cause is already confirmed and the requested change is very small.

---

## Safety Rules

The agent must follow these rules:

1. Do not delete files or folders automatically.
2. Do not run `rm -rf`.
3. Do not run `git reset --hard`.
4. Do not run `git clean`.
5. Do not run `sudo`.
6. Do not run destructive database commands such as `DROP`, `TRUNCATE`, or broad `DELETE`.
7. Do not change database schema unless explicitly approved.
8. Do not change RLS policies unless explicitly approved.
9. Do not change authentication unless explicitly approved.
10. Do not modify environment variables unless explicitly approved.
11. Do not install new dependencies without asking first.
12. Do not ask the user to paste personal JWT tokens.
13. Do not print, log, store, or expose:
    - access tokens
    - refresh tokens
    - JWTs
    - passwords
    - service role keys
    - database URLs
    - client secrets
14. Do not commit or push unless explicitly approved.
15. Keep changes small and focused.
16. Avoid broad refactors unless the user explicitly requests them.
17. Preserve the existing product style, architecture, and naming conventions unless they are the root cause.

---

## Phase 1 — Test / Investigate

Before editing code, inspect the current state.

The agent should identify:

1. Relevant files
2. Current behavior
3. Expected behavior
4. Actual bug location
5. UI flow
6. API flow
7. Data flow
8. Authentication requirements
9. Database relationships
10. Existing tests or test helpers
11. Risks and uncertainties

The agent must answer:

- What is broken?
- Where is it broken?
- Why is it broken?
- What is the smallest safe fix?
- What should not be changed?

The agent must produce an investigation report before editing code.

### Phase 1 Report Format

```markdown
## Investigation Report

### Issue Summary
- ...

### Relevant Files
- ...

### Current Behavior
- ...

### Expected Behavior
- ...

### Root Cause Hypothesis
- ...

### Data / API / UI Flow
- ...

### Minimal Fix Plan
- ...

### Risks / Unknowns
- ...

### Changes Not Needed
- ...
```

---

## Phase 2 — Fix

After the investigation, apply the smallest necessary fix.

Fixing rules:

1. Fix one issue at a time.
2. Do not redesign unrelated UI.
3. Do not refactor unrelated code.
4. Do not introduce unnecessary dependencies.
5. Preserve existing architecture unless clearly broken.
6. Preserve existing product style and UX direction.
7. Prefer using existing APIs, components, utilities, and patterns.
8. If a schema, RLS, auth, environment, or dependency change is needed, stop and ask first.
9. Keep the diff readable and easy to review.

---

## Phase 3 — Verify

After fixing, run verification.

The agent should run safe checks such as:

```bash
npm run build
```

```bash
python3 -m py_compile path/to/file.py
```

```bash
python3 -m unittest discover
```

```bash
curl http://127.0.0.1:<port>/api/health
```

If an E2E test helper exists, use it safely.

Verification should include:

1. Build check
2. Backend syntax check if backend files changed
3. API smoke test if API files changed
4. Affected feature test
5. Regression check for nearby features
6. Security check for secrets
7. Git status check

If authenticated testing is needed:

- Use a dedicated test account.
- Read test credentials only from local environment variables or a gitignored env file.
- Do not print tokens or passwords.
- Do not ask the user for personal JWT tokens.

---

## Phase 4 — Report

The final report must use this structure:

```markdown
## Test–Fix–Verify Report

### Issue Summary
- ...

### Root Cause
- ...

### Files Inspected
- ...

### Files Changed
- ...

### Behavior Before
- ...

### Behavior After
- ...

### Tests / Commands Run
- ...

### Verification Result
- ...

### Not Fully Verified
- ...

### Manual Checks Needed
- ...

### Risks / Remaining Issues
- ...

### Safe to Commit?
- Yes / No, with reason
```

---

## Required Final Checks Before Commit

Before saying "safe to commit", the agent must check:

1. `git status`
2. `git diff --name-only`
3. Build passes
4. Backend syntax checks pass if backend files changed
5. No `.env` files are staged
6. No secrets are present in changed files
7. No unrelated files are modified
8. No generated junk files are included

Search for sensitive strings:

```bash
grep -R "access_token\|refresh_token\|Authorization: Bearer\|service_role\|SUPABASE_SERVICE_ROLE\|GOOGLE_CLIENT_SECRET\|client_secret\|sk-\|E2E_TEST_PASSWORD=" .
```

The agent must not print real secret values.

---

## Recommended Agent Prompt

```text
Use the Test → Fix → Verify → Report skill.

Issue:
[Describe the bug or unfinished behavior here]

Start with Phase 1 only.
Investigate the issue first.
Do not modify code until you have reported the root cause and minimal fix plan.

After approval, apply the smallest safe fix.
Then run verification and provide the final report.

Do not ask for personal JWT tokens.
Do not print secrets.
Do not install dependencies.
Do not change schema, RLS, auth, or env without approval.
Do not commit or push until I approve.
```

---

## When to Use This Skill

Use this skill for:

- broken UI behavior
- API bugs
- database relationship bugs
- authentication-related bugs
- deployment bugs
- regression testing
- unfinished prototype interactions
- inconsistent UI behavior
- E2E test creation
- pre-commit verification

---

## When Not to Use This Skill

Do not use this skill for:

- pure brainstorming
- early product ideation
- writing documentation only
- simple one-line copy changes
- tasks where the user explicitly wants direct implementation without investigation
