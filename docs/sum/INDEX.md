# INDEX — ego-memory-anchor Documentation

> After reading these 5 documents, an Agent will understand 99% of the project.

---

## Documentation Map

| Document | Coverage | Purpose |
|----------|----------|---------|
| **PROJECT_OVERVIEW.md** | Mission, tech stack, security rules, git conventions | "What is this project?" |
| **ARCHITECTURE.md** | Database schema, RLS, Storage, Supabase integration | "How is it built?" |
| **FEATURES.md** | Pages, components, sprint breakdown, user flows | "What does it do?" |
| **DESIGN_SYSTEM.md** | Colors, typography, spacing, component specs, accessibility | "How does it look?" |
| **DEVELOPMENT.md** | TDD workflow, testing strategy, debugging, autonomous mode | "How to work on it?" |

---

## Quick Reference

### Test Commands
```bash
pnpm test --run              # Unit tests (221 tests)
pnpm build                   # Production build
pnpm lint                    # ESLint (0 errors, 78 warnings)
npx playwright test --workers=1  # E2E tests (22 tests, 0 skipped)
node scripts/verify-all.mjs    # Backend smoke tests (Service Role)
```

### Key Files
| Path | Purpose |
|------|---------|
| `docs/sum/PROJECT_OVERVIEW.md` | Project constitution summary |
| `docs/sum/ARCHITECTURE.md` | Database & storage design |
| `docs/sum/FEATURES.md` | Feature breakdown |
| `docs/sum/DESIGN_SYSTEM.md` | UI specifications |
| `docs/sum/DEVELOPMENT.md` | Development workflow |
| `docs/v2/CLAUDE.md` | Full project constitution |
| `docs/v2/DESIGN.md` | Full technical blueprint |
| `docs/v2/TASKS.md` | Sprint task list |

### Security Red Lines (NEVER Violate)
1. Never generate synthetic content about deceased
2. Never create tables without RLS
3. Never allow `source_label` modification
4. Never store sensitive data in localStorage
5. Never skip tests before commit
6. Registration must include privacy checkbox
7. Data export must be most prominent in settings

### Critical Architecture Points
- Auth: Supabase + middleware route protection
- Storage: Public buckets with UUID paths + RLS enforcement
- Database: 5 tables (profiles, memories, family_members, reminders, privacy_consents)
- All tables have RLS enabled
- `source_label` immutable via DB trigger

---

## Reading Order (for 99% understanding)

1. **Start here**: `PROJECT_OVERVIEW.md` - What and why
2. **Then**: `ARCHITECTURE.md` - Data model and infrastructure
3. **Then**: `FEATURES.md` - What features exist
4. **Then**: `DESIGN_SYSTEM.md` - How to implement UI
5. **Finally**: `DEVELOPMENT.md` - How to contribute code

---

## For Deep Dives

| Need | Go To |
|------|-------|
| Full technical specs | `docs/v2/DESIGN.md` |
| Sprint task details | `docs/v2/TASKS.md` |
| Product differentiation | `docs/v2/PRODUCT_V2.md` |
| Landing page specs | `docs/v2/LANDING_PAGE_SPEC.md` |
| Compliance requirements | `docs/v2/COMPLIANCE_*.md` |
| UI/UX autonomous guide | `docs/v2/UI-AUTONOMOUS-GUIDE.md` |
