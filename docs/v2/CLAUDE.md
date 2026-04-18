# CLAUDE.md — ego-memory-anchor V2 项目宪法

## 项目概述
ego-memory-anchor（忆锚）是一款面向丧亲/丧宠人群的真实记忆聚合平台。
核心理念：守护真实记录，对抗第二重丧失。绝不生成合成内容。
忆锚不是网盘——它是一个人（或一只宠物）的数字纪念空间。
MVP 形态：中文 Web 应用（PWA-ready），海外部署优先。

## 产品差异化要点（开发时必须理解）
- 每个"档案"不是文件夹，是一个人的生命空间——有生命摘要、享年、家人动态、纪念日倒计时
- 每条"记忆"不是文件，是素材+时间锚点+家人故事+不可变的"原始记录"标记
- 家庭协作是增长引擎（P0），不是附加功能
- 数据导出按钮放在设置页最显眼位置——这是信任设计
- 纪念仪式（蜡烛、横幅、"这天的记忆"）是差异化核心

## V2 参考文档

开发时需要同时参考 `docs/v2/` 下的以下文档：
- `PRODUCT_V2.md` — 差异化产品设计
- `DESIGN.md` — 技术蓝图
- `TASKS.md` — 开发任务（Sprint 顺序见此）
- `LANDING_PAGE_SPEC.md` — Landing Page 完整设计规格
- `MARKETING.md` — 冷启动与增长
- `CHANGELOG.md` — V1→V2 变更记录
- **`UI-AUTONOMOUS-GUIDE.md`** — UI/UX Agent 自主开发准则（Stitch 驱动）

## 技术栈（不可更改）
- **框架**: Next.js 15 (App Router, Server Components by default)
- **语言**: TypeScript (strict mode)
- **样式**: Tailwind CSS 4 + shadcn/ui (stone 暖色主题)
- **后端**: Supabase (Auth + Postgres + Storage + RLS + Edge Functions)
- **测试**: Vitest + React Testing Library + Playwright
- **部署**: Vercel（海外，面向海外华人；国内版本后续迁移）
- **包管理**: pnpm
- **关键库**: exifr (EXIF), jszip (微信导入), @tanstack/react-virtual (虚拟滚动), lunar-javascript (农历)

## 编码规范

### 通用规则
- 所有文件名、变量名、函数名、组件名使用英文
- UI 面向用户的文字使用中文
- 注释使用英文
- 每个文件不超过 300 行，超过则拆分
- 禁止 any 类型，必须显式类型定义
- 使用 path aliases: `@/components`, `@/lib`, `@/types`

### React/Next.js 规则
- 默认使用 Server Components，仅在需要交互时用 'use client'
- 数据获取使用 Server Components + Supabase server client
- 表单处理使用 Server Actions + useActionState (React 19)
- 客户端状态管理仅用 React useState/useReducer，不引入外部状态库
- 所有页面实现 loading.tsx 和 error.tsx

### Supabase 规则
- 所有表必须有 RLS 策略，禁止 public 访问
- 使用 Supabase 的 createServerClient (server) 和 createBrowserClient (client)
- 文件上传到 Supabase Storage，memories bucket 设为 public（UUID 路径不可猜测）
- avatars bucket 设为 public
- Storage 路径规范: `{profile_id}/{memory_id}/{uuid}.{ext}`
- 原始文件名保存在数据库 memories.file_name，Storage 中使用 UUID 文件名
- 数据库 migration 文件放在 supabase/migrations/ 目录

### Storage URL 规则（重要！防止 Bug！）
- **必须**使用 `lib/utils/storage-urls.ts` 中的工具函数构造 URL
  - `getMemoryFileUrl(path)` - memories bucket 文件
  - `getAvatarFileUrl(path)` - avatars bucket 文件
- **禁止**在组件内联构造 storage URL（如 `${SUPABASE_URL}/storage/...`）
- **禁止**在多个地方重复相同的 URL 构造逻辑

原因：之前 MemoryDetail 缺少 bucket 前缀导致照片 404，
统一使用工具函数可以确保一致性和可维护性。

### 测试规则
- 每个工具函数（lib/utils/*）必须有单元测试
- 每个 Server Action 必须有集成测试
- 每个页面组件必须有基本渲染测试
- 测试文件与源文件同目录，命名 *.test.ts(x)
- 测试先写（TDD），红-绿-重构
- 禁止修改测试断言来通过测试——修复源码
- 禁止 mock Supabase client——使用 Supabase 本地开发环境
- 禁止跳过测试直接提交——pre-commit hook 必须通过

### Git 规则
- Commit message 格式: `type(scope): S{sprint}.T{task} - description`
- types: feat, fix, refactor, test, docs, chore
- 每个 task 完成后单独 commit
- 不提交 .env.local 或任何 secrets
- 不使用 --no-verify

## 模型分配
- Planning, architecture, review: **opus**
- Implementation subagents: **sonnet**
- Explore subagents: **haiku**
- When a subagent fails twice on the same task, escalate to **opus**

## 安全红线（绝不可违反）
- 绝不生成关于逝者的合成内容（合成语音、AI 图像、AI 文本）
- 绝不在没有 RLS 的情况下创建表
- 绝不将 memories 表的 source_label 设为可修改（DB trigger 强制）
- 绝不在客户端 localStorage 中存储敏感个人数据（同意标记除外）
- 绝不引入数据分析、广告、第三方追踪 SDK
- 绝不跳过测试直接提交
- 绝不修改 .claudeignore 或 lint 配置来绕过检查
- 注册流程必须包含隐私政策同意 checkbox
- 数据导出入口必须在设置页最醒目位置

## 项目结构

```

ego-memory-anchor/
├── CLAUDE.md                      # 符号链接到 docs/v2/CLAUDE.md
├── PRODUCT_SPEC.md
├── docs/
│   └── v2/                        # V2 完整文档集（最新版本）
│       ├── README.md
│       ├── CLAUDE.md              # 项目宪法
│       ├── DESIGN.md              # 技术蓝图
│       ├── TASKS.md               # 开发任务
│       ├── PRODUCT_V2.md           # 差异化设计
│       ├── MARKETING.md            # 冷启动与增长
│       ├── COMPLIANCE_CHINA.md    # 中国大陆合规
│       ├── COMPLIANCE_GLOBAL.md   # 全球合规
│       ├── LANDING_PAGE_SPEC.md  # Landing Page 规格
│       └── CHANGELOG.md           # 变更记录
├── app/                           # Next.js App Router pages
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── callback/route.ts
│   │   └── layout.tsx
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── profile/
│   │   │   ├── new/page.tsx
│   │   │   └── [profileId]/
│   │   │       ├── page.tsx              # 生命摘要 + 时间线
│   │   │       ├── edit/page.tsx
│   │   │       ├── upload/page.tsx
│   │   │       ├── memory/[memoryId]/page.tsx
│   │   │       ├── family/page.tsx
│   │   │       └── reminders/page.tsx
│   │   ├── settings/page.tsx
│   │   └── invite/[token]/page.tsx
│   ├── privacy/page.tsx                  # V2新增
│   ├── terms/page.tsx                    # V2新增
│   ├── page.tsx                          # Landing page (V2)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                              # shadcn/ui
│   ├── layout/                          # Sidebar, Header, MobileNav, UserMenu
│   ├── profile/                         # ProfileCard, ProfileForm, ProfileSummary, MemoryStats
│   ├── timeline/                        # Timeline, TimelineYear, TimelineItem, TimelineFilters
│   ├── memory/                          # MemoryCard, PhotoViewer, VideoPlayer, AudioPlayer, SourceBadge
│   ├── upload/                          # UploadZone, UploadProgress, DatePicker, WechatImporter
│   ├── family/                          # InviteDialog, MemberList, RoleBadge
│   ├── reminders/                       # ReminderForm, ReminderList, CeremonyBanner
│   ├── landing/                         # V2新增: HeroSection, ValueProps, FounderStory, PrivacyPledge
│   └── common/                          # EmptyState, LoadingSpinner, ConfirmDialog
├── lib/
│   ├── supabase/                       # server.ts, client.ts, middleware.ts
│   ├── actions/                         # profile.ts, memory.ts, family.ts, reminder.ts
│   ├── utils/                          # date.ts, exif.ts, file.ts, storage.ts, stats.ts, upload.ts
│   └── types/                          # database.ts, index.ts
├── supabase/migrations/
├── tests/
│   ├── fixtures/
│   ├── unit/
│   └── e2e/
└── public/
```

## UI Design System

### 设计原则
- **整体风格**: 温暖、克制、留白充足。参考 Linear.app 简洁感 + Notion 温暖感
- **情感基调**: 安静陪伴，不是科技炫酷。这是纪念空间，不是工具面板
- **组件库**: 所有 UI 组件使用 shadcn/ui，不从零手写

### 色彩系统 (CSS Variables in globals.css)
```css
--background: 30 20% 98%;        /* 暖白 stone-50 */
--foreground: 30 10% 15%;         /* 暖黑 stone-900 */
--muted: 30 15% 94%;             /* 浅暖灰 stone-100 */
--muted-foreground: 30 10% 45%;  /* 中灰 stone-500 */
--primary: 25 60% 45%;           /* 暖棕/琥珀 amber-700 */
--primary-foreground: 30 20% 98%;
--accent: 30 15% 92%;
--accent-foreground: 30 10% 20%;
--destructive: 0 72% 51%;        /* 仅用于删除操作 */
--border: 30 15% 88%;
--ring: 25 60% 45%;
```

禁止使用纯黑 #000000 和纯白 #ffffff。

### 字体
- 中文: system-ui (苹方 / 思源黑体)
- 英文/数字: Inter (通过 next/font)
- 标题: text-2xl font-semibold tracking-tight
- 正文: text-base leading-relaxed
- 辅助文字: text-sm text-muted-foreground

### 间距节奏
| 场景 | 间距 |
|------|------|
| 页面内边距 | px-4 sm:px-6 lg:px-8 |
| 卡片内边距 | p-6 |
| 卡片间距 | gap-4 sm:gap-6 |
| 区块间距 | space-y-8 |
| 表单字段间距 | space-y-4 |
| 页面最大宽度 | max-w-4xl mx-auto (时间线), max-w-lg mx-auto (表单) |

### 圆角
- 卡片: rounded-xl
- 按钮: rounded-lg
- 输入框: rounded-md
- 头像: rounded-full

### 阴影
- 卡片默认: shadow-sm
- 卡片悬停: hover:shadow-md transition-shadow
- 弹窗: shadow-xl
- 禁止: shadow-2xl 及更大

### 动效
- 所有过渡: transition-all duration-200 ease-in-out
- 列表项加载: stagger fade-in (每项延迟 50ms)
- Toast: 从右上角滑入, 3秒自动消失
- 蜡烛点亮: opacity 0→1 + 微弱摇曳 (CSS keyframe, 无限循环)
- 禁止: bounce, shake, spin, scale-bounce

### SourceBadge 设计规范
- 外观: bg-stone-100 text-stone-500 border border-stone-200 rounded-full
- 文字: "原始记录"（硬编码，不可配置）
- 位置: TimelineItem 卡片内，日期旁边
- 不可点击、不可编辑，hover 显示 tooltip
- tooltip 内容: "此内容为用户上传的原始真实记录，未经任何修改"

### 纪念仪式横幅设计
- 背景: amber-50 + 左侧蜡烛图标
- 文字: amber-900
- 布局: 左侧图标 + 中间文案 + 右侧记忆缩略图
- "点亮蜡烛"按钮: ghost variant, 点击后蜡烛变暖黄 + 火焰 CSS 动画
- 可关闭: X 按钮, session 内不再显示

## Testing Pipeline

### 测试分层
| 层级 | 工具 | 覆盖率目标 | 何时写 | 触发命令 |
|------|------|----------|--------|---------|
| 单元测试 | Vitest + jsdom | 工具函数 100% | 实现前 (TDD) | — |
| 集成测试 | Vitest + 真实 Supabase | Server Actions 80% | 实现后立即 | — |
| 每次修改 | Vitest (智能选择) | 受影响测试 | 代码修改后 | `vitest --changed` |
| 功能完成 | Vitest (全量) | 全量单元 | 功能点完成时 | `pnpm test --run` |
| Sprint 末尾 | Vitest + Playwright | 全量 + E2E | Sprint/milestone | `pnpm test --run && pnpm playwright test` |
| E2E | Playwright | 核心用户流程 (5条) | Sprint 末尾 | `pnpm playwright test` |
| 视觉截图 | Playwright | 关键页面 | UI Sprint 末尾 | screenshot + AI 对比 |

### 智能测试选择（vitest --changed）

每次代码修改后使用 `vitest --changed`，Vitest 通过静态依赖图分析只跑受影响的测试：
- 反馈速度：<30s
- 无需配置，基于 import 关系自动推断
- 适合高频修改场景

### Supabase 测试架构（MVP 简化版）

**环境架构：**
```
本地开发/测试: supabase start (:54321) — 共用同一实例
CI/CD: supabase start + db push + vitest
生产: Supabase Cloud
```

**测试隔离策略（UUID + afterAll 清理）：**
```typescript
// 每个测试创建随机 UUID 数据，afterAll 清理
const testProfileId = crypto.randomUUID()
const testUserId = crypto.randomUUID()

afterAll(async () => {
  // 清理测试数据（按依赖顺序反向删除）
  await supabase.from('memories').delete().eq('profile_id', testProfileId)
  await supabase.from('family_members').delete().eq('profile_id', testProfileId)
  await supabase.from('profiles').delete().eq('id', testProfileId)
})
```

**禁止 mock Supabase client：**
- ✅ 工具函数测试：纯函数，无需 Supabase client
- ❌ Server Action 测试：禁止 vi.mock('@/lib/supabase/server')，必须用真实 client
- ✅ 组件测试：可用 jsdom + mock data

**为什么不用 pgTAP Transaction Rollback：**
- pgTAP 需要 `CREATE EXTENSION pgtap`，增加 CI 配置复杂度
- MVP 阶段 UUID + afterAll 清理足够，且真实反映了生产环境的 data flow

### TDD 强制流程
```
1. RED: 先写测试，定义预期行为
2. RUN: 运行测试，确认失败
3. GREEN: 写最少量代码让测试通过
4. REFACTOR: 清理代码，测试仍通过
```

### E2E 核心流程 (必须覆盖)
1. 注册 → 登录 → 登出
2. 创建档案 → 上传照片 → 时间线显示 → 生命摘要正确
3. 添加注释 → SourceBadge 显示 → 验证持久化
4. 邀请家人 → 接受邀请 → 共同编辑
5. 未登录访问 → 重定向

### Sprint QA 步骤 (每个 Sprint 末尾)
```bash
pnpm test --run          # 全部单元测试通过
pnpm build               # 生产构建成功
pnpm test:e2e            # Playwright E2E（配置后）
```

## Debugging Rules
- NEVER guess-and-check. Always reproduce the bug first.
- Read error messages and stack traces completely before proposing fixes.
- When a fix attempt fails twice, stop and re-analyze from scratch.
- After fixing, run the full test suite, not just the affected test.

## V2 开发工作流（适配 Claude Code 自主性）

本项目使用 superpowers skills 体系，Claude Code 应以最高自主性执行开发任务。

### V2 Sprint 执行流程

每个 Sprint 按以下顺序执行：

```
1. [读取] docs/v2/TASKS.md 中对应 Sprint 的任务列表
2. [读取] docs/v2/DESIGN.md 中相关技术规格
3. [读取] docs/v2/CLAUDE.md 中相关编码规范
4. [执行] 按任务顺序执行，每个任务：
   a. 写测试 (RED)
   b. 运行测试确认失败
   c. 写实现代码 (GREEN)
   d. 运行测试确认通过
   e. 重构
   f. commit: feat(scope): S{x}.T{y} - 描述
5. [验证] Sprint 末尾运行 pnpm test --run 和 pnpm build
6. [汇报] 完成状态 + 发现的问题
```

### Claude Code 自主性级别

| 场景 | 自主性 |
|------|-------|
| 工具函数实现 | 全自主（红绿重构循环） |
| Server Action 实现 | 全自主（TDD） |
| 组件实现 | 全自主（可参考 shadcn/ui 文档） |
| 跨组件架构决策 | 汇报后执行 |
| 数据库 Migration | 汇报后执行 |
| 新增依赖 | 汇报后执行 |
| UI 视觉调整 | 可自主，但建议截图确认 |

### Agent 自主性授权

**以下操作 Agent 无需汇报，自主完成：**
- 修复 bug（分析后直接修，最多尝试 3 次）
- 重构（不改变功能只改结构）
- 写测试、跑测试、调测试
- 提交代码（符合 commit 规范）
- 部署到 Vercel Preview
- 使用 Playwright/puppeteer 自主验证 UI

**以下操作必须汇报：**
- 删除文件（非 tmp/build/cache）
- 修改 migration 文件
- 添加新依赖
- 修改 RLS 策略
- 修改认证/授权逻辑

**调试流程：Auto-fix then Report**
```
发现 bug → 分析原因 → 尝试修复（最多 3 次）
→ 修复成功 → 跑测试验证 → 自动部署 → 汇报（含截图）
→ 失败 2 次 → 停止并汇报给用户
```

### 参考文档

详细工作流参见 `docs/AUTONOMOUS_WORKFLOW.md`

### Sprint 汇报格式

每个 Sprint 完成时，Claude Code 应汇报：

```
## Sprint {N} 完成汇报

### 完成的任务
- S{N}.T1: 描述
- S{N}.T2: 描述
...

### 测试结果
- 单元测试: X passed, Y failed
- 构建: success/failed

### 发现的问题
- 问题1: 描述
- 问题2: 描述

### 下一步建议
- 建议1
- 建议2
```

### 关键提醒

1. **不要跳过测试** — TDD 是质量保障的底线
2. **不要一次执行多个 Sprint** — 一个 Sprint 完成 + 验证后再开始下一个
3. **遇到 Supabase RLS 问题** — 参考 STORAGE_DESIGN.md 的常见错误表
4. **UI 不对劲** — 让 Playwright 截图 → 汇报问题时附上截图
5. **source_label 必须不可变** — 这是信任基石，trigger 必须在 migration 中创建
6. **遇到 2 次失败** — 停止并重新分析，汇报给用户

## 关键设计决策记录

- **为什么 Web 不是 App**: DPM 振荡理论；家庭协作零摩擦；迭代速度
- **为什么不做 AI 对话**: 外化纽带风险；研究证据仅 10 人样本
- **为什么不做全息**: 锚定感来自内容真实性非呈现介质
- **为什么中文优先**: 种子用户在华人社区；微信解析是差异化
- **为什么海外部署优先**: 避免数据跨境合规阻塞 MVP 开发
- **为什么家庭协作是 P0**: 它是核心增长引擎（裂变系数）
- **为什么导出是 P0**: 它是信任锚点，不是附加功能
- **为什么 SourceBadge 不可变**: 真实性承诺必须制度化
