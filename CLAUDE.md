# CLAUDE.md — ego-memory-anchor 项目宪法

> 这是项目的最高级别上下文文档。详细规格在 `docs/v2/` 目录中。

## 项目概述

ego-memory-anchor（忆锚）是一款面向丧亲/丧宠人群的真实记忆聚合平台。
核心理念：守护真实记录，对抗第二重丧失。绝不生成合成内容。
忆锚不是网盘——它是一个人（或一只宠物）的数字纪念空间。
MVP 形态：中文 Web 应用（PWA-ready），海外部署优先。

## 核心差异化要点

每个 Agent 必须理解：
- **档案 ≠ 文件夹**：是有身份的生命空间（头像、姓名、日期、家人）
- **记忆 ≠ 文件**：是素材+时间锚点+家人故事+不可变的"原始记录"标记
- **家庭协作是增长引擎 P0**：不是附加功能
- **数据导出是信任基石**：入口必须在设置页最醒目位置
- **SourceBadge 不可变**：这是信任架构的核心

## 技术栈（不可更改）

- **框架**: Next.js 15 (App Router, Server Components by default)
- **语言**: TypeScript (strict mode)
- **样式**: Tailwind CSS 4 + shadcn/ui (stone 暖色主题)
- **后端**: Supabase (Auth + Postgres + Storage + RLS + Edge Functions)
- **测试**: Vitest + React Testing Library + Playwright
- **部署**: Vercel（海外优先）
- **包管理**: pnpm

## 安全红线（绝不可违反）

- 绝不生成关于逝者的合成内容（合成语音、AI 图像、AI 文本）
- 绝不在没有 RLS 的情况下创建表
- 绝不将 memories 表的 source_label 设为可修改（DB trigger 强制）
- 绝不在客户端 localStorage 中存储敏感个人数据（同意标记除外）
- 绝不引入数据分析、广告、第三方追踪 SDK
- 绝不跳过测试直接提交
- 绝不修改 .claudeignore 或 lint 配置来绕过检查
- **注册流程必须包含隐私政策同意 checkbox**
- **数据导出入口必须在设置页最醒目位置**

## 项目结构

```
ego-memory-anchor/
├── CLAUDE.md                 # 本文件（最高级别上下文）
├── PRODUCT_SPEC.md           # 产品规格（V1）
├── docs/
│   └── v2/                  # V2 完整文档集（最新版本）
│       ├── README.md
│       ├── CLAUDE.md         # 项目宪法 V2
│       ├── DESIGN.md         # 技术蓝图 V2
│       ├── TASKS.md          # 开发任务 V2（9 Sprint，53 tasks）
│       ├── PRODUCT_V2.md     # 差异化产品设计
│       ├── MARKETING.md       # 冷启动与增长
│       ├── COMPLIANCE_CHINA.md  # 中国大陆合规
│       ├── COMPLIANCE_GLOBAL.md # 全球合规
│       ├── LANDING_PAGE_SPEC.md # Landing Page 规格
│       └── CHANGELOG.md       # V1→V2 变更记录
├── app/                     # Next.js App Router pages
│   ├── (auth)/
│   ├── (main)/
│   │   ├── dashboard/
│   │   ├── profile/[profileId]/   # 生命摘要 + 时间线
│   │   ├── settings/
│   │   └── invite/[token]/
│   ├── privacy/page.tsx     # V2
│   ├── terms/page.tsx       # V2
│   └── page.tsx            # Landing page (V2)
├── components/
│   ├── ui/                 # shadcn/ui
│   ├── landing/            # V2: HeroSection, ValueProps, FounderStory, PrivacyPledge...
│   └── ...
├── lib/
│   ├── supabase/
│   ├── actions/
│   └── utils/
└── supabase/migrations/
```

## 开发文档导航

| 你需要做什么 | 去哪里找 |
|------------|---------|
| 项目规范、安全红线 | `CLAUDE.md`（本文件） |
| 技术细节、数据模型、RLS | `docs/v2/DESIGN.md` |
| 任务列表、Sprint 顺序 | `docs/v2/TASKS.md` |
| UI 设计规范 | `docs/v2/CLAUDE.md` § UI Design System |
| 产品差异化设计 | `docs/v2/PRODUCT_V2.md` |
| Landing Page 完整设计 | `docs/v2/LANDING_PAGE_SPEC.md` |
| 冷启动与增长策略 | `docs/v2/MARKETING.md` |
| 合规要求 | `docs/v2/COMPLIANCE_CHINA.md` 或 `COMPLIANCE_GLOBAL.md` |

## 模型分配

- Planning, architecture, review: **opus**
- Implementation subagents: **sonnet**
- Explore subagents: **haiku**
- When a subagent fails twice on the same task, escalate to **opus**

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
- 所有页面实现 loading.tsx 和 error.tsx

### Supabase 规则
- 所有表必须有 RLS 策略，禁止 public 访问
- memories bucket 和 avatars bucket 设为 **public**（UUID 路径不可猜测）
- Storage 路径规范: `{profile_id}/{memory_id}/{uuid}.{ext}`
- 原始文件名保存在 memories.file_name，Storage 中使用 UUID 文件名

### Git 规则
- Commit message 格式: `type(scope): S{sprint}.T{task} - description`
- types: feat, fix, refactor, test, docs, chore
- 每个 task 完成后单独 commit
- 不提交 .env.local 或任何 secrets

## Testing Pipeline

### TDD 强制流程
```
1. RED: 先写测试，定义预期行为
2. RUN: 运行测试，确认失败
3. GREEN: 写最少量代码让测试通过
4. REFACTOR: 清理代码，测试仍通过
```

### 测试分层
| 层级 | 工具 | 覆盖率目标 | 何时写 |
|------|------|----------|--------|
| 单元测试 | Vitest + RTL | 工具函数 100%, Actions 80% | 实现前 (TDD) |
| 集成测试 | Vitest + 真实 Supabase | 核心数据流 | 实现后立即 |
| E2E | Playwright | 核心用户流程 (5条) | Sprint 末尾 |

### E2E 核心流程 (必须覆盖)
1. 注册 → 登录 → 登出
2. 创建档案 → 上传照片 → 时间线显示
3. 添加注释 → SourceBadge 显示 → 验证持久化
4. 邀请家人 → 接受邀请 → 共同编辑
5. 未登录访问 → 重定向

### Pre-commit Hook
```bash
pnpm test --run
```
测试失败则 commit 被阻止。**严禁使用 `--no-verify` 绕过。**

## Debugging Rules
- NEVER guess-and-check. Always reproduce the bug first.
- Read error messages and stack traces completely before proposing fixes.
- When a fix attempt fails twice, stop and re-analyze from scratch.
- After fixing, run the full test suite, not just the affected test.

## V2 Sprint 开发工作流（Claude Code 自主性）

Claude Code 应以最高自主性执行开发任务，每个 Sprint 汇报完成状态。

### Sprint 汇报格式
```
## Sprint {N} 完成汇报

### 完成的任务
- S{N}.T1: 描述

### 测试结果
- 单元测试: X passed, Y failed
- 构建: success/failed

### 发现的问题
- 问题1: 描述

### 下一步建议
- 建议1
```

### Claude Code 自主性级别

| 场景 | 自主性 |
|------|-------|
| 工具函数实现 | 全自主（红绿重构循环） |
| Server Action 实现 | 全自主（TDD） |
| 组件实现 | 全自主 |
| 跨组件架构决策 | 汇报后执行 |
| 数据库 Migration | 汇报后执行 |
| 新增依赖 | 汇报后执行 |

## 关键设计决策

| 决策 | 理由 |
|------|------|
| 为什么 Web 不是 App | DPM 振荡理论；家庭协作零摩擦；迭代速度 |
| 为什么不做 AI 对话 | 外化纽带风险；研究证据仅 10 人样本 |
| 为什么家庭协作是 P0 | 它是核心增长引擎（裂变系数） |
| 为什么导出是 P0 | 它是信任锚点，不是附加功能 |
| 为什么 SourceBadge 不可变 | 真实性承诺必须制度化 |
| 为什么海外部署优先 | 避免数据跨境合规阻塞 MVP 开发 |
