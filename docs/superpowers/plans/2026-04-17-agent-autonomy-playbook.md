# Agent Autonomy Playbook — Final Consolidation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidate auto-A and auto-B research into a single authoritative report; complete the remaining uncommitted infrastructure work; update docs to reflect reality.

**Architecture:** Merge A (infrastructure/CI-first) and B (Claude Code integration/hooks-first) into a unified playbook. Execute only the remaining gaps.

**Tech Stack:** Playwright MCP, Claude Code Hooks, GitHub Actions, pgTAP, Hurl, Supabase Service Role scripts, Vitest, Playwright.

---

## Context

Two Claude Opus 4.7 agents researched the project (planning/v2/auto-A.md and auto-B.md). After cross-checking every conclusion against current repo state, the picture is:

- **G1 (Playwright MCP): ALREADY DONE** — `.mcp.json` created, uncommitted
- **G2 (pre-commit hook): ALREADY DONE** — `.git/hooks/pre-commit` exists, runs `pnpm test --run && pnpm lint`
- **G4 (ESLint): ALREADY DONE** — `eslint.config.mjs` exists with flat config
- **E2E seed fixture: ALREADY DONE** — `tests/e2e/fixtures/seed.ts` created, uncommitted
- **verify-*.mjs scripts: 8/8 DONE** — 5 scripts modified (uncommitted), 3 already committed
- **ego-drive skill: ALREADY DONE** — `.claude/commands/ego-drive.md` created, untracked

**The gap is not "what to build" — it's that nothing was committed.**

The plan is: (1) commit the infrastructure, (2) produce the final report doc, (3) update AUTONOMOUS_WORKFLOW.md to match reality.

---

## Fact-Check Matrix

| Conclusion | Source | Verdict | Current State |
|---|---|---|---|
| "没有 Playwright MCP" | auto-B | **WRONG** | `.mcp.json` exists, uncommitted |
| "没有 pre-commit hook" | my original audit | **WRONG** | `.git/hooks/pre-commit` exists (git-native), uncommitted |
| "没有 ESLint" | my original audit | **WRONG** | `eslint.config.mjs` exists, committed |
| "ESLint not configured" | auto-A §G4 | **WRONG** | flat config with nextVitals + nextTs, committed |
| "E2E 没有 seed 数据" | auto-A §G5 | **WRONG** | `seed.ts` created, uncommitted |
| "axe-core 没有" | auto-B | **WRONG** | Used in `tests/e2e/core-flows.spec.ts` for 5 pages |
| "只覆盖 5 条流程" | auto-B | **OUTDATED** | 22 tests now (was 15), 0 skipped |
| "没有 CI/CD" | auto-A §G3 | **TRUE** | `.github/workflows/` still missing |
| "没有 pgTAP" | auto-A §G3 | **TRUE** | `supabase/tests/` still missing |
| "需要 Hooks" | auto-B §P0 | **PARTIAL** | `.claude/settings.local.json` has permissions but no PostToolUse hooks configured |
| "需要 /ego-drive skill" | auto-A §3.3 | **DONE** | Created, uncommitted |
| "verify-*.mjs 系统化" | auto-A §3.2 | **DONE** | 8 scripts exist, 5 uncommitted |
| "playwright trace 弱" | auto-A §5.3 | **TRUE** | `trace: 'on-first-retry'` → should be `retain-on-failure` |
| "需要 Hurl API 测试" | auto-B §3.1 | **DEFER** | Solo founder, YAGNI — verify-*.mjs covers API validation |
| "需要 browser-use" | auto-B §3.2 | **DEFER** | Playwright MCP sufficient for MVP |

---

## Task 1: Commit All Uncommitted Infrastructure

**Files:** (all currently modified or untracked in working tree)

- Commit 1 of 3 — Infrastructure scaffolding:
```
git add .mcp.json
git commit -m "feat(infra): add Playwright MCP configuration"
```

- Commit 2 of 3 — Pre-commit hook (git-native, not husky):
```
git add .git/hooks/pre-commit
git commit -m "feat(infra): add git-native pre-commit hook running tests and lint"
```

- Commit 3 of 3 — E2E seed + verify scripts + ego-drive skill:
```
git add tests/e2e/fixtures/seed.ts \
  scripts/verify-auth.mjs \
  scripts/verify-export.mjs \
  scripts/verify-memory-upload.mjs \
  scripts/verify-profile-crud.mjs \
  scripts/verify-reminder.mjs \
  .claude/commands/ego-drive.md
git commit -m "feat(test): add E2E seed fixture and backend verify scripts"
```

- [ ] Run `git log --oneline -5` to confirm 3 new commits

---

## Task 2: Upgrade Playwright Trace Config

**Files:**
- Modify: `playwright.config.ts`

- [ ] **Read current config**

```typescript
// Current (line ~20):
trace: 'on-first-retry',
```

- [ ] **Change to:**

```typescript
trace: 'retain-on-failure',
screenshot: 'only-on-failure',
video: 'retain-on-failure',
```

- [ ] **Commit**

```bash
git add playwright.config.ts
git commit -m "fix(e2e): retain Playwright traces and video on failure"
```

---

## Task 3: Configure Claude Code PostToolUse Hook

**Files:**
- Modify: `.claude/settings.local.json`

The hook should auto-format with Prettier after editing `.ts/.tsx` files (already partially configured per typescript/hooks.md rule, but verify it's active).

- [ ] **Read current `.claude/settings.local.json`**

```json
{
  "permissions": {
    ...
  }
}
```

- [ ] **Add PostToolUse hook block:**

```json
{
  "permissions": { ... },
  "hooks": {
    "PostToolUse": {
      "edit": {
        "post": ["prettier --write"]
      }
    }
  }
}
```

Note: This requires verifying the hook actually fires. Run a test edit and confirm Prettier formats the file.

- [ ] **Commit**

```bash
git add .claude/settings.local.json
git commit -m "feat(claude): add PostToolUse prettier hook for TS/TSX files"
```

---

## Task 4: Create Minimal GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

This is the only genuinely missing piece from the infrastructure plan.

- [ ] **Write the workflow file:**

```yaml
name: CI

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run unit tests
        run: pnpm test --run

      - name: Run lint
        run: pnpm lint

      - name: Run E2E tests
        run: pnpm playwright test --workers=1
```

- [ ] **Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for CI/CD gate"
```

---

## Task 5: Create pgTAP RLS Test Scaffold (Optional P1)

**Files:**
- Create: `supabase/tests/rls.test.sql`
- Create: `supabase/tests/setup.sql`

This is the most debated item: pgTAP is powerful but requires `pg_prove` in the CI environment. Auto-A recommends it; Auto-B defers it.

- [ ] **Write `supabase/tests/setup.sql`:**

```sql
-- Supabase pgTAP test setup
-- Requires: pgTAP extension enabled in Supabase
\i pg_prove --version  # just to verify
```

Actually, write a real scaffold:

```sql
-- supabase/tests/rls.test.sql
-- RLS policy tests for core tables
BEGIN;

SELECT plan(1);

-- Test: memories are only visible to profile owner and family members
SELECT lives_ok(
  $$
  SELECT FROM memories
  WHERE profile_id = 'test-profile-uuid'
  LIMIT 1
  $$,
  'memories table is accessible'
);

-- Test: profiles RLScovers the authenticated user
SELECT is(
  (SELECT COUNT(*) FROM profiles WHERE user_id = current_setting('request.jwt.claims', true)::json->>'sub'),
  1,
  'Authenticated user can see their own profile'
);

SELECT * FROM finish();
ROLLBACK;
```

- [ ] **Commit (if doing this task):**

```bash
git add supabase/tests/rls.test.sql supabase/tests/setup.sql
git commit -m "test(db): add pgTAP RLS test scaffold"
```

Note: Skip this task if CI cannot install `pg_prove`. Can do later.

---

## Task 6: Write Final Consolidation Report

**Files:**
- Create: `docs/v2/AGENT_AUTONOMY_PLAYBOOK.md`

This is the primary deliverable — replaces the speculative `docs/AUTONOMOUS_WORKFLOW.md` with a fact-grounded document.

- [ ] **Write report with these sections:**

1. **Fact-Check Summary** — table of auto-A/auto-B claims vs. reality
2. **What's Done** — .mcp.json, pre-commit, ESLint, seed fixture, verify scripts, ego-drive
3. **What's Left** — GitHub Actions CI, Playwright trace upgrade, PostToolUse hook
4. **Verified Tools** — complete inventory of what the agent can actually do today
5. **自愈循环** — the verified implementation of the self-healing test loop
6. **What to defer** — Hurl, browser-use, Stagehand, pgTAP scaffold (with reasons)

- [ ] **Commit**

```bash
git add docs/v2/AGENT_AUTONOMY_PLAYBOOK.md
git commit -m "docs: add AGENT_AUTONOMY_PLAYBOOK consolidating auto-A/B findings"
```

---

## Task 7: Update AUTONOMOUS_WORKFLOW.md

**Files:**
- Modify: `docs/AUTONOMOUS_WORKFLOW.md`

Remove speculative claims (§4.2 about puppeteer_* which was never installed), update to reflect actual state (.mcp.json installed, verify-*.mjs scripts exist).

- [ ] **Commit**

```bash
git add docs/AUTONOMOUS_WORKFLOW.md
git commit -m "docs: update AUTONOMOUS_WORKFLOW to reflect actual tooling"
```

---

## Verification

After all tasks:

- [ ] `git log --oneline -12` should show 6+ new commits from this plan
- [ ] `pnpm test --run` → 221 passed
- [ ] `pnpm lint --max-warnings=0` → 0 errors
- [ ] `pnpm playwright test --workers=1` → all pass
- [ ] `ls .github/workflows/ci.yml` → file exists
- [ ] `cat .mcp.json` → `playwright` MCP declared
- [ ] `.git/hooks/pre-commit` → exists and runs test+lint
- [ ] GitHub Actions CI green on first push

---

## What NOT To Do (YAGNI)

- ~~Hurl API contract testing~~ — verify-*.mjs covers this
- ~~browser-use exploratory testing~~ — Playwright MCP sufficient
- ~~Stagehand AI selectors~~ — YAGNI for MVP
- ~~Percy visual regression~~ — wait for UI stability
- ~~Vercel Agent ($0.3/pr)~~ — public beta, not yet needed
- ~~husky~~ — git-native hook already works
- ~~lint-staged~~ — pre-commit already blocks on failure

---

## Summary

| Item | Status Before | Action |
|---|---|---|
| Playwright MCP | `.mcp.json` exists, uncommitted | Commit |
| pre-commit hook | `.git/hooks/pre-commit` exists, uncommitted | Commit |
| ESLint | `eslint.config.mjs` exists, committed | None |
| E2E seed | `seed.ts` exists, uncommitted | Commit |
| verify-*.mjs | 8 scripts done, 5 uncommitted | Commit |
| ego-drive skill | Created, uncommitted | Commit |
| GitHub Actions CI | Missing | Create |
| Playwright trace | `on-first-retry`, should be `retain-on-failure` | Fix |
| Claude Code hooks | permissions only, no PostToolUse | Add |
| Final report doc | Missing | Create |
| AUTONOMOUS_WORKFLOW.md | Outdated | Update |

**Estimated total work: ~1-2 hours, all infrastructure, no business code.**
