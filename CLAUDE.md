# CLAUDE.md — ego-memory-anchor 项目宪法

## 项目概述
ego-memory-anchor（忆锚）是一款面向丧亲/丧宠人群的真实记忆聚合平台。
核心理念：守护真实记录，对抗第二重丧失。绝不生成合成内容。
MVP 形态：中文 Web 应用（PWA-ready）。

## 技术栈（不可更改）
- **框架**: Next.js 15 (App Router, Server Components by default)
- **语言**: TypeScript (strict mode)
- **样式**: Tailwind CSS 4 + shadcn/ui
- **后端**: Supabase (Auth + Postgres + Storage + RLS + Edge Functions)
- **测试**: Vitest + React Testing Library + Playwright
- **部署**: Vercel
- **包管理**: pnpm

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
- 文件上传到 Supabase Storage，bucket 设为 private
- 数据库 migration 文件放在 supabase/migrations/ 目录

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
- Commit message 格式: `type(scope): description`
- types: feat, fix, refactor, test, docs, chore
- 每个 task 完成后单独 commit
- 不提交 .env.local 或任何 secrets

## 模型分配
- Planning, architecture, review: **opus**
- Implementation subagents: **sonnet**
- Explore subagents: **haiku**
- When a subagent fails twice on the same task, escalate to **opus**

## 安全红线（绝不可违反）
- 绝不生成关于逝者的合成内容（合成语音、AI 图像、AI 文本）
- 绝不在没有 RLS 的情况下创建表
- 绝不将用户上传的媒体文件设为 public
- 绝不引入数据分析、广告、第三方追踪 SDK
- 绝不跳过测试直接提交
- 绝不修改 .claudeignore 或 lint 配置来绕过检查

## 项目结构

```
ego-memory-anchor/
├── CLAUDE.md
├── PRODUCT_SPEC.md
├── DESIGN.md
├── TASKS.md
├── planning/                      # 原始 agent 输出（不编辑）
│   ├── 6-detailed-plan.md
│   └── 6-detailed-plan-B.md
├── app/                        # Next.js App Router pages (no src/ prefix)
│   ├── (auth)/                # Auth routes (login, register, callback)
│   ├── (main)/                # Authenticated routes
│   │   ├── dashboard/         # Profile list
│   │   ├── profile/          # Profile CRUD + timeline + memories
│   │   └── settings/         # User settings
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   └── globals.css            # Tailwind base styles
├── components/                # 应用组件（不在 src/ 下）
│   ├── ui/                   # shadcn/ui components
│   ├── timeline/            # Timeline-related components
│   ├── memory/              # Memory display components
│   ├── upload/              # Upload-related components
│   ├── profile/             # Profile components
│   ├── family/              # Family collaboration components
│   └── reminders/           # Reminder components
├── lib/                     # 业务逻辑
│   ├── supabase/           # Supabase client setup
│   ├── actions/            # Server Actions
│   ├── utils/              # Utility functions
│   └── types/              # TypeScript type definitions
├── src/                     # 占位目录（保留以备未来扩展）
├── supabase/
│   ├── migrations/          # SQL migrations
│   └── seed.sql            # Dev seed data
├── public/                   # Static assets
│   └── icons/
├── tests/
│   ├── unit/               # Unit tests
│   └── e2e/                # E2E tests
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

## Testing Pipeline

### 测试分层

| 层级 | 工具 | 覆盖率目标 | 何时写 |
|------|------|----------|--------|
| 单元测试 | Vitest + @testing-library/react | 工具函数 100%, Server Actions 80% | 实现前 (TDD) |
| 集成测试 | Vitest + 真实 Supabase | 核心数据流 | 实现后立即 |
| E2E | Playwright | 核心用户流程 (5 条) | Sprint 末尾 |

### 测试金字塔

```
┌─────────────────────────────────────┐
│     E2E 测试 (Playwright) - 5 条核心流程)     │  10%
├─────────────────────────────────────┤
│     集成测试 (Vitest + Supabase 本地)        │  30%
├─────────────────────────────────────┤
│     单元测试 (Vitest) — 工具函数 100%       │  60%
└─────────────────────────────────────┘
```

### TDD 强制流程

```
每个工具函数 / Server Action 必须遵循:
1. RED: 先写测试，定义预期行为（必填）
2. RUN: 运行测试，确认失败
3. GREEN: 写最少量代码让测试通过
4. REFACTOR: 清理代码，测试仍通过
```

### Pre-commit Hook (ECC)

每次 git commit 前自动执行:
```bash
pnpm test --run
```
如果测试失败，commit 被阻止。**严禁使用 `--no-verify` 绕过。**

### axe-core 无障碍测试

所有 E2E 测试必须包含无障碍检查:
```typescript
import AxeBuilder from '@axe-core/playwright';

test('页面无障碍', async ({ page }) => {
  await page.goto('/profile/test-profile-id');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### 测试 Fixtures 目录

```
tests/
├── fixtures/                    # 测试数据
│   ├── sample-photo.jpg       # 真实但无隐私信息
│   ├── sample-video.mp4       # < 5MB
│   ├── sample-audio.m4a       # < 1MB
│   └── wechat-export-sample.txt  # mock 微信导出格式
├── unit/                      # Vitest 单元测试
└── e2e/                       # Playwright E2E 测试
    └── visual/                # 截图基准 (screenshot snapshots)
```

### Server Action 测试清单

每个 Server Action 必须覆盖以下场景:

| Server Action | 必须测试的场景 |
|--------------|--------------|
| `createProfile` | 正常创建 / 姓名为空拒绝 / 未登录 rejection |
| `updateProfile` | 正常更新 / 无权限 rejection |
| `deleteProfile` | 正常删除 / 非 owner rejection |
| `createMemory` | 正常创建 / RLS 隔离 / 批量创建 |
| `createAnnotation` | 正常添加 / viewer 权限拒绝 |
| `createInvitation` | 生成链接 / 角色验证 |
| `acceptInvitation` | 有效 token / 过期 token / 已使用 token |

### Playwright E2E 核心流程 (必须覆盖)

```
1. 注册 → 登录 → 登出
2. 创建档案 → 上传照片 → 时间线显示
3. 添加注释 → 验证持久化
4. 邀请家人 → 接受邀请 → 共同编辑
5. 未登录访问受保护页面 → 重定向
```

### 测试禁止

- ❌ 禁止 mock Supabase client（用 supabase start 本地实例）
- ❌ 禁止修改测试断言来通过测试
- ❌ 禁止跳过测试提交
- ❌ E2E 不测试边界情况（留给单元测试）
- ❌ 不在测试中 hardcode secrets

## UI Design System

### 设计原则
- **整体风格**: 温暖、克制、留白充足，参考 Linear.app 的简洁感 + Notion 的温暖感
- **情感基调**: 安静陪伴，不是科技炫酷
- **组件库**: 所有 UI 组件使用 shadcn/ui，不从零手写

### shadcn/ui 组件映射

| 用途 | shadcn/ui 组件 | 定制说明 |
|------|---------------|---------|
| 按钮 | `Button` | variant: default/secondary/ghost/destructive |
| 卡片 | `Card` | 加暖色悬浮 shadow-sm hover:shadow-md |
| 表单输入 | `Input`, `Textarea`, `Select` | — |
| 确认弹窗 | `AlertDialog` | 删除操作专用 |
| 通知 | `Toast` (Sonner) | — |
| 头像 | `Avatar` | — |
| 标签 | `Badge` | 类型标签用不同颜色 variant |
| 日期选择 | `Calendar` + `Popover` | 扩展农历支持 |
| 加载占位 | `Skeleton` | — |
| 分隔线 | `Separator` | — |
| 下拉菜单 | `DropdownMenu` | Navbar 用户菜单 |
| 筛选 Tabs | `Tabs` | 时间线类型筛选 |
| 弹窗 | `Dialog` | 邀请、上传等 |

### 色彩系统 (CSS Variables in globals.css)

```css
/* 暖色调色板 — 避免纯黑纯白 */
--background: 30 20% 98%;        /* 暖白 stone-50 */
--foreground: 30 10% 15%;         /* 暖黑 stone-900 */
--muted: 30 15% 94%;             /* 浅暖灰 stone-100 */
--muted-foreground: 30 10% 45%;  /* 中灰 stone-500 */
--primary: 25 60% 45%;           /* 暖棕/琥珀 amber-700 */
--primary-foreground: 30 20% 98%;
--accent: 30 15% 92%;             /* 淡暖灰 stone-50 */
--accent-foreground: 30 10% 20%;
--destructive: 0 72% 51%;        /* 红色 — 仅用于删除 */
--border: 30 15% 88%;             /* 边框 stone-200 */
--ring: 25 60% 45%;               /* focus ring 同 primary */
```

### 字体

- **中文**: system-ui (苹方 / 思源黑体)
- **英文/数字**: Inter (通过 next/font)
- **标题**: text-2xl font-semibold tracking-tight
- **正文**: text-base leading-relaxed
- **辅助文字**: text-sm text-muted-foreground

### 间距节奏

| 场景 | 间距 |
|------|------|
| 页面内边距 | px-4 sm:px-6 lg:px-8 |
| 卡片内边距 | p-6 (24px) |
| 卡片间距 | gap-4 sm:gap-6 |
| 区块间距 | space-y-8 (32px) |
| 表单字段间距 | space-y-4 |
| 页面最大宽度 | max-w-4xl mx-auto (时间线), max-w-lg mx-auto (表单) |

### 圆角

- 卡片: rounded-xl
- 按钮: rounded-lg
- 输入框: rounded-md
- 头像: rounded-full

### 阴影

- 卡片悬停: hover:shadow-md transition-shadow
- 弹窗: shadow-xl
- **禁止**: shadow-2xl 及更大阴影

### 动效

- 所有过渡: transition-all duration-200 ease-in-out
- 页面切换: 无动画 (instant)
- 列表项加载: stagger fade-in (每项延迟 50ms)
- Toast: 从右上角滑入, 3秒自动消失
- **禁止**: bounce, shake, spin, scale-bounce 等注意力抢夺型动效

### 空状态设计

居中布局:
```
[图标 64px]
[标题 text-lg]
[描述 text-sm text-muted-foreground]
[CTA 按钮]
```
文案示例: "这里还没有记忆，你可以随时添加"

## 关键设计决策记录
- **为什么 Web 不是 App**: DPM 振荡理论要求用户自由进出，app 打开关闭天然符合；家庭协作零摩擦（分享链接）；迭代速度快
- **为什么不做 AI 对话**: 外化纽带风险 > 收益；研究证据仅 10 人样本；MVP 聚焦真实性
- **为什么不做全息**: 锚定感来自内容真实性而非呈现介质；全息在错误维度做加法
- **为什么中文优先**: 种子用户在中国；微信聊天记录解析是差异化功能；清明节是自然需求窗口
- **JSONB tags vs 独立表**: MVP 阶段用 JSONB tags 简化 schema，减少 migration 复杂度
- **Plan B 技术栈**: Next.js 15 + Tailwind CSS 4 + React 19 useActionState

## Debugging Rules
- NEVER guess-and-check. Always reproduce the bug first.
- Read error messages and stack traces completely before proposing fixes.
- When a fix attempt fails twice, stop and re-analyze from scratch.
- After fixing, run the full test suite, not just the affected test.
