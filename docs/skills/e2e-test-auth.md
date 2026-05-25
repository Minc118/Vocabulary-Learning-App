# Skill: Safe E2E Test Authentication

## Purpose

Use this skill when automated tests need an authenticated user session.

The goal is to enable API/E2E testing without using the user's personal Google login, personal JWT, or real production account.

Recommended pattern:

```text
Dedicated test account → programmatic sign-in → in-memory access token → authenticated API tests → cleanup test data
```

---

## Core Principle

**Never ask the user for a personal JWT token.**

Use a dedicated test account and local-only credentials.

---

## Safety Rules

1. Never ask the user to paste a personal JWT.
2. Never print access tokens.
3. Never print refresh tokens.
4. Never print passwords.
5. Never print full `Authorization` headers.
6. Never store tokens in files.
7. Never commit test credentials.
8. Never use `VITE_` variables for passwords because frontend variables may be bundled into browser code.
9. Use only dedicated test account credentials from local environment variables or a gitignored env file.
10. Test data must use a unique prefix, such as `E2E_TEST_RUN_<timestamp>`.
11. Cleanup must only delete records created by the current test run.
12. Do not delete real user data.
13. Do not run destructive database commands such as `DROP`, `TRUNCATE`, or broad `DELETE`.
14. Do not change RLS, auth, schema, or environment configuration without approval.

---

## Required Environment Variables

Use local environment variables, shell exports, or a gitignored file such as `.env.e2e`.

```env
E2E_TEST_EMAIL=
E2E_TEST_PASSWORD=
SUPABASE_URL=
SUPABASE_ANON_KEY=
BACKEND_URL=http://127.0.0.1:5001
```

Do not use:

```env
VITE_E2E_TEST_PASSWORD=
VITE_TEST_PASSWORD=
```

Passwords must not be exposed to frontend code.

---

## Recommended `.gitignore` Entries

```gitignore
.env
.env.local
.env.test
.env.e2e
backend/.env.e2e
frontend/.env.e2e
```

---

## Standard Flow

1. Read credentials from environment variables.
2. Validate required variables exist.
3. Sign in through Supabase Auth or the project's auth provider.
4. Store access token only in memory.
5. Call backend APIs with `Authorization: Bearer <token>`.
6. Create isolated test data with a unique test prefix.
7. Verify expected API behavior.
8. Verify relationship/data consistency.
9. Clean up only test-created data in a `finally` block.
10. Report sanitized results.

---

## Test Data Isolation

All test-created data should include a unique prefix:

```text
E2E_TEST_RUN_2026_05_25_153000
```

Examples:

```text
E2E_TEST_RUN_2026_05_25_153000_collection
E2E_TEST_RUN_2026_05_25_153000_word
```

The cleanup logic must only target:

- IDs created during the current test run, or
- records with the exact current test prefix.

Do not clean up by broad user-level deletion.

---

## Recommended Verification Report

```markdown
## E2E Auth Verification Report

### Auth Method
- Dedicated test account

### Secrets Handling
- Tokens were kept in memory only.
- Passwords were not printed.
- Authorization headers were not printed.

### API Endpoints Tested
- ...

### Test Data Prefix
- E2E_TEST_RUN_...

### Assertions
- PASS / FAIL list

### Cleanup
- Created records deleted: Yes / No
- Cleanup method: specific IDs / exact prefix

### Exit Code
- 0 / non-zero

### Remaining Issues
- ...
```

---

## Recommended Agent Prompt

```text
Use the Safe E2E Test Authentication skill.

Goal:
Run authenticated automated tests without using my personal login or JWT.

Use a dedicated test account from local environment variables:
- E2E_TEST_EMAIL
- E2E_TEST_PASSWORD
- SUPABASE_URL
- SUPABASE_ANON_KEY
- BACKEND_URL

Rules:
- Do not ask for my personal JWT.
- Do not print tokens or passwords.
- Do not write tokens to disk.
- Do not commit credentials.
- Use a unique test prefix.
- Clean up only records created by this test run.
- Report sanitized results only.
```

---

## When to Use This Skill

Use this skill for:

- authenticated API tests
- E2E tests requiring login
- Supabase Auth testing
- user-owned data verification
- RLS-sensitive feature testing
- collection/word/review CRUD tests

---

## When Not to Use This Skill

Do not use this skill when:

- no authentication is required
- the user only asks for code explanation
- the task is pure UI styling and can be verified without login
