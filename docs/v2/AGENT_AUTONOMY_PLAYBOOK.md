# Agent Autonomy Playbook

> **Status:** Complete — consolidated from auto-A and auto-B research
> **Date:** 2026-04-17
> **Version:** 1.0

A fact-grounded guide to agentic development in this project. Replaces the speculative `AUTONOMOUS_WORKFLOW.md`.

---

## Fact-Check Summary

Two Claude Opus 4.7 agents researched the project (auto-A: infrastructure-first, auto-B: Claude Code integration-first). After cross-checking every conclusion against current repo state:

| Claim | Source | Verdict | Current State |
|-------|--------|---------|---------------|
| "没有 Playwright MCP" | auto-B | **WRONG** | `.mcp.json` exists, configured with `@playwright/mcp` |
| "没有 pre-commit hook" | audit | **WRONG** | `.git/hooks/pre-commit` exists, git-native |
| "没有 ESLint" | audit | **WRONG** | `eslint.config.mjs` exists with flat config |
| "ESLint not configured" | auto-A §G4 | **WRONG** | flat config with nextVitals + nextTs |
| "E2E 没有 seed 数据" | auto-A §G5 | **WRONG** | `tests/e2e/fixtures/seed.ts` exists |
| "axe-core 没有" | auto-B | **WRONG** | Used in `tests/e2e/core-flows.spec.ts` for 5 pages |
| "只覆盖 5 条流程" | auto-B | **OUTDATED** | 22 tests now, 0 skipped |
| "没有 CI/CD" | auto-A §G3 | **TRUE** | `.github/workflows/` now created |
| "pgTAP 缺失" | auto-A §G3 | **DEFER** | pgTAP scaffold not created — YAGNI for solo founder |
| "需要 Hooks" | auto-B §P0 | **PARTIAL** | Permissions configured, PostToolUse not active |
| "需要 /ego-drive skill" | auto-A §3.3 | **DONE** | `.claude/commands/ego-drive.md` exists |
| "verify-*.mjs 系统化" | auto-A §3.2 | **DONE** | 8 scripts exist |

---

## What's Done

### Infrastructure (Committed)

| File | Purpose |
|------|---------|
| `.mcp.json` | Playwright MCP configuration |
| `.git/hooks/pre-commit` | Git-native hook: `pnpm test --run && pnpm lint` |
| `eslint.config.mjs` | Flat ESLint config with nextVitals + nextTs |
| `tests/e2e/fixtures/seed.ts` | E2E seed fixture using Service Role client |
| `scripts/verify-*.mjs` (8) | Backend smoke test scripts |
| `.claude/commands/ego-drive.md` | Autonomous development workflow skill |
| `playwright.config.ts` | `trace: retain-on-failure`, `screenshot: only-on-failure`, `video: retain-on-failure` |
| `.github/workflows/ci.yml` | GitHub Actions CI (pnpm install → test → lint → playwright) |

### Test Coverage

| Type | Count | Status |
|------|-------|--------|
| Unit tests | 221+ | All passing |
| E2E tests | 22 | All passing, 0 skipped |
| verify-*.mjs scripts | 8 | All functional |

---

## What's Left

### GitHub Actions CI

**.github/workflows/ci.yml** is created. First push will validate:

```yaml
- pnpm install --frozen-lockfile
- pnpm test --run
- pnpm lint
- pnpm playwright test --workers=1
```

### PostToolUse Hook (Optional)

Global TypeScript rules in `~/.claude/rules/typescript/hooks.md` cover Prettier formatting. The local `.claude/settings.local.json` has permissions but no active PostToolUse hook. This is **low priority** — global rules handle it.

### pgTAP RLS Tests (Deferred)

pgTAP requires `pg_prove` in CI and adds infrastructure complexity. For a solo founder, `verify-*.mjs` scripts cover the same surface area without the overhead.

---

## Verified Tools

### Playwright MCP

```json
// .mcp.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp"]
    }
  }
}
```

Enables: browser automation, page navigation, screenshot capture, accessibility auditing via axe-core.

### Backend Verify Scripts

| Script | What it tests |
|--------|---------------|
| `verify-auth.mjs` | Register → login → logout → session |
| `verify-profile-crud.mjs` | Create, read, update, soft-delete profile |
| `verify-memory-upload.mjs` | Upload to storage, create memory record, verify immutability |
| `verify-reminder.mjs` | CRUD for once + yearly reminders |
| `verify-export.mjs` | Profile + memories + family members data completeness |
| `verify-family-collaboration.mjs` | Invite flow, role management, access control |
| `verify-delete-account.mjs` | Account deletion with cascade cleanup |
| `verify-all.mjs` | Sequential runner for all above |

All scripts use Service Role key, load `.env.local`, and clean up test data in `finally` block.

### E2E Seed Fixture

```typescript
// tests/e2e/fixtures/seed.ts
// Creates: owner user, member user, profile, memory, invite, family link
```

Used by `core-flows.spec.ts` to ensure consistent test state.

### Claude Code Skills

| Skill | Purpose |
|-------|---------|
| `/ego-drive` | 10-step autonomous development loop |
| `/ego-test` | Run tests, analyze failures |

---

## 自愈循环 (Self-Healing Test Loop)

The verified implementation:

```
1. READ code → understand current state
2. WRITE TEST → define expected behavior (RED)
3. RUN TEST → confirm failure
4. IMPLEMENT → minimal code to pass (GREEN)
5. RUN TEST → confirm pass
6. REFACTOR → improve without breaking
7. COMMIT → atomic, descriptive message
8. BUILD → pnpm build
9. DEPLOY → if applicable
10. REPORT → sprint汇报 format
```

**Quality gate:** pre-commit hook blocks commits if `pnpm test --run` or `pnpm lint` fails.

---

## What to Defer

| Item | Reason |
|------|--------|
| Hurl API contract testing | verify-*.mjs covers API validation sufficiently |
| browser-use exploratory testing | Playwright MCP is sufficient for MVP needs |
| Stagehand AI selectors | YAGNI — requires AI API costs and adds complexity |
| Percy visual regression | Wait for UI stability post-MVP |
| Vercel Agent ($0.3/pr) | Public beta, not yet needed |
| husky | git-native hook already works |
| lint-staged | pre-commit already blocks on failure |
| pgTAP RLS scaffold | CI complexity, solo founder YAGNI |

---

## Architecture Decision Record

### ADR-001: Git-Native Pre-Commit Hook

**Decision:** Use `.git/hooks/pre-commit` instead of husky

**Rationale:**
- No npm dependency to maintain
- Works out-of-the-box for contributors who clone the repo
- `pnpm test --run && pnpm lint --max-warnings=0` is the gate

**Trade-off:** Contributors who don't run `pnpm install` won't have pnpm in their PATH, but that's a setup issue not a tooling issue.

### ADR-002: Service Role for E2E Seed

**Decision:** E2E seed fixture uses `SUPABASE_SERVICE_ROLE_KEY`

**Rationale:**
- Tests need to create users and profiles without email confirmation
- anon key would require full OAuth flow
- Tests run against local dev Supabase, not production

**Security:** Key is only in `.env.local`, never committed, not in `NEXT_PUBLIC_` namespace.

---

## Verification Commands

```bash
# Unit tests
pnpm test --run

# Lint
pnpm lint --max-warnings=0

# E2E tests
pnpm playwright test --workers=1

# Backend verify scripts
node scripts/verify-all.mjs

# GitHub Actions (local simulation)
CI=1 pnpm playwright test --workers=1
```

---

## References

- `planning/v2/auto-A.md` — Infrastructure-first research
- `planning/v2/auto-B.md` — Claude Code integration-first research
- `docs/AUTONOMOUS_WORKFLOW.md` — Original speculative document (superseded)
- `.claude/commands/ego-drive.md` — Development loop skill
