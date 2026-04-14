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
- 每个工具函数必须有单元测试
- 每个页面组件必须有基本渲染测试
- 测试文件与源文件同目录，命名 *.test.ts(x)
- 测试先写（TDD），红-绿-重构
- 禁止修改测试断言来通过测试——修复源码

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
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── (auth)/              # Auth routes (login, register, callback)
│   │   ├── (main)/              # Authenticated routes
│   │   │   ├── dashboard/       # Profile list
│   │   │   ├── profile/         # Profile CRUD + timeline + memories
│   │   │   └── settings/        # User settings
│   │   ├── page.tsx             # Landing page
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── timeline/           # Timeline-related components
│   │   ├── memory/              # Memory display components
│   │   ├── upload/              # Upload-related components
│   │   ├── profile/             # Profile components
│   │   ├── family/              # Family collaboration components
│   │   └── reminders/           # Reminder components
│   ├── lib/
│   │   ├── supabase/           # Supabase client setup
│   │   ├── actions/            # Server Actions
│   │   ├── utils/              # Utility functions
│   │   └── types/              # TypeScript type definitions
│   └── middleware.ts           # Next.js middleware (auth)
├── supabase/
│   ├── migrations/             # SQL migrations
│   └── seed.sql               # Dev seed data
├── public/                    # Static assets
│   └── icons/
├── tests/
│   ├── unit/                  # Unit tests
│   └── e2e/                   # E2E tests
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json
```

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
