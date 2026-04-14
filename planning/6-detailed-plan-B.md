# 回答你的问题，然后生成全部文档

***

## Q1：Phase 3 代码审查与 Bug 修复最佳实践

### 代码审查

**Superpowers 的 `/subagent-driven-development` 自带两阶段审查**，这是当前最成熟的做法：

* **阶段 1 — Spec 合规性审查**：subagent 完成任务后，自动启动一个新鲜上下文的审查 subagent，对照 `DESIGN.md` 和该任务的验收标准检查输出
* **阶段 2 — 代码质量审查**：检查编码规范、测试覆盖、安全问题

如果你想更严格，还可以手动使用 **Writer/Reviewer 模式**：

```
# 在 Claude Code 中手动触发
> 用 Sonnet subagent 实现 [任务描述]，完成后启动一个新的 Opus session 做代码审查，
  审查标准：1) 是否符合 DESIGN.md 规范 2) 是否有安全漏洞 3) 是否有冗余代码
```

### Bug 修复

你用的 **`superpowers:systematic-debugging`** 确实是当前最佳实践。它的流程是：

**复现 → 隔离 → 假设 → 修复 → 验证 → 回归测试**

补充一个技巧：在 `CLAUDE.md` 中写入调试规则，确保 subagent 也遵守：

```
# Debugging Rules
- NEVER guess-and-check. Always reproduce the bug first.
- Read error messages and stack traces completely before proposing fixes.
- When a fix attempt fails twice, stop and re-analyze from scratch.
- After fixing, run the full test suite, not just the affected test.
```

***

## Q2：MiniMax m2.7 的技术限制 — 必须说清楚

**Claude Code 的 subagent 系统只能调用 Anthropic 模型（Opus / Sonnet / Haiku）。** 这是架构层面的硬限制，不是配置问题。MiniMax m2.7 无法作为 Claude Code 的 subagent 使用。

如果强行引入 MiniMax，意味着：

* ❌ 失去 **Checkpoint/Rewind** — 无法一键回滚
* ❌ 失去 **Subagent 上下文继承** — MiniMax 不知道你的 CLAUDE.md 和项目结构
* ❌ 失去 **ECC 安全 hooks** — 无法阻止危险操作
* ❌ 失去 **Superpowers 流程管控** — /executing-plans 无法调度 MiniMax
* ❌ 需要手动复制粘贴代码 — 完全违背"自主开发"的初衷

**我的强烈建议：用 Sonnet 4 做实现。** 理由：

* Max plan 的 Sonnet 配额非常充裕，代码实现质量与 MiniMax 相当
* 完整保留 Claude Code 全部自主能力
* Opus 只用于 20% 的高杠杆工作，Sonnet 承担 70% 的编码，Haiku 做 10% 的探索

**如果你仍然想用 MiniMax，唯一可行的方式是**：在 Claude Code 外单独开一个 MiniMax session 处理某些独立任务（如写文案、做翻译），然后手动贴回项目。但 MVP 阶段所有核心代码建议全部在 Claude Code 内完成。

> 请确认：**是否接受 Opus + Sonnet + Haiku 的方案，放弃 MiniMax？** 以下文档按此方案生成。如果你坚持用 MiniMax，我需要调整工作流设计。

***

## 其他确认项汇总

| # | 决策                  | 你的回复                            | 状态 |
| - | ------------------- | ------------------------------- | -- |
| 1 | 工作流 Phase 0-4 + 2.5 | 同意                              | ✅  |
| 2 | 模型分工                | 要用 MiniMax → 上面已解释限制，**待你最终确认** | ⏳  |
| 3 | 用户画像                | 丧亲+宠物，20-60岁                    | ✅  |
| 4 | 语言                  | 中文优先                            | ✅  |
| 5 | 代号                  | ego-memory-anchor               | ✅  |

***

## 以下按 Opus + Sonnet + Haiku 方案生成全部 4 份文档

> 如果你最终决定用 MiniMax，告诉我，我会调整 CLAUDE.md 中的模型分配部分。

***

# 文档 1：CLAUDE.md

```markdown
# CLAUDE.md — ego-memory-anchor 项目宪法

## 项目概述
ego-memory-anchor（忆锚）是一个真实记忆聚合平台，帮助丧亲/丧宠者将散落在各处的逝者真实记录（照片、视频、语音、文字、扫描件）一站式聚合、保存、结构化呈现为时间线，支持家庭成员协作和纪念日提醒。

**核心原则：零合成、零篡改。所有呈现的内容必须是用户上传的原始真实素材。**

## 技术栈
- **框架**: Next.js 15 (App Router, Server Components)
- **语言**: TypeScript (strict mode)
- **样式**: Tailwind CSS 4
- **数据库**: Supabase (PostgreSQL + Row Level Security)
- **认证**: Supabase Auth (手机号/邮箱登录)
- **存储**: Supabase Storage (加密存储, RLS)
- **部署**: Vercel
- **测试**: Vitest (单元) + Playwright (E2E)
- **包管理**: pnpm

## 架构决策
- 使用 Next.js App Router 的 Server Components 优先策略，仅在需要交互时使用 Client Components
- 所有数据库操作通过 Supabase JS Client + Server Actions，不写自定义 API routes（除非 Server Actions 无法满足）
- 文件上传使用 Supabase Storage 的 signed URL 直传，不经过 Next.js 服务器
- 状态管理：Server Components 自带的数据流 + React Context（仅用于客户端 UI 状态如 modal 开关），不引入 Zustand/Redux
- 表单处理：React 19 的 useActionState + Server Actions

## 文件结构
```

ego-memory-anchor/
├── CLAUDE.md
├── PRODUCT\_SPEC.md
├── DESIGN.md
├── TASKS.md
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 认证相关页面 (layout 不含导航栏)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (main)/             # 主应用页面 (layout 含导航栏)
│   │   │   ├── dashboard/
│   │   │   ├── profile/\[id]/
│   │   │   │   ├── page.tsx    # 时间线主视图
│   │   │   │   ├── upload/
│   │   │   │   ├── memory/\[memoryId]/
│   │   │   │   ├── family/
│   │   │   │   └── reminders/
│   │   │   └── settings/
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # 通用 UI 组件 (Button, Input, Modal, etc.)
│   │   ├── timeline/           # 时间线相关组件
│   │   ├── upload/             # 上传相关组件
│   │   └── memory/             # 记忆卡片相关组件
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts       # 浏览器端 Supabase client
│   │   │   ├── server.ts       # 服务端 Supabase client
│   │   │   └── middleware.ts   # Auth middleware
│   │   ├── actions/            # Server Actions
│   │   │   ├── profile.ts
│   │   │   ├── memory.ts
│   │   │   ├── family.ts
│   │   │   └── reminder.ts
│   │   ├── utils/
│   │   │   ├── date.ts         # 日期工具 (农历转换、周年计算)
│   │   │   ├── exif.ts         # EXIF 元数据提取
│   │   │   ├── wechat-parser.ts # 微信聊天记录解析
│   │   │   └── file.ts         # 文件类型检测、大小验证
│   │   └── types/
│   │       └── index.ts        # 全局类型定义
│   └── middleware.ts           # Next.js middleware (auth redirect)
├── supabase/
│   ├── migrations/             # 数据库迁移文件
│   └── seed.sql                # 开发环境种子数据
├── tests/
│   ├── unit/
│   └── e2e/
├── public/
│   └── icons/
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
├── playwright.config.ts
└── package.json

```

## 编码规范

### TypeScript
- strict mode 必须开启
- 禁止使用 `any`，必须为所有函数参数和返回值定义类型
- 使用 `interface` 定义对象形状，`type` 用于联合类型和工具类型
- 数据库类型从 Supabase 的 `database.types.ts` 自动生成

### React / Next.js
- 优先使用 Server Components；只在以下情况使用 `"use client"`：事件处理器、useState/useEffect、浏览器 API
- 组件文件名使用 PascalCase：`TimelineCard.tsx`
- 每个组件文件只导出一个组件
- Props 接口命名：`{ComponentName}Props`

### 样式
- 只使用 Tailwind CSS 类，不写自定义 CSS（globals.css 中的 Tailwind 指令除外）
- 颜色使用 Tailwind 的语义化 token，在 tailwind.config.ts 中定义主题色
- 响应式断点：mobile-first，`sm:` → `md:` → `lg:`

### 命名
- 变量/函数：camelCase
- 组件/类型/接口：PascalCase
- 文件夹：kebab-case
- 数据库表/列：snake_case
- 常量：UPPER_SNAKE_CASE

## 测试要求
- 每个 Server Action 必须有单元测试
- 每个工具函数（lib/utils/）必须有单元测试
- 核心用户流程（注册→创建档案→上传→查看时间线）必须有 E2E 测试
- 测试命名：`describe('函数名/组件名', () => { it('should 行为描述', ...) })`
- 测试不 mock Supabase client — 使用 Supabase 本地开发环境的真实数据库

## Model Allocation
- Planning, architecture, code review: **opus**
- Implementation subagents: **sonnet**
- Explore subagents: **haiku**
- When a subagent fails twice on the same task, escalate to **opus**

## 禁止行为
- NEVER generate, synthesize, or fabricate content about the deceased — all content must be user-uploaded originals
- NEVER use `any` type in TypeScript
- NEVER skip writing tests for Server Actions
- NEVER store sensitive data in client-side state or localStorage
- NEVER commit .env files or secrets
- NEVER modify linter/formatter configurations to suppress warnings
- NEVER use `--no-verify` with git commits
- NEVER install packages without explicit justification in the commit message
- NEVER use inline styles — use Tailwind classes only

## Debugging Rules
- NEVER guess-and-check. Always reproduce the bug first.
- Read error messages and stack traces completely before proposing fixes.
- When a fix attempt fails twice, stop and re-analyze from scratch.
- After fixing, run the full test suite, not just the affected test.

## Git Conventions
- Commit message 格式：`type(scope): description` (如 `feat(timeline): add date-based grouping`)
- Types: feat, fix, refactor, test, docs, chore
- 每个 task 完成后立即 commit，不积攒多个 task
- 每个 commit 必须通过所有现有测试
```

***

# 文档 2：PRODUCT\_SPEC.md

```markdown
# PRODUCT_SPEC.md — ego-memory-anchor 产品规格书

## 产品愿景
**一句话：永不丢失关于 TA 的真实记忆。**

ego-memory-anchor（忆锚）是一个一站式真实记忆聚合平台，帮助丧亲/丧宠者将散落在手机相册、微信聊天、社交媒体、云盘等各处的逝者真实记录安全聚合，自动生成时间线，支持家庭成员共同守护。

### 我们不是什么
- 不是"数字永生"产品 — 我们不模拟、不合成、不"复活"任何人
- 不是 AI 聊天机器人 — 我们不生成逝者从未说过的话
- 不是社交平台 — 不做公开分享、不做社区、不做点赞评论
- 不是硬件设备 — 我们是一个可随时访问的 Web 应用

### 核心设计原则
1. **真实性至上** — 平台上的每一张图片、每一段声音、每一行文字都是用户上传的原始真实记录。系统标注"原始记录"标签，永不篡改。
2. **降低摩擦** — 用户正在经历丧亲之痛，认知资源极度有限。每一步操作都必须极简、直觉、零学习成本。
3. **尊重振荡** — 基于 Dual Process Model：用户需要在"面对丧失"和"重建生活"之间自由切换。产品不主动推送、不制造粘性、不诱导沉浸。用户想来就来，想走就走。
4. **家庭共建** — 记忆不属于某一个人。家庭成员都能贡献素材和注释，共同守护。
5. **数据主权** — 用户拥有全部数据。可一键导出，可一键删除。不做数据分析，不投广告，不分享给第三方。

---

## 用户画像

### 主要用户：小雨，32岁，产品经理
- 三个月前父亲因心梗突然去世，来不及告别
- 手机里有大量父亲的照片（未整理），微信里有和父亲的聊天记录（包含珍贵语音条），云盘里有过年时的家庭视频
- 最害怕的事：换手机时丢失这些记录
- 需求：把所有素材汇集到一个安全的地方，按时间整理，偶尔打开看看、听听
- 她不需要 AI 和她父亲"对话" — 她需要确保真实的记忆永远不会丢失

### 次要用户：陈姐，48岁，家庭主妇
- 母亲两年前去世，留下大量手写家书和老照片
- 想把这些数字化保存，并和在外地的弟弟妹妹共享
- 重视"原汁原味" — 扫描件就好，不要美化修复

### 次要用户：Leo，25岁，自由职业
- 养了8年的猫上个月去世
- 有很多猫的照片和视频，散落在手机相册和朋友圈
- 想整理成一个"猫的一生"时间线，偶尔翻看

---

## MVP 功能需求

### P0 — 必须有（MVP 核心）

#### F1: 用户认证
- 邮箱注册/登录（Supabase Auth）
- 手机号验证码登录（Supabase Auth + SMS provider）— 中国用户首选
- 登出

#### F2: 逝者档案管理
- 创建逝者档案：姓名、头像（上传一张照片）、生卒日期、与用户关系（下拉选择+自定义输入）、一句话描述（选填）
- 编辑档案
- 删除档案（二次确认 + 软删除30天）
- 一个用户可创建多个档案（如：父亲 + 母亲 + 宠物）
- Dashboard 展示所有档案卡片

#### F3: 记忆素材上传
- 支持 5 种类型：照片(JPG/PNG/HEIC)、视频(MP4/MOV, ≤500MB)、语音(MP3/M4A/OGG/微信silk格式)、文字记录(纯文本输入)、扫描件(PDF/JPG/PNG)
- 批量上传：支持一次选择多个文件
- 自动读取 EXIF 日期作为素材日期；无 EXIF 时提示用户手动选择日期
- 每条素材可添加：日期、标签（多选，预设+自定义）、文字注释
- 上传后标注"原始记录"标签（不可修改）
- 上传进度条 + 上传完成提示

#### F4: 微信聊天记录导入
- 支持微信导出的标准格式（txt 文件 + 媒体文件夹）
- 自动解析：按消息时间排列，识别文字/图片/语音/视频消息
- 解析后自动生成独立的记忆素材条目
- 标注来源为"微信聊天记录"

#### F5: 时间线视图
- 所有素材按日期降序排列（最新在上）
- 按年份/月份分组，带分组标题
- 每条素材显示：缩略图/图标 + 日期 + 类型标签 + 注释摘要
- 点击素材进入详情页
- 筛选：按类型（照片/视频/语音/文字/扫描件）、按标签、按日期范围
- 语音素材：在时间线上可直接点击播放，无需进入详情

#### F6: 素材详情页
- 照片：全屏查看，支持缩放
- 视频：内嵌播放器
- 语音：波形可视化播放器（显示时长、播放进度）
- 文字：全文显示
- 扫描件：PDF 内嵌查看器 / 图片全屏
- 显示所有元数据：日期、来源标记、标签、贡献者
- 注释区域：所有家庭成员都可添加注释

### P1 — 应该有（MVP 完成后紧接着做）

#### F7: 家庭成员协作
- 档案创建者可生成邀请链接
- 被邀请者注册/登录后获得该档案的访问权限
- 权限分两级：查看者（只能看）、贡献者（可上传素材和添加注释）
- 成员列表管理（移除成员、修改权限）

#### F8: 纪念日提醒
- 用户设置纪念日期：生日、忌日、自定义日期
- 支持农历日期（中国用户刚需：清明、忌日常用农历）
- 提醒方式 MVP 阶段：浏览器 Push Notification + 邮件
- 提醒内容：日期名称 + 随机展示一条该档案的记忆素材

#### F9: 数据导出
- 一键导出某个档案的全部素材（打包为 zip）
- 导出包含所有原始文件 + 一个 metadata.json（含日期、标签、注释）

### P2 — 可以有（V2 考虑）

- F10: 语音素材转文字（ASR），方便搜索
- F11: 照片 AI 分类辅助（人脸聚类、场景识别）— 仅辅助整理，不生成新内容
- F12: 旧照片 AI 修复（标注"AI增强"水印）
- F13: PWA 离线访问（Service Worker 缓存已浏览素材）
- F14: 多语言支持
- F15: 生前录制模式（本人录制语音/视频遗言）

---

## 明确的"不做"列表（MVP 及可预见的未来）
- ❌ AI 对话 / 聊天机器人 — 违背真实性原则
- ❌ AI 语音合成 / 克隆 — 违背真实性原则
- ❌ AI 图像/视频生成 — 违背真实性原则
- ❌ 全息投影 / AR / VR — 在错误维度上做加法
- ❌ 社交媒体自动爬取 — API 权限复杂，隐私风险
- ❌ 公开分享 / 社区 / 点赞评论 — 不是社交产品
- ❌ 广告 / 数据分析 / 第三方数据分享 — 数据神圣不可侵犯
- ❌ 原生 App（MVP 阶段）— Web PWA 优先
- ❌ 支付/订阅（MVP 阶段）— 先验证需求再考虑变现

---

## MVP 成功指标
- 种子用户能在 10 分钟内完成：注册 → 创建档案 → 上传第一批素材 → 看到时间线
- 上传 50 张照片 + 10 段语音 + 1 份微信聊天记录后，时间线自动生成且准确
- 邀请一名家庭成员后，对方能在 2 分钟内看到所有素材并添加注释
- 页面加载时间 < 2s（首屏）
- 所有数据 RLS 隔离验证通过

---

## 设计风格指导
- **色调**：温暖、克制、不花哨。主色调建议暖灰/米色系，避免纯黑（太冷）和亮色（太喧闹）
- **字体**：中文用系统默认（苹方/思源黑体），不引入花哨字体
- **动效**：极简。素材加载用 skeleton，过渡用 fade，不要弹跳/飞入等注意力抢夺型动效
- **情感基调**：安静、尊重、陪伴。不说"AI复活""数字永生"，说"守护记忆""永不丢失"
- **空状态设计**：当用户刚创建档案、还没上传任何素材时，不要显示冰冷的空白页。用温暖的插画 + 引导文案："开始收集关于 TA 的第一份记忆"
```

***

# 文档 3：DESIGN.md

```markdown
# DESIGN.md — ego-memory-anchor 技术蓝图

## 系统架构

```

┌────────────────────────────────┐
│         用户浏览器              │
│   Next.js (React Server        │
│   Components + Client          │
│   Components)                  │
└──────────┬─────────────────────┘
│ HTTPS
▼
┌────────────────────────────────┐
│      Vercel (Next.js Host)     │
│  ┌──────────┐ ┌──────────────┐ │
│  │  Server   │ │   Server     │ │
│  │Components │ │  Actions     │ │
│  └─────┬────┘ └──────┬───────┘ │
│        │              │         │
└────────┼──────────────┼─────────┘
│              │
▼              ▼
┌────────────────────────────────┐
│        Supabase                │
│  ┌────────┐ ┌───────┐ ┌─────┐ │
│  │  Auth   │ │Postgres│ │Stor-│ │
│  │        │ │ + RLS  │ │ age │ │
│  └────────┘ └───────┘ └─────┘ │
└────────────────────────────────┘

````

---

## 数据库 Schema

### 表：profiles（逝者档案）
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_path TEXT,                    -- Supabase Storage path
  birth_date DATE,
  death_date DATE,
  relationship TEXT NOT NULL,          -- '父亲','母亲','配偶','朋友','宠物-猫','宠物-狗'...
  relationship_custom TEXT,            -- 自定义关系描述
  description TEXT,                    -- 一句话描述
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ              -- 软删除
);

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 创建者可以完全操作
CREATE POLICY "owner_all" ON profiles
  FOR ALL USING (auth.uid() = owner_id);

-- 被邀请的家庭成员可以查看
CREATE POLICY "family_select" ON profiles
  FOR SELECT USING (
    id IN (
      SELECT profile_id FROM family_members
      WHERE user_id = auth.uid() AND deleted_at IS NULL
    )
  );
````

### 表：memories（记忆素材）

```sql
CREATE TYPE memory_type AS ENUM ('photo', 'video', 'audio', 'text', 'document');

CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  uploader_id UUID NOT NULL REFERENCES auth.users(id),
  type memory_type NOT NULL,
  
  -- 文件相关
  file_path TEXT,                      -- Supabase Storage path (text 类型无文件)
  file_name TEXT,                      -- 原始文件名
  file_size BIGINT,                    -- 字节
  mime_type TEXT,
  thumbnail_path TEXT,                 -- 缩略图路径（视频/照片）
  duration_seconds REAL,               -- 音频/视频时长
  
  -- 内容
  text_content TEXT,                   -- text 类型的正文；或其他类型的标题
  
  -- 元数据
  memory_date DATE,                    -- 素材对应的日期（EXIF 或用户指定）
  memory_date_source TEXT DEFAULT 'manual', -- 'exif' | 'manual' | 'wechat_export'
  source_label TEXT DEFAULT '原始记录', -- 来源标记（不可变）
  import_source TEXT,                  -- 'upload' | 'wechat_import'
  
  -- 标签（使用 JSONB 数组，MVP 阶段不单独建标签表）
  tags JSONB DEFAULT '[]'::JSONB,      -- ["春节", "旅行", "日常"]
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_memories_profile_date ON memories(profile_id, memory_date DESC);
CREATE INDEX idx_memories_type ON memories(profile_id, type);
CREATE INDEX idx_memories_tags ON memories USING GIN(tags);

-- RLS
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- 档案创建者可以完全操作
CREATE POLICY "owner_all" ON memories
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE owner_id = auth.uid())
  );

-- 贡献者可以查看和插入
CREATE POLICY "contributor_select_insert" ON memories
  FOR SELECT USING (
    profile_id IN (
      SELECT profile_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'contributor' AND deleted_at IS NULL
    )
  );

CREATE POLICY "contributor_insert" ON memories
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT profile_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'contributor' AND deleted_at IS NULL
    )
  );

-- 查看者只能查看
CREATE POLICY "viewer_select" ON memories
  FOR SELECT USING (
    profile_id IN (
      SELECT profile_id FROM family_members
      WHERE user_id = auth.uid() AND role = 'viewer' AND deleted_at IS NULL
    )
  );
```

### 表：annotations（注释）

```sql
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- RLS: 同 memories 的访问逻辑
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;
```

### 表：family\_members（家庭成员）

```sql
CREATE TYPE family_role AS ENUM ('viewer', 'contributor');

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  role family_role NOT NULL DEFAULT 'viewer',
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  
  UNIQUE(profile_id, user_id)
);

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
```

### 表：invitations（邀请链接）

```sql
CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  role family_role NOT NULL DEFAULT 'viewer',
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
```

### 表：reminders（纪念日提醒）

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,                  -- "生日", "忌日", "清明", 自定义
  date_solar DATE,                     -- 公历日期 (月-日)
  date_lunar TEXT,                     -- 农历日期 (格式: "腊月廿三")
  is_lunar BOOLEAN DEFAULT FALSE,
  notify_email BOOLEAN DEFAULT TRUE,
  notify_push BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
```

***

## Supabase Storage Buckets

```
buckets:
  - name: avatars
    public: false
    file_size_limit: 5MB
    allowed_mime_types: ['image/jpeg', 'image/png', 'image/heic', 'image/webp']
    
  - name: memories
    public: false
    file_size_limit: 500MB
    allowed_mime_types: ['image/*', 'video/*', 'audio/*', 'application/pdf']
    
  - name: thumbnails
    public: false
    file_size_limit: 1MB
    allowed_mime_types: ['image/jpeg', 'image/webp']
```

Storage 路径规范：

```
avatars/{user_id}/{profile_id}/avatar.{ext}
memories/{user_id}/{profile_id}/{memory_id}/{original_filename}
thumbnails/{user_id}/{profile_id}/{memory_id}/thumb.webp
```

***

## 页面与组件结构

### 页面路由

| 路由                                | 组件                  | 类型     | 说明             |
| --------------------------------- | ------------------- | ------ | -------------- |
| `/`                               | LandingPage         | Server | 首页，未登录可见       |
| `/login`                          | LoginPage           | Client | 邮箱/手机登录        |
| `/register`                       | RegisterPage        | Client | 注册             |
| `/dashboard`                      | DashboardPage       | Server | 所有档案卡片列表       |
| `/profile/new`                    | ProfileCreatePage   | Client | 创建新档案          |
| `/profile/[id]`                   | ProfileTimelinePage | Server | 时间线主视图         |
| `/profile/[id]/upload`            | UploadPage          | Client | 上传素材           |
| `/profile/[id]/memory/[memoryId]` | MemoryDetailPage    | Server | 素材详情           |
| `/profile/[id]/family`            | FamilyManagePage    | Client | 家庭成员管理         |
| `/profile/[id]/reminders`         | RemindersPage       | Client | 纪念日设置          |
| `/profile/[id]/settings`          | ProfileSettingsPage | Client | 档案编辑/删除        |
| `/settings`                       | AccountSettingsPage | Client | 账户设置/数据导出/删除账户 |
| `/invite/[token]`                 | InviteAcceptPage    | Client | 接受邀请链接         |

### 核心组件树

```
Layout
├── Navbar
│   ├── Logo
│   ├── UserMenu (avatar + dropdown)
│   └── BackButton (在子页面显示)
│
├── DashboardPage
│   ├── ProfileCardGrid
│   │   ├── ProfileCard (name, avatar, date, memory count)
│   │   └── AddProfileCard (+ 创建新档案)
│   └── EmptyState ("开始守护第一份记忆")
│
├── ProfileTimelinePage
│   ├── ProfileHeader (avatar, name, dates, description)
│   ├── TimelineToolbar
│   │   ├── FilterByType (photo/video/audio/text/document)
│   │   ├── FilterByTag (multi-select)
│   │   ├── DateRangePicker
│   │   └── UploadButton
│   ├── Timeline
│   │   ├── YearGroup ("2024年")
│   │   │   ├── MonthGroup ("3月")
│   │   │   │   ├── MemoryCard
│   │   │   │   │   ├── Thumbnail / AudioWaveform / TextPreview / DocIcon
│   │   │   │   │   ├── DateBadge
│   │   │   │   │   ├── TypeBadge
│   │   │   │   │   ├── TagList
│   │   │   │   │   └── AnnotationPreview
│   │   │   │   └── MemoryCard ...
│   │   │   └── MonthGroup ...
│   │   └── YearGroup ...
│   └── TimelineEmpty ("上传第一份素材，开始构建 TA 的时间线")
│
├── UploadPage
│   ├── DropZone (drag & drop + click to select)
│   ├── FileList
│   │   └── FileItem (preview, name, size, date picker, tag input, annotation)
│   ├── WeChatImportSection
│   │   ├── WeChatInstructions (教用户如何导出)
│   │   └── WeChatFileUploader (上传 txt + media folder as zip)
│   └── UploadProgressBar
│
├── MemoryDetailPage
│   ├── MediaViewer
│   │   ├── PhotoViewer (zoom, pan)
│   │   ├── VideoPlayer
│   │   ├── AudioPlayer (waveform visualization)
│   │   ├── TextViewer
│   │   └── DocumentViewer (PDF embed)
│   ├── MetadataPanel (date, source, tags, uploader)
│   └── AnnotationSection
│       ├── AnnotationList
│       │   └── AnnotationItem (author, content, time)
│       └── AnnotationInput
│
└── UI Components (shared)
    ├── Button (variants: primary, secondary, ghost, danger)
    ├── Input
    ├── TextArea
    ├── Select
    ├── DatePicker (支持公历+农历)
    ├── TagInput (创建+选择标签)
    ├── Modal (确认对话框)
    ├── Toast (成功/错误通知)
    ├── Skeleton (加载占位)
    ├── Avatar
    └── Badge
```

***

## 关键交互流程

### 流程 1：上传素材

```
用户进入 UploadPage
  → 拖拽文件到 DropZone / 点击选择文件
  → 客户端：读取 EXIF 日期（使用 exifr 库）
  → 客户端：生成缩略图（照片用 canvas resize，视频取第一帧）
  → 客户端：显示 FileList，每个文件预填 EXIF 日期
  → 用户可修正日期、添加标签和注释
  → 用户点击"上传"
  → 客户端：调用 Server Action 获取 Supabase Storage signed upload URL
  → 客户端：直接上传文件到 Supabase Storage（带进度回调）
  → 上传完成后：Server Action 创建 memories 记录 + thumbnails
  → 上传缩略图到 thumbnails bucket
  → 显示成功提示，自动跳转到时间线
```

### 流程 2：微信聊天记录导入

```
用户进入 UploadPage → WeChatImportSection
  → 阅读导出教程（展示微信备份→导出聊天记录→选择 txt 格式的步骤截图）
  → 上传 zip 文件（包含 txt + 媒体文件夹）
  → 客户端：解压 zip（使用 JSZip）
  → 客户端：解析 txt 文件（wechat-parser.ts）
    → 正则匹配消息格式：日期 时间 发送者\n内容
    → 识别媒体引用：[图片]、[语音]、[视频]
    → 映射媒体文件：从解压的文件夹中匹配
  → 客户端：生成预览列表，用户可勾选要导入的消息
  → 用户确认后：批量创建 memories 记录 + 上传媒体文件
  → 所有导入素材标注 import_source = 'wechat_import'
```

### 流程 3：家庭成员邀请

```
档案创建者进入 FamilyManagePage
  → 点击"生成邀请链接"
  → 选择权限：查看者 / 贡献者
  → Server Action：创建 invitations 记录，返回含 token 的链接
  → 用户复制链接发给家人（微信/短信）
  
被邀请者点击链接
  → 进入 InviteAcceptPage
  → 如未登录：引导注册/登录
  → 登录后：Server Action 验证 token 有效性 + 创建 family_members 记录
  → 跳转到该档案的时间线页面
```

***

## 微信聊天记录解析规范 (wechat-parser.ts)

微信 iOS/Android 导出的 txt 格式：

```
2024-01-15 09:23:45 张三
今天天气真好
2024-01-15 09:24:12 李四
是啊，出去走走吧
2024-01-15 09:25:00 张三
[图片]
2024-01-15 09:26:30 李四
[语音]
```

解析规则：

1. 消息头：`/^(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(.+)$/`
2. 消息体：头部之后、下一个消息头之前的所有行
3. 媒体消息识别：`[图片]`、`[语音]`、`[视频]`、`[文件]`
4. 媒体文件匹配：按消息顺序与媒体文件夹中的文件顺序对应
5. 过滤逻辑：用户指定逝者姓名，只导入与该姓名相关的消息（逝者发送的 + 与逝者的对话上下文）

***

## 安全设计

### 认证

* Supabase Auth 管理所有用户会话
* Next.js middleware 检查 session，未登录重定向到 /login
* Server Actions 中始终验证 auth.uid()

### 数据隔离

* 所有表启用 RLS
* Storage bucket 不设置 public
* 所有文件访问通过 signed URL（有效期 1 小时）

### 数据保护

* Supabase Storage 默认 server-side encryption (AES-256)
* 不在客户端 localStorage 存储敏感数据
* 软删除 + 30天后硬删除（Supabase Edge Function 定时任务）

### 用户数据权限

* 导出：打包所有原始文件 + metadata.json
* 删除账户：级联删除所有 profiles → memories → annotations → files

````

---

# 文档 4：TASKS.md

```markdown
# TASKS.md — ego-memory-anchor MVP 任务分解

## 执行说明
- 按 Sprint 顺序执行，每个 Sprint 内按任务编号顺序执行
- 每个任务完成后立即 commit + 运行测试
- 标注 [Opus] 的任务由 Opus 执行，其余由 Sonnet subagent 执行
- 每个任务的"验证"部分是必须通过的检查点

---

## Sprint 0：项目初始化

### T0.1 [Opus] 初始化 Next.js 项目
- 输入：CLAUDE.md 中的技术栈定义
- 操作：
  - `pnpm create next-app@latest ego-memory-anchor --typescript --tailwind --app --src-dir`
  - 配置 tsconfig.json strict mode
  - 安装核心依赖：`@supabase/supabase-js`, `@supabase/ssr`
  - 创建 .env.local.example
  - 创建 src/ 下的完整目录结构（按 CLAUDE.md 的文件结构）
  - 配置 tailwind.config.ts 主题色（暖灰色系）
- 验证：`pnpm build` 成功，目录结构符合 CLAUDE.md

### T0.2 配置 Supabase 本地开发环境
- 操作：
  - `supabase init`
  - `supabase start` 确认本地实例运行
  - 创建 src/lib/supabase/client.ts（浏览器端）
  - 创建 src/lib/supabase/server.ts（服务端）
  - 创建 src/lib/supabase/middleware.ts（auth helper）
- 验证：本地 Supabase Dashboard 可访问，client 连接成功

### T0.3 配置测试环境
- 操作：
  - 安装 vitest + @testing-library/react + jsdom
  - 创建 vitest.config.ts
  - 安装 playwright
  - 创建 playwright.config.ts
  - 创建一个 hello world 测试确认环境正常
- 验证：`pnpm test` 和 `pnpm test:e2e` 能跑通空测试

### T0.4 创建数据库 migration
- 输入：DESIGN.md 中的完整 Schema
- 操作：
  - 创建 supabase/migrations/001_initial_schema.sql
  - 包含所有表、RLS 策略、索引
  - 创建 Storage buckets（avatars, memories, thumbnails）
  - 配置 Storage RLS
- 验证：`supabase db reset` 成功，所有表和策略创建正确

### T0.5 生成 TypeScript 类型
- 操作：
  - `supabase gen types typescript --local > src/lib/types/database.ts`
  - 在 src/lib/types/index.ts 中导出常用类型别名
- 验证：类型文件生成且 TypeScript 编译通过

---

## Sprint 1：认证 + 档案管理 + 基础布局

### T1.1 实现 Auth Middleware
- 输入：Supabase SSR 认证文档
- 操作：
  - 创建 src/middleware.ts
  - 未登录用户访问 /dashboard, /profile/* → 重定向到 /login
  - 已登录用户访问 /login, /register → 重定向到 /dashboard
  - 刷新 session token
- 验证：单元测试覆盖重定向逻辑

### T1.2 实现登录页
- 操作：
  - 创建 src/app/(auth)/login/page.tsx
  - 表单：邮箱 + 密码输入，登录按钮
  - 调用 Supabase Auth signInWithPassword
  - 错误处理：显示友好错误信息
  - 底部链接：没有账号？去注册
  - 样式：居中卡片，暖灰背景，logo 在上方
- 验证：手动测试可登录，错误时显示提示

### T1.3 实现注册页
- 操作：
  - 创建 src/app/(auth)/register/page.tsx
  - 表单：邮箱 + 密码 + 确认密码
  - 调用 Supabase Auth signUp
  - 密码验证：≥8位，包含字母和数字
  - 注册后提示查看邮箱确认（或自动登录，取决于 Supabase 配置）
- 验证：注册后用户存在于 auth.users

### T1.4 实现基础布局和导航栏
- 操作：
  - 创建 src/app/(main)/layout.tsx
  - Navbar 组件：左侧 logo "忆锚"，右侧用户头像 + 下拉菜单（设置、退出）
  - 移动端：hamburger menu
  - 响应式：mobile-first
- 验证：桌面和移动端导航正常切换

### T1.5 实现 Dashboard 页面
- 操作：
  - 创建 src/app/(main)/dashboard/page.tsx（Server Component）
  - 查询当前用户的所有 profiles（包含 family_members 中被邀请的）
  - ProfileCard 组件：头像、姓名、日期范围、素材数量
  - AddProfileCard：点击进入创建页面
  - 空状态：温暖插画 + "开始守护第一份记忆"
- 验证：无档案时显示空状态；创建档案后显示卡片

### T1.6 实现 Profile 创建 Server Action
- 操作：
  - 创建 src/lib/actions/profile.ts
  - createProfile action：验证输入 → 上传头像到 Storage → 创建 profiles 记录 → 返回 profile id
  - 输入验证：姓名必填，日期格式，文件类型检查
- 验证：单元测试覆盖正常创建和验证失败场景

### T1.7 实现 Profile 创建页面
- 操作：
  - 创建 src/app/(main)/profile/new/page.tsx（Client Component）
  - 表单：姓名、头像上传（带预览）、出生日期、去世日期、关系（下拉）、一句话描述
  - 使用 useActionState 绑定 Server Action
  - 提交后跳转到该 profile 的时间线页面
- 验证：填写表单 → 提交 → 跳转到时间线

### T1.8 实现 Profile 编辑和删除
- 操作：
  - 创建 src/app/(main)/profile/[id]/settings/page.tsx
  - 编辑：同创建表单，预填已有数据
  - 删除：二次确认 Modal → 软删除（设置 deleted_at）
  - Server Actions：updateProfile, deleteProfile
- 验证：编辑后数据更新；删除后 dashboard 不再显示

---

## Sprint 2：素材上传 + 时间线

### T2.1 实现 EXIF 日期提取工具
- 操作：
  - 安装 `exifr` 库
  - 创建 src/lib/utils/exif.ts
  - extractDate(file: File): Promise<Date | null>
  - 支持 JPEG, HEIC, PNG 的 DateTimeOriginal / CreateDate
- 验证：单元测试用真实照片文件测试日期提取

### T2.2 实现文件验证工具
- 操作：
  - 创建 src/lib/utils/file.ts
  - validateFile(file, type): 检查 mime type + 文件大小
  - getMemoryType(file): File → memory_type enum
  - formatFileSize(bytes): 人类可读文件大小
- 验证：单元测试覆盖各类型文件

### T2.3 实现上传 Server Actions
- 操作：
  - 创建 src/lib/actions/memory.ts
  - getUploadUrl(profileId, fileName, mimeType): 返回 Supabase signed upload URL
  - createMemory(data): 创建 memories 记录
  - createMemoryBatch(data[]): 批量创建
- 验证：单元测试

### T2.4 实现上传页面 — DropZone + FileList
- 操作：
  - 创建 src/app/(main)/profile/[id]/upload/page.tsx
  - DropZone 组件：drag & drop + click to browse
  - FileList 组件：每个文件显示缩略图/图标、文件名、大小
  - 每个文件可设置：日期（预填 EXIF）、标签（TagInput）、注释（TextArea）
  - 上传按钮：批量上传，显示总进度
- 验证：手动测试拖拽上传和点击上传

### T2.5 实现客户端直传 Supabase Storage
- 操作：
  - 在 upload page 中实现：
    1. 获取 signed URL (Server Action)
    2. fetch PUT 上传文件 (带 onUploadProgress 回调)
    3. 上传缩略图
    4. 创建 memories 记录 (Server Action)
  - UploadProgressBar 组件：显示当前文件进度 + 总进度
- 验证：上传 5MB 照片 + 100MB 视频，进度条正确，记录创建成功

### T2.6 实现客户端缩略图生成
- 操作：
  - 照片：Canvas resize 到 300x300，导出 webp
  - 视频：创建 video 元素，seekTo(1)，Canvas capture
  - 语音/文字/文档：使用预定义图标，不生成缩略图
- 验证：照片和视频能生成清晰缩略图

### T2.7 实现时间线页面 — 数据层
- 操作：
  - 创建 src/app/(main)/profile/[id]/page.tsx（Server Component）
  - 查询该 profile 的所有 memories（含 annotations count）
  - 按日期降序排列
  - 按年份→月份分组
  - 传递给客户端 Timeline 组件
- 验证：查询结果按日期正确分组

### T2.8 实现时间线页面 — UI 组件
- 操作：
  - ProfileHeader 组件：头像、姓名、日期、描述、"上传"按钮
  - Timeline 组件：渲染 YearGroup → MonthGroup → MemoryCard
  - MemoryCard：缩略图、日期徽标、类型徽标、标签、注释摘要
  - 点击 MemoryCard → 导航到 /memory/[memoryId]
  - 空状态设计
- 验证：上传 10 条不同类型素材后，时间线正确显示

### T2.9 实现时间线筛选
- 操作：
  - TimelineToolbar 组件
  - FilterByType：多选按钮组（照片/视频/语音/文字/扫描件）
  - FilterByTag：从已有标签中多选
  - 筛选使用 URL searchParams（服务端筛选），不用客户端状态
- 验证：筛选后时间线正确更新

### T2.10 实现语音内联播放
- 操作：
  - 在 MemoryCard 中，audio 类型显示 mini AudioPlayer
  - 点击播放/暂停，显示进度条和时长
  - 不需要全屏跳转即可播放
- 验证：时间线中可直接播放语音

---

## Sprint 3：素材详情 + 注释 + 微信导入

### T3.1 实现素材详情页
- 操作：
  - 创建 src/app/(main)/profile/[id]/memory/[memoryId]/page.tsx
  - 根据 type 渲染不同 viewer：
    - PhotoViewer：全屏查看，支持缩放（pinch-to-zoom）
    - VideoPlayer：原生 HTML5 video + controls
    - AudioPlayer：波形可视化（使用 wavesurfer.js 或轻量替代）
    - TextViewer：全文渲染，保留换行
    - DocumentViewer：PDF 用 iframe embed
  - MetadataPanel：日期、来源标记（"原始记录"）、标签、上传者
- 验证：5 种类型各测试一条

### T3.2 实现注释功能
- 操作：
  - 创建 src/lib/actions/annotation.ts（createAnnotation, deleteAnnotation）
  - AnnotationSection 组件：列表 + 输入框
  - AnnotationItem：作者名、内容、时间
  - AnnotationInput：TextArea + 提交按钮
  - 提交后 revalidatePath 刷新页面
- 验证：添加注释 → 刷新页面 → 注释持久化

### T3.3 实现微信聊天记录解析器
- 操作：
  - 创建 src/lib/utils/wechat-parser.ts
  - 安装 jszip
  - parseWeChatExport(zipFile: File): Promise<WeChatMessage[]>
  - 正则解析 txt 消息格式
  - 识别并映射媒体文件
  - 按发送者筛选
- 验证：单元测试用模拟的微信导出文件测试解析

### T3.4 实现微信导入 UI
- 操作：
  - WeChatImportSection 组件（在 UploadPage 中）
  - 教程步骤展示（带截图占位）
  - zip 文件上传
  - 解析进度
  - 消息预览列表（可勾选）
  - 确认导入 → 批量创建 memories
- 验证：导入模拟数据后时间线正确显示

---

## Sprint 4：家庭协作 + 纪念日 + 收尾

### T4.1 实现邀请链接 Server Actions
- 操作：
  - 创建 src/lib/actions/family.ts
  - createInvitation(profileId, role): 生成邀请记录 + 返回链接
  - acceptInvitation(token): 验证 token → 创建 family_members → 返回 profileId
  - removeFamilyMember(memberId)
  - updateMemberRole(memberId, role)
- 验证：单元测试覆盖正常流程和过期/已使用 token

### T4.2 实现家庭管理页面
- 操作：
  - 创建 src/app/(main)/profile/[id]/family/page.tsx
  - 成员列表：姓名、角色、移除按钮、角色切换
  - 生成邀请链接：选择角色 → 生成 → 复制到剪贴板
  - 只有档案 owner 能访问此页面
- 验证：生成链接 → 另一账号打开 → 接受邀请 → 出现在成员列表

### T4.3 实现邀请接受页面
- 操作：
  - 创建 src/app/invite/[token]/page.tsx
  - 未登录：显示邀请信息 + 引导注册/登录
  - 已登录：显示邀请信息 + 确认按钮 → 接受 → 跳转
  - Token 过期/无效：友好错误提示
- 验证：完整流程测试

### T4.4 实现纪念日提醒设置
- 操作：
  - 创建 src/lib/actions/reminder.ts（CRUD）
  - 创建 src/app/(main)/profile/[id]/reminders/page.tsx
  - 提醒列表 + 新增表单
  - 日期输入支持公历 + 农历切换
  - 农历库：安装 `lunar-javascript` 或 `chinese-lunar` 处理农历转换
  - MVP 提醒仅存储设置，实际推送留到 Sprint 5
- 验证：能创建/编辑/删除提醒，农历转公历正确

### T4.5 实现 Landing Page
- 操作：
  - 创建 src/app/page.tsx
  - Hero：标题 "永不丢失关于 TA 的真实记忆" + 副标题 + CTA 按钮
  - 三个价值主张卡片：聚合 / 时间线 / 家庭共建
  - 底部：隐私承诺（零合成、零广告、数据属于你）
  - 简洁、温暖、不煽情
- 验证：页面渲染正确，CTA 跳转到注册

### T4.6 实现账户设置页
- 操作：
  - 创建 src/app/(main)/settings/page.tsx
  - 修改密码
  - 数据导出（placeholder — 实际导出功能 P1）
  - 删除账户（二次确认 → 级联删除）
- 验证：删除账户后所有数据清除

### T4.7 响应式优化 Pass
- 操作：
  - 逐页检查移动端布局
  - 修复溢出、间距、字号问题
  - 上传页面移动端可用性（相机直拍上传）
  - 时间线在移动端使用单列布局
- 验证：iPhone SE (375px) 到 iPad (768px) 到桌面 (1440px) 均正常

### T4.8 [Opus] E2E 测试编写
- 操作：
  - 核心流程：注册 → 创建档案 → 上传 3 种类型素材 → 查看时间线 → 添加注释
  - 协作流程：邀请家人 → 接受邀请 → 查看素材 → 添加注释
  - 边界：未登录重定向 → 无权限 403 → 删除档案
- 验证：`pnpm test:e2e` 全部通过

### T4.9 性能优化
- 操作：
  - 图片懒加载（Next.js Image 组件的 lazy 默认行为）
  - 时间线虚拟滚动（当素材 > 100 条时，使用 @tanstack/react-virtual）
  - 缩略图用 webp 格式，≤50KB
  - Supabase 查询加 .limit() 分页
- 验证：Lighthouse Performance > 80，100+ 素材时间线流畅滚动

### T4.10 部署到 Vercel
- 操作：
  - 创建 Vercel 项目
  - 设置环境变量（Supabase URL, Anon Key, Service Role Key）
  - 连接 GitHub repo
  - 部署并验证所有功能在生产环境正常
  - 配置自定义域名（如有）
- 验证：生产 URL 可访问，所有核心流程可用

---

## Sprint 5（Post-MVP，紧接着做）

### T5.1 邮件提醒 Cron Job
- Supabase Edge Function + pg_cron，每日检查到期提醒 → 发邮件

### T5.2 数据导出功能
- Server Action 打包所有文件 + metadata.json → 生成 zip 下载链接

### T5.3 PWA 基础配置
- manifest.json + Service Worker + 离线 fallback 页面
````

***

## 文档生成完毕 — 下一步

以上 4 份文档已准备好供 Claude Code 消费。**在你开始之前，请：**

1. **确认模型方案** — Opus + Sonnet + Haiku？还是你仍想引入 MiniMax？（如果是后者我需要重写 CLAUDE.md 的模型分配部分和工作流）
2. **审阅 4 份文档** — 看看有没有需要调整的需求或设计决策
3. 确认后，按以下顺序执行：

   * 将 4 份文档放入项目根目录
   * 启动 Claude Code，加载项目
   * 运行 `using superpowers` 激活 Superpowers
   * 从 **T0.1** 开始执行
