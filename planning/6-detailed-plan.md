# 最终决策确认与完整文档生成

***

## 回答两个待定问题

### 问题 1：Phase 3 代码审查与 Bug 修复的具体做法

**代码审查 — 使用 Superpowers 的 `/subagent-driven-development`，它内置两阶段审查：**

这个 skill 的工作方式是：为每个任务启动一个新鲜的 subagent 执行编码，完成后自动进入两阶段检查：

* **Stage 1 — Spec 合规性检查**：subagent 对照任务描述逐条验证输出是否符合要求（"DESIGN.md 要求这个组件接收 profileId prop，实际代码是否如此？"）
* **Stage 2 — 代码质量检查**：测试是否通过、是否有 lint 错误、是否引入了回归、命名是否规范

对于**核心/复杂组件**（如 TimelineView、WechatImporter），在 subagent 完成后，再手动触发一次 **Writer/Reviewer 模式**：在当前 session 中对 Sonnet 写的代码发起 Opus 审查。提示词模板：

```
Review the implementation of [组件名] against DESIGN.md section [X].
Check: 1) Does it match the data model? 2) Are edge cases handled?
3) Is there any data mutation that could compromise 真实性?
4) Are there security concerns (RLS bypass, unvalidated input)?
Do NOT rewrite. Only report issues with file:line references.
```

**Bug 修复 — 你用 `/systematic-debugging` 是最佳选择**，流程是：

```
描述症状 → 稳定复现 → 二分定位 (bisect) → 根因假设 → 验证 → 修复 → 回归测试
```

补充一个最佳实践：**ECC 的 hooks 会阻止"修改测试来通过测试"的行为**。如果 bug 修复过程中 Claude 试图修改 test assertions 而不是修复源码，hooks 会拦截。这是非常重要的安全护栏。

当 `systematic-debugging` 在 Sonnet 层级连续失败两次时，**升级到 Opus** 做根因分析。在 CLAUDE.md 里写明这条规则。

### 问题 2：MiniMax m2.7 的现实约束

**Claude Code 的 subagent 系统只支持 Anthropic 模型（Opus / Sonnet / Haiku）。** MiniMax m2.7 无法接入 subagent 工作流，因为：

* Subagent 调用走的是 Anthropic 内部 API，不支持外部模型端点
* 失去 **Checkpoint/Rewind** — 无法回滚 MiniMax 的修改
* 失去 **ECC 安全 hooks** — 无法拦截危险操作
* 失去 **上下文继承** — MiniMax 不知道 CLAUDE.md 里的规则

要用 MiniMax 做实现，等于**放弃整个 Claude Code 自主开发流程**，改为手工协调两个独立 AI 系统。这会把开发效率降低 3-5 倍，完全抵消省 token 的收益。

**你的 Max plan 已包含 Opus + Sonnet + Haiku 的充裕配额。** 我强烈建议：

| 角色           | 模型         | 用量占比  |
| ------------ | ---------- | ----- |
| 规划 / 架构 / 审查 | **Opus**   | \~20% |
| 实现 / 常规修复    | **Sonnet** | \~70% |
| 探索 / 搜索      | **Haiku**  | \~10% |

**如果你之后确实想试 MiniMax**，可以在 MVP 完成后，单独对比 Sonnet 和 MiniMax 在某个独立模块上的表现，再决定 V2 是否引入。但 MVP 阶段不建议引入额外复杂度。

***

## 最终确认清单

| # | 决策项  | 最终方案                                                                |
| - | ---- | ------------------------------------------------------------------- |
| 1 | 工作流  | Phase 0-4 + 2.5 确认点，单 session + Subagents，Superpowers 管流程 + ECC 管安全 |
| 2 | 模型分工 | Opus 规划/审查，Sonnet 实现，Haiku 探索                                       |
| 3 | 用户画像 | 20-60岁，丧亲人或丧宠物者                                                     |
| 4 | 语言   | 中文优先，代码/组件名英文，UI 文字中文                                               |
| 5 | 代号   | **ego-memory-anchor**                                               |

***

以下是 4 份完整文档。直接用于 Claude Code 自主开发。

***

## 文档一：CLAUDE.md

```markdown
# CLAUDE.md — ego-memory-anchor 项目宪法

## 项目概述
ego-memory-anchor（忆锚）是一款面向丧亲/丧宠人群的真实记忆聚合平台。
核心理念：守护真实记录，对抗第二重丧失。绝不生成合成内容。
MVP 形态：中文 Web 应用（PWA-ready）。

## 技术栈（不可更改）
- **框架**: Next.js 15 (App Router, Server Components by default)
- **语言**: TypeScript (strict mode)
- **样式**: Tailwind CSS + shadcn/ui
- **后端**: Supabase (Auth + Postgres + Storage + RLS + Edge Functions)
- **测试**: Vitest + React Testing Library
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
- 表单处理使用 Server Actions
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
- Planning, architecture, review: opus
- Implementation subagents: sonnet
- Explore subagents: haiku
- When a subagent fails twice on the same task, escalate to opus

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
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, register, callback)
│   ├── (main)/            # Authenticated routes
│   │   ├── dashboard/     # Profile list
│   │   ├── profile/       # Profile CRUD + timeline + memories
│   │   └── settings/      # User settings
│   ├── page.tsx           # Landing page
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── timeline/          # Timeline-related components
│   ├── memory/            # Memory display components
│   ├── upload/            # Upload-related components
│   ├── profile/           # Profile components
│   ├── family/            # Family collaboration components
│   └── reminders/         # Reminder components
├── lib/
│   ├── supabase/          # Supabase client setup
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript type definitions
├── supabase/
│   ├── migrations/        # SQL migrations
│   └── seed.sql           # Dev seed data
├── public/                # Static assets
└── tests/                 # Test utilities and setup

```

## 关键设计决策记录
- 为什么 Web 不是 App：DPM 振荡理论要求用户自由进出，app 打开关闭天然符合；家庭协作零摩擦（分享链接）；迭代速度快
- 为什么不做 AI 对话：外化纽带风险 > 收益；研究证据仅 10 人样本；MVP 聚焦真实性
- 为什么不做全息：锚定感来自内容真实性而非呈现介质；全息在错误维度做加法
- 为什么中文优先：种子用户在中国；微信聊天记录解析是差异化功能；清明节是自然需求窗口
```

***

## 文档二：PRODUCT\_SPEC.md

```markdown
# PRODUCT_SPEC.md — ego-memory-anchor MVP 产品规格

## 产品愿景
**永不丢失关于 TA 的真实记忆。**
忆锚是一个真实记忆聚合平台，帮助失去至亲/至爱宠物的人，将散落在手机、微信、硬盘里的真实记录汇集到一处，自动编织成一条可浏览、可注释、可与家人共享的生命时间线。

## 核心理念
1. **真实性至上** — 我们只保存、组织、呈现用户已有的真实素材，绝不生成合成内容
2. **对抗第二重丧失** — 手机换代、账号注销、云存储过期会让记忆证据消散，我们防止这件事发生
3. **促进内化而非外化** — 帮助用户将逝者的影响整合进自我认同，而非创造一个"准在场"实体
4. **尊重振荡** — 用户想看就打开、看完就关，产品不主动制造 loss-orientation

## 目标用户
**主画像**: 20-60岁，近期（1天-3年内）失去至亲（父母/祖父母/配偶/兄弟姐妹）或至爱宠物的人。
**核心场景**: 手机里有大量未整理的照片、微信聊天记录和零散语音消息，害怕换手机或时间流逝后丢失这些。
**次要画像**: 家庭中的其他成员，受邀加入，共同贡献和浏览记忆。

### 用户故事（按优先级）

**P0 — 必须**
- US-01: 作为丧亲者，我要创建一个逝者的档案，记录基本信息和一张代表照片，让我有一个统一的纪念空间
- US-02: 作为丧亲者，我要批量上传照片、视频、语音、文字记录，把散落的记忆汇集到一处
- US-03: 作为丧亲者，我要看到所有素材按时间自动排列的时间线，像翻阅一本生命相册
- US-04: 作为丧亲者，我要播放逝者的原始语音消息，听到 TA 真实的声音
- US-05: 作为丧亲者，我要为每条记忆添加注释，记录"这是哪一年、发生了什么"
- US-06: 作为丧亲者，我要邀请家人加入，让大家一起补充记忆

**P1 — 应该**
- US-07: 作为丧亲者，我要设置生日和忌日提醒，在重要日子被温柔提示
- US-08: 作为丧亲者，我要导入微信聊天记录导出文件，自动解析出文字和媒体
- US-09: 作为丧亲者，我要按标签/类型筛选时间线，快速找到某类记忆
- US-10: 作为丧亲者，我要在手机和电脑上都能舒适使用
- US-11: 作为丧亲者，我要一键导出我的全部数据，确保我的记忆不被平台绑架

**P2 — 可以**
- US-12: 作为丧亲者，我要看到语音消息的波形可视化，"看见"声音
- US-13: 作为家庭成员，我要看到每条记忆是谁上传的

## MVP 功能清单

### 做什么
| 功能 | 描述 | 用户故事 |
|------|------|---------|
| 逝者档案管理 | 创建/编辑/删除逝者档案，含姓名、头像、生卒日期、关系、描述 | US-01 |
| 多档案支持 | 一个账户可管理多个逝者档案 | US-01 |
| 媒体上传 | 支持照片(JPG/PNG/HEIC)、视频(MP4/MOV)、语音(MP3/M4A/WAV)、文字、扫描件(PDF/图片)的上传 | US-02 |
| 批量上传 | 拖拽整个文件夹一次上传 | US-02 |
| EXIF 自动提取 | 上传时自动读取照片/视频的拍摄日期 | US-02 |
| 时间线视图 | 所有素材按日期排列，支持滚动浏览 | US-03 |
| 原生媒体播放 | 内嵌照片查看器、视频播放器、音频播放器 | US-04 |
| 注释功能 | 每条素材可添加/编辑文字注释 | US-05 |
| 家庭邀请 | 通过链接邀请家人，支持查看/编辑两种权限 | US-06 |
| 纪念日提醒 | 设置生日、忌日等循环提醒 (浏览器通知 + 页面内提示) | US-07 |
| 微信记录导入 | 解析微信聊天记录导出文件(txt + 媒体文件夹) | US-08 |
| 筛选与搜索 | 按类型(照片/视频/语音/文字)、标签、日期范围筛选 | US-09 |
| 响应式设计 | 适配手机(375px+)和桌面(1024px+) | US-10 |
| 数据导出 | 一键下载全部素材 + 元数据 ZIP 包 | US-11 |

### 绝不做（MVP 红线）
- ❌ AI 对话 / 聊天机器人
- ❌ AI 语音合成 / 语音克隆
- ❌ AI 图像生成 / 修复 / 动态化
- ❌ 社交媒体自动爬取
- ❌ 原生移动 App (iOS/Android)
- ❌ 支付 / 订阅系统
- ❌ 多语言 (MVP 仅中文)
- ❌ 公开分享 / 社区 / 社交功能
- ❌ 任何形式的数据分析或广告

## 竞品差异化
| 维度 | 市场现有产品 | ego-memory-anchor |
|------|-------------|-------------------|
| 核心策略 | AI 合成/复活逝者 | 守护真实记录 |
| 真实性 | 70%近似 (AI生成) | 100% (仅原始素材) |
| 数据来源 | 少量训练数据 | 用户全量真实素材 |
| 心理风险 | 外化纽带/虚假记忆 | 促进内化纽带 |
| 商业模式依赖 | 用户持续依赖=持续付费 | 用户自然减少使用=产品成功 |
| 家庭协作 | 通常单人使用 | 家庭共建共享 |

## 成功指标 (MVP 阶段)
- 种子用户完成档案创建 + 上传 10 条以上素材的比例 > 60%
- 首次上传到看见时间线的时间 < 3 分钟
- 邀请家人加入的比例 > 30%
- NPS > 40 (通过简单问卷)

## 设计原则
1. **安静、温暖、有尊严** — UI 不花哨、不卖弄科技感，色调温暖柔和
2. **零学习成本** — 不需要教程，操作直觉化
3. **尊重情感状态** — 没有弹窗广告、没有"完善资料"催促、没有 gamification
4. **速度即尊重** — 页面加载 < 1s，上传有进度条，操作有即时反馈
```

***

## 文档三：DESIGN.md

```markdown
# DESIGN.md — ego-memory-anchor 技术蓝图

## 1. 数据模型

### 1.1 ER 关系图

```

auth.users (Supabase Auth)
│
├── 1:N ──> profiles (逝者档案)
│              │
│              ├── 1:N ──> memories (记忆素材)
│              ├── 1:N ──> family\_members (家庭协作)
│              └── 1:N ──> reminders (纪念日提醒)
│
└── 1:N ──> family\_members (被邀请记录)

````

### 1.2 表结构

#### profiles (逝者档案)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK, default gen_random_uuid() | |
| user_id | uuid | FK → auth.users, NOT NULL | 创建者 |
| name | text | NOT NULL | 逝者姓名/昵称 |
| avatar_path | text | | Storage 路径 |
| birth_date | date | | 出生日期 |
| death_date | date | | 去世日期 |
| relationship | text | NOT NULL | 与用户关系 |
| species | text | DEFAULT 'human' | 'human' 或 'pet' |
| description | text | | 一句话描述 |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

#### memories (记忆素材)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK, default gen_random_uuid() | |
| profile_id | uuid | FK → profiles ON DELETE CASCADE, NOT NULL | |
| contributor_id | uuid | FK → auth.users, NOT NULL | 上传者 |
| type | text | NOT NULL, CHECK in ('photo','video','audio','text','document') | 素材类型 |
| file_path | text | | Storage 路径 (text 类型可为空) |
| thumbnail_path | text | | 缩略图 Storage 路径 |
| content | text | | 文字内容 (type='text' 时使用) |
| memory_date | date | | 记忆发生日期 |
| memory_date_precision | text | DEFAULT 'day', CHECK in ('day','month','year','unknown') | 日期精度 |
| tags | text[] | DEFAULT '{}' | 用户标签 |
| annotation | text | | 注释/故事 |
| source_label | text | DEFAULT '原始记录' | 来源标记 (immutable) |
| exif_data | jsonb | | 原始 EXIF |
| file_size | bigint | | 文件大小 (bytes) |
| mime_type | text | | MIME 类型 |
| sort_order | integer | | 同日期内手动排序 |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

#### family_members (家庭协作)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles ON DELETE CASCADE, NOT NULL | |
| user_id | uuid | FK → auth.users | 已注册则关联 |
| invited_email | text | | 邀请邮箱 |
| display_name | text | | 在家庭中的显示名 |
| role | text | DEFAULT 'viewer', CHECK in ('admin','editor','viewer') | |
| invite_token | text | UNIQUE | 邀请链接 token |
| invited_by | uuid | FK → auth.users | 邀请者 |
| invited_at | timestamptz | DEFAULT now() | |
| accepted_at | timestamptz | | |

#### reminders (纪念日提醒)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles ON DELETE CASCADE, NOT NULL | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| title | text | NOT NULL | "爷爷的生日" |
| reminder_date | date | NOT NULL | |
| recurrence | text | DEFAULT 'yearly', CHECK in ('once','yearly','lunar_yearly') | 支持农历 |
| enabled | boolean | DEFAULT true | |
| created_at | timestamptz | DEFAULT now() | |

### 1.3 RLS 策略

```sql
-- profiles: 创建者完全控制，被邀请的家庭成员可查看
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own profiles" ON profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Family members can view profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.profile_id = profiles.id
      AND family_members.user_id = auth.uid()
      AND family_members.accepted_at IS NOT NULL
    )
  );

-- memories: 创建者完全控制，editor 可上传，viewer 可查看
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile owner full access to memories" ON memories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = memories.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Family editors can insert memories" ON memories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.profile_id = memories.profile_id
      AND family_members.user_id = auth.uid()
      AND family_members.role IN ('admin', 'editor')
      AND family_members.accepted_at IS NOT NULL
    )
  );

CREATE POLICY "Family members can view memories" ON memories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.profile_id = memories.profile_id
      AND family_members.user_id = auth.uid()
      AND family_members.accepted_at IS NOT NULL
    )
  );

-- family_members: 档案所有者管理，成员查看自己
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profile owner manages family" ON family_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = family_members.profile_id
      AND profiles.user_id = auth.uid()
    )
  );

CREATE POLICY "Members see own record" ON family_members
  FOR SELECT USING (user_id = auth.uid());

-- reminders: 仅本人
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);
````

### 1.4 Storage Buckets

| Bucket     | 访问                        | 内容        |
| ---------- | ------------------------- | --------- |
| `avatars`  | 认证用户读，所有者写                | 逝者头像      |
| `memories` | RLS 控制 (与 memories 表策略对齐) | 所有上传的媒体文件 |

Storage 文件路径规范: `{user_id}/{profile_id}/{memory_id}/{filename}`

## 2. 页面结构 (App Router)

```
app/
├── page.tsx                          # 首页 (未登录: landing, 已登录: redirect to dashboard)
├── layout.tsx                        # Root layout (font, metadata, Supabase provider)
├── globals.css                       # Tailwind base styles
│
├── (auth)/
│   ├── login/page.tsx                # 登录页 (邮箱+密码, 微信OAuth未来)
│   ├── register/page.tsx             # 注册页
│   ├── callback/route.ts             # Supabase OAuth callback handler
│   └── layout.tsx                    # Auth pages layout (centered card)
│
├── (main)/
│   ├── layout.tsx                    # 主布局 (sidebar/header + content area)
│   ├── dashboard/
│   │   └── page.tsx                  # 逝者档案列表 + 创建入口
│   │
│   ├── profile/
│   │   ├── new/page.tsx              # 创建逝者档案
│   │   └── [profileId]/
│   │       ├── page.tsx              # 时间线视图 (THE CORE PAGE)
│   │       ├── edit/page.tsx         # 编辑档案信息
│   │       ├── upload/page.tsx       # 上传记忆素材
│   │       ├── memory/
│   │       │   └── [memoryId]/page.tsx  # 素材详情 + 注释
│   │       ├── family/page.tsx       # 家庭成员管理
│   │       └── reminders/page.tsx    # 纪念日提醒管理
│   │
│   ├── settings/page.tsx            # 用户设置 (改密码, 导出数据, 删除账号)
│   └── invite/
│       └── [token]/page.tsx          # 接受家庭邀请
│
└── api/
    ├── export/[profileId]/route.ts   # 数据导出 API
    └── upload/route.ts               # 文件上传处理 (EXIF提取, 缩略图生成)
```

## 3. 组件树

```
components/
├── ui/                              # shadcn/ui (Button, Card, Dialog, Input, etc.)
│
├── layout/
│   ├── Sidebar.tsx                  # 侧边导航 (desktop)
│   ├── MobileNav.tsx                # 底部导航 (mobile)
│   ├── Header.tsx                   # 顶部栏
│   └── UserMenu.tsx                 # 用户头像 + 下拉菜单
│
├── profile/
│   ├── ProfileCard.tsx              # 逝者档案卡片 (dashboard 列表用)
│   ├── ProfileForm.tsx              # 创建/编辑档案表单
│   └── ProfileHeader.tsx            # 时间线页面顶部的逝者信息区
│
├── timeline/
│   ├── Timeline.tsx                 # 时间线容器 (虚拟滚动)
│   ├── TimelineYear.tsx             # 年份分隔标记
│   ├── TimelineItem.tsx             # 单条记忆卡片
│   ├── TimelineFilters.tsx          # 筛选栏 (类型/标签/日期)
│   └── TimelineEmpty.tsx            # 空状态引导
│
├── memory/
│   ├── MemoryCard.tsx               # 记忆素材预览卡片
│   ├── MemoryDetail.tsx             # 素材详情展示
│   ├── PhotoViewer.tsx              # 照片查看器 (pinch zoom)
│   ├── VideoPlayer.tsx              # 视频播放器
│   ├── AudioPlayer.tsx              # 音频播放器 (带波形)
│   ├── TextViewer.tsx               # 文字/聊天记录展示
│   ├── AnnotationEditor.tsx         # 注释编辑器
│   └── SourceBadge.tsx              # "原始记录" 标记徽章
│
├── upload/
│   ├── UploadZone.tsx               # 拖拽上传区域
│   ├── UploadProgress.tsx           # 上传进度
│   ├── BatchUploadList.tsx          # 批量上传文件列表
│   ├── DatePicker.tsx               # 日期选择 (手动指定拍摄日期)
│   └── WechatImporter.tsx           # 微信记录导入向导
│
├── family/
│   ├── InviteDialog.tsx             # 邀请对话框
│   ├── MemberList.tsx               # 成员列表
│   └── RoleBadge.tsx                # 权限标记
│
├── reminders/
│   ├── ReminderForm.tsx             # 创建/编辑提醒
│   ├── ReminderList.tsx             # 提醒列表
│   └── ReminderBanner.tsx           # 首页/时间线顶部的提醒横幅
│
└── common/
    ├── EmptyState.tsx               # 通用空状态
    ├── LoadingSpinner.tsx           # 加载指示
    ├── ConfirmDialog.tsx            # 确认弹窗
    └── FileTypeIcon.tsx             # 文件类型图标
```

## 4. 关键技术方案

### 4.1 文件上传流程

```
用户拖拽文件 → 前端校验(类型+大小) → 读取 EXIF (client-side, exifr库)
→ 生成缩略图 (client-side, canvas API, 照片/视频首帧)
→ 上传原文件到 Supabase Storage
→ 上传缩略图到 Supabase Storage
→ 写入 memories 表 (file_path, thumbnail_path, exif_data, memory_date)
→ 前端时间线刷新
```

**文件大小限制:**

* 照片: 50MB
* 视频: 500MB
* 音频: 100MB
* 文档: 50MB
* 单次批量上传: 最多 100 个文件

### 4.2 微信聊天记录解析

微信"导出聊天记录"生成的格式:

```
{display_name}(wxid_xxx):
[2024-01-15 14:30:22] 文字消息内容
[2024-01-15 14:31:05] [图片] (对应文件夹中的图片文件)
[2024-01-15 14:32:10] [语音] (对应文件夹中的音频文件)
```

解析器功能:

1. 接受用户上传的 txt 文件 + 媒体文件夹(ZIP)
2. 逐行解析，提取: 日期时间、发送者、内容类型、内容
3. 只保留逝者发送的消息 (用户指定逝者的微信名)
4. 将文字消息创建为 type='text' 的 memory
5. 将媒体文件匹配并创建对应类型的 memory
6. 所有消息自动标注日期

### 4.3 时间线虚拟滚动

当素材超过 100 条时，启用虚拟滚动以保证性能:

* 使用 @tanstack/react-virtual
* 只渲染视口内 ± 5 个 items
* 缩略图懒加载 (Intersection Observer)
* 年份分隔线作为 sticky header

### 4.4 数据导出

Server-side 流式生成 ZIP:

1. 查询该 profile 的所有 memories
2. 从 Storage 逐个读取文件
3. 生成 metadata.json (所有 memories 的元数据 + 注释)
4. 打包为 ZIP 流式返回
5. 前端显示下载进度

### 4.5 响应式设计断点

| 断点                  | 布局                    |
| ------------------- | --------------------- |
| \< 640px (mobile)   | 底部导航, 单列时间线, 全屏媒体查看   |
| 640-1024px (tablet) | 侧边导航收起, 双列时间线         |
| > 1024px (desktop)  | 侧边导航展开, 三列时间线, 侧边详情面板 |

## 5. UI 设计规范

### 5.1 色彩

* 主色: warm-stone 系 (Tailwind stone-xxx)
* 强调色: amber-600 (温暖但不刺眼)
* 背景: stone-50 (off-white, 不是纯白)
* 文字: stone-800 (主) / stone-500 (次)
* 错误: red-500
* 成功: emerald-500

### 5.2 字体

* 中文: system-ui (跟随系统, 苹方/思源)
* 英文: Inter (通过 next/font)
* 逝者姓名/标题: font-medium, text-lg+
* 注释/描述: font-normal, text-sm, stone-600

### 5.3 情感设计原则

* 圆角统一用 rounded-xl (柔和)
* 阴影轻柔: shadow-sm, 不用 shadow-lg
* 动画克制: 只在必要处用 150ms ease 过渡, 不用弹跳/跳动
* 照片展示: 保留原始比例, 不强制裁剪
* 空状态文案温暖而非催促: "这里还没有记忆，你可以随时添加" 而不是 "快来上传吧！"

````

---

## 文档四：TASKS.md

```markdown
# TASKS.md — ego-memory-anchor MVP 开发任务

格式说明:
- ID: S{sprint}.T{task}
- 依赖: 必须先完成的任务 ID
- 文件: 主要涉及的文件路径
- 验证: 如何确认完成

---

## Sprint 1: 项目基础 + 认证

### S1.T1 — 项目脚手架初始化
- 依赖: 无
- 文件: 项目根目录
- 操作:
  1. `pnpm create next-app@latest ego-memory-anchor --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"`
  2. 安装依赖: `pnpm add @supabase/supabase-js @supabase/ssr`
  3. 安装开发依赖: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom`
  4. 配置 vitest.config.ts
  5. 配置 path aliases 确认生效
  6. 创建 .env.local.example (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  7. 创建 .gitignore 确保 .env.local 被忽略
- 验证: `pnpm dev` 启动无报错, `pnpm test` 可运行

### S1.T2 — shadcn/ui 初始化 + 基础组件
- 依赖: S1.T1
- 文件: components/ui/
- 操作:
  1. `pnpm dlx shadcn@latest init` (选 stone 色系, zinc neutral)
  2. 安装基础组件: button, card, input, label, dialog, dropdown-menu, avatar, badge, toast, separator, skeleton
  3. 确认 Tailwind 配置中 stone 色系可用
- 验证: 创建一个测试页面，渲染 Button + Card，视觉正确

### S1.T3 — Supabase 客户端配置
- 依赖: S1.T1
- 文件: lib/supabase/server.ts, lib/supabase/client.ts, lib/supabase/middleware.ts, middleware.ts
- 操作:
  1. 创建 lib/supabase/server.ts — createServerClient (for Server Components + Route Handlers)
  2. 创建 lib/supabase/client.ts — createBrowserClient (for Client Components)
  3. 创建 middleware.ts — 刷新 session token, 保护 (main) 路由
  4. 确保未登录用户访问 /dashboard 被重定向到 /login
- 验证: 单元测试 middleware 逻辑; 手动测试重定向

### S1.T4 — 数据库 Schema Migration
- 依赖: S1.T3
- 文件: supabase/migrations/001_initial_schema.sql
- 操作:
  1. 编写完整的 CREATE TABLE 语句 (profiles, memories, family_members, reminders)
  2. 编写所有 RLS 策略 (参照 DESIGN.md 1.3 节)
  3. 创建 Storage buckets (avatars, memories) 及其 policies
  4. 创建 updated_at 自动更新 trigger
- 验证: `supabase db push` 成功; 在 Supabase Dashboard 确认表和策略存在

### S1.T5 — TypeScript 类型定义
- 依赖: S1.T4
- 文件: lib/types/database.ts, lib/types/index.ts
- 操作:
  1. 运行 `supabase gen types typescript` 生成 database.types.ts
  2. 创建 lib/types/index.ts 导出业务类型 (Profile, Memory, FamilyMember, Reminder)
  3. 包含 enum: MemoryType, FamilyRole, DatePrecision, Recurrence, Species
- 验证: TypeScript 编译通过, 无 any 类型

### S1.T6 — 注册页面
- 依赖: S1.T3, S1.T2
- 文件: app/(auth)/layout.tsx, app/(auth)/register/page.tsx
- 操作:
  1. Auth layout: 居中卡片布局, 品牌 logo, 温暖色调背景
  2. 注册表单: 邮箱 + 密码 + 确认密码
  3. Server Action 调用 supabase.auth.signUp
  4. 注册成功后显示"请查看邮箱验证"提示
  5. 表单校验 (邮箱格式, 密码长度 ≥ 8)
- 验证: 组件渲染测试; 手动测试注册流程

### S1.T7 — 登录页面
- 依赖: S1.T6
- 文件: app/(auth)/login/page.tsx, app/(auth)/callback/route.ts
- 操作:
  1. 登录表单: 邮箱 + 密码
  2. Server Action 调用 supabase.auth.signInWithPassword
  3. 登录成功 redirect to /dashboard
  4. OAuth callback route handler (为将来 OAuth 预留)
  5. "没有账号？去注册" 链接
- 验证: 组件渲染测试; 手动测试登录 → 跳转 dashboard

### S1.T8 — 主布局框架
- 依赖: S1.T7, S1.T2
- 文件: app/(main)/layout.tsx, components/layout/Sidebar.tsx, components/layout/MobileNav.tsx, components/layout/Header.tsx, components/layout/UserMenu.tsx
- 操作:
  1. (main) layout: 读取 session, 未登录 redirect
  2. Desktop: 左侧 Sidebar (logo + 导航: 首页/设置) + 右侧内容区
  3. Mobile: 顶部 Header + 底部 MobileNav
  4. UserMenu: 头像 + dropdown (设置, 退出登录)
  5. 退出登录 Server Action
- 验证: 响应式布局在 375px 和 1280px 下均正确; 退出登录可用

---

## Sprint 2: 逝者档案 CRUD

### S2.T1 — ProfileForm 组件
- 依赖: S1.T5, S1.T2
- 文件: components/profile/ProfileForm.tsx
- 操作:
  1. 表单字段: 姓名(必填), 头像上传, 关系(下拉选择), 物种(人/宠物), 生日, 去世日期, 一句话描述
  2. 关系选项: 父亲/母亲/爷爷/奶奶/外公/外婆/配偶/子女/兄弟姐妹/朋友/同事/宠物-猫/宠物-狗/宠物-其他/其他
  3. 选择"宠物"类关系时 species 自动设为 'pet'
  4. 头像上传: 预览 + 裁剪(可选) + 上传到 avatars bucket
  5. 日期选择器: 支持"不确定"选项
- 验证: 组件渲染测试; 表单校验测试 (姓名为空, 日期矛盾)

### S2.T2 — 创建档案页面
- 依赖: S2.T1
- 文件: app/(main)/profile/new/page.tsx
- 操作:
  1. 页面标题: "为 TA 建一个记忆空间"
  2. 嵌入 ProfileForm
  3. Server Action: 校验 → 上传头像 → INSERT profiles → redirect to /profile/[id]
  4. 创建成功 toast: "记忆空间已创建"
- 验证: 创建一个档案，数据库有记录，跳转正确

### S2.T3 — Dashboard 页面 (档案列表)
- 依赖: S2.T2
- 文件: app/(main)/dashboard/page.tsx, components/profile/ProfileCard.tsx
- 操作:
  1. Server Component 查询当前用户的所有 profiles + 被邀请参与的 profiles
  2. ProfileCard: 头像 + 姓名 + 关系 + 描述 + 去世日期 + 素材计数
  3. 卡片点击 → /profile/[id]
  4. "创建新的记忆空间" 按钮 → /profile/new
  5. 空状态: "还没有记忆空间，为 TA 创建一个吧"
  6. 如果有即将到来的纪念日，顶部显示温馨提示
- 验证: 空状态渲染正确; 有数据时列表渲染正确

### S2.T4 — 编辑档案页面
- 依赖: S2.T1
- 文件: app/(main)/profile/[profileId]/edit/page.tsx
- 操作:
  1. Server Component 加载现有档案数据
  2. 权限检查: 只有 owner 可编辑
  3. ProfileForm 预填数据, 提交更新
  4. 增加"删除此记忆空间"危险操作 (需二次确认, 附带提示: "所有记忆将被永久删除")
- 验证: 编辑后数据更新正确; 删除后跳转 dashboard

---

## Sprint 3: 记忆上传

### S3.T1 — UploadZone 组件
- 依赖: S1.T2
- 文件: components/upload/UploadZone.tsx
- 操作:
  1. 拖拽区域 + 点击选择文件
  2. 支持多文件 + 文件夹
  3. 文件类型校验 (DESIGN.md 4.1 中定义的格式)
  4. 文件大小校验 (超限提示)
  5. 拖拽时视觉反馈 (边框变色)
- 验证: 拖拽测试; 非法类型被拒; 超大文件被拒

### S3.T2 — EXIF 提取工具
- 依赖: S1.T1
- 文件: lib/utils/exif.ts
- 操作:
  1. `pnpm add exifr`
  2. extractExifDate(file: File): Promise<Date | null> — 从 EXIF 读取拍摄日期
  3. extractExifData(file: File): Promise<Record<string, any>> — 提取完整 EXIF
  4. 支持 JPEG, PNG, HEIC
  5. 静默处理无 EXIF 的文件 (返回 null)
- 验证: 单元测试: 有 EXIF 的照片 → 提取日期; 无 EXIF 的文件 → null

### S3.T3 — 缩略图生成工具
- 依赖: S1.T1
- 文件: lib/utils/thumbnail.ts
- 操作:
  1. generateThumbnail(file: File, maxSize: 400): Promise<Blob>
  2. 照片: canvas resize
  3. 视频: 提取第一帧 (video element + canvas)
  4. 音频/文档: 返回 null (使用默认图标)
  5. 输出 JPEG, quality 0.8
- 验证: 单元测试: 照片 → 缩略图 Blob; 视频 → 首帧 Blob

### S3.T4 — 上传进度组件
- 依赖: S3.T1
- 文件: components/upload/UploadProgress.tsx, components/upload/BatchUploadList.tsx
- 操作:
  1. UploadProgress: 单个文件的进度条 (文件名 + 百分比 + 状态)
  2. BatchUploadList: 多文件上传的列表视图
  3. 状态: waiting → uploading → processing → done / error
  4. 错误文件可重试
  5. 全部完成后显示 "X 条记忆已保存" + "前往时间线查看" 链接
- 验证: 组件渲染测试 (各状态)

### S3.T5 — 上传页面 + 上传逻辑
- 依赖: S3.T1, S3.T2, S3.T3, S3.T4, S1.T4
- 文件: app/(main)/profile/[profileId]/upload/page.tsx, lib/utils/upload.ts
- 操作:
  1. 页面: ProfileHeader(只读) + UploadZone + BatchUploadList
  2. 上传流程 (per file):
     a. 读取 EXIF → 提取日期
     b. 生成缩略图
     c. 上传原文件到 Storage: memories/{userId}/{profileId}/{memoryId}/{filename}
     d. 上传缩略图到 Storage
     e. INSERT memories 表
  3. 并发上传: 最多 3 个文件同时上传
  4. 上传完成后可继续上传更多, 或跳转时间线
- 验证: 上传 1 张照片 → Storage 有文件 + DB 有记录; 批量上传 5 个混合文件 → 全部成功

### S3.T6 — 手动日期指定
- 依赖: S3.T5
- 文件: components/upload/DatePicker.tsx (扩展 S3.T5 的上传流程)
- 操作:
  1. 无 EXIF 日期的文件, 上传后弹出日期选择
  2. 支持精度选择: 精确到日 / 只知道月 / 只知道年 / 不确定
  3. "不确定"则 memory_date 留空, memory_date_precision = 'unknown'
  4. 批量模式: 可对多个无日期文件统一指定日期
- 验证: 无 EXIF 文件上传后提示填写日期; "不确定" 写入正确

---

## Sprint 4: 时间线视图 (核心功能)

### S4.T1 — 时间线数据加载
- 依赖: S1.T5, S1.T3
- 文件: lib/utils/timeline.ts
- 操作:
  1. fetchTimelineData(profileId, filters?): 查询 memories, 按 memory_date DESC 排序
  2. 分组逻辑: 按年 → 按月 → 按日
  3. 无日期的素材归入 "日期未知" 组, 放在最后
  4. 支持筛选参数: type, tags, dateRange
  5. 分页: 首次加载 50 条, 滚动加载更多
- 验证: 单元测试: 10 条 memories → 正确分组; 筛选生效

### S4.T2 — TimelineItem 组件
- 依赖: S1.T2
- 文件: components/timeline/TimelineItem.tsx
- 操作:
  1. 根据 memory.type 渲染不同预览:
     - photo: 缩略图
     - video: 缩略图 + 播放图标
     - audio: 波形图标 + 时长
     - text: 文字摘要 (前 100 字)
     - document: 文件图标 + 文件名
  2. 显示: 日期 + 类型图标 + SourceBadge("原始记录")
  3. 有注释时显示注释摘要
  4. 点击 → /profile/[profileId]/memory/[memoryId]
  5. 贡献者头像 (如果是家人上传的)
- 验证: 5 种类型各渲染一个, 视觉正确

### S4.T3 — Timeline 容器 + 虚拟滚动
- 依赖: S4.T1, S4.T2
- 文件: components/timeline/Timeline.tsx, components/timeline/TimelineYear.tsx
- 操作:
  1. `pnpm add @tanstack/react-virtual`
  2. TimelineYear: 年份分隔线 (sticky header)
  3. Timeline: 虚拟列表, 渲染 TimelineYear + TimelineItem
  4. 滚动到底自动加载更多
  5. 滚动到顶部显示年份快速跳转
  6. Desktop: 瀑布流 3 列; Mobile: 单列
- 验证: 100 条 mock 数据, 滚动流畅; 年份 sticky 正确

### S4.T4 — TimelineFilters 组件
- 依赖: S4.T3
- 文件: components/timeline/TimelineFilters.tsx
- 操作:
  1. 类型筛选: 全部 / 照片 / 视频 / 语音 / 文字 / 文档 (图标+文字 toggle)
  2. 标签筛选: 显示该 profile 所有已用标签, 多选
  3. 日期范围: 快捷选项 (全部 / 今年 / 去年 / 更早) + 自定义范围
  4. 筛选变化 → URL search params 更新 → 数据重新加载
  5. 当前筛选显示为 chips, 可单独移除
- 验证: 选择"语音" → 只显示语音; 选择标签 → 匹配显示

### S4.T5 — 时间线页面整合
- 依赖: S4.T3, S4.T4, S2.T3
- 文件: app/(main)/profile/[profileId]/page.tsx, components/profile/ProfileHeader.tsx
- 操作:
  1. ProfileHeader: 逝者头像 + 姓名 + 关系 + 生卒日期 + 描述 + 素材总数
  2. 操作按钮: 上传记忆 / 邀请家人 / 编辑档案
  3. TimelineFilters + Timeline
  4. 空状态: TimelineEmpty — "还没有记忆，上传第一条吧" + 上传按钮
  5. 纪念日横幅: 如果今天或近 7 天内有纪念日, 顶部温馨提示
- 验证: 完整页面渲染; 空状态 → 有数据状态的切换

---

## Sprint 5: 素材详情 + 注释

### S5.T1 — PhotoViewer 组件
- 依赖: S1.T2
- 文件: components/memory/PhotoViewer.tsx
- 操作:
  1. 全屏照片查看
  2. 手势: 双指缩放 (mobile), 滚轮缩放 (desktop)
  3. 加载 Skeleton + 渐进式显示
  4. EXIF 信息展示 (可展开: 拍摄时间, 设备, 位置如有)
- 验证: 照片正确显示; 缩放流畅

### S5.T2 — AudioPlayer 组件
- 依赖: S1.T2
- 文件: components/memory/AudioPlayer.tsx
- 操作:
  1. 自定义音频播放器 (不用浏览器默认)
  2. 播放/暂停/进度条/时长显示
  3. 波形可视化 (Web Audio API + canvas, 简单矩形波形即可)
  4. 风格: 温暖色调, 与整体设计统一
- 验证: 音频播放正常; 波形渲染; 进度拖拽

### S5.T3 — VideoPlayer 组件
- 依赖: S1.T2
- 文件: components/memory/VideoPlayer.tsx
- 操作:
  1. HTML5 video + 自定义控件
  2. 播放/暂停/进度/音量/全屏
  3. 加载时显示缩略图
- 验证: 视频播放正常; 全屏可用

### S5.T4 — TextViewer 组件
- 依赖: S1.T2
- 文件: components/memory/TextViewer.tsx
- 操作:
  1. 聊天记录格式: 消息气泡样式 (逝者的消息在左, 用户的在右)
  2. 普通文字: 段落展示
  3. 日期/时间标记
  4. 长文本折叠 + "展开全部"
- 验证: 聊天格式渲染正确; 长文本折叠生效

### S5.T5 — AnnotationEditor + SourceBadge
- 依赖: S1.T2
- 文件: components/memory/AnnotationEditor.tsx, components/memory/SourceBadge.tsx
- 操作:
  1. AnnotationEditor: textarea + 保存按钮, 自动保存 (debounce 1s)
  2. placeholder: "记录这段记忆的故事…"
  3. SourceBadge: 始终显示 "原始记录" 标记, 样式不可点击/不可修改, 传递信任感
  4. 只有 owner 和 editor 可编辑注释
- 验证: 注释保存到 DB; SourceBadge 渲染; 权限控制

### S5.T6 — 素材详情页面
- 依赖: S5.T1, S5.T2, S5.T3, S5.T4, S5.T5
- 文件: app/(main)/profile/[profileId]/memory/[memoryId]/page.tsx, components/memory/MemoryDetail.tsx
- 操作:
  1. Server Component 加载 memory 数据
  2. 根据 type 渲染对应 viewer
  3. 下方: AnnotationEditor + SourceBadge
  4. 侧边/下方元信息: 日期, 类型, 文件大小, 上传者, 上传时间
  5. 标签编辑: 添加/删除标签
  6. 操作: 下载原文件 / 删除此记忆 (需确认)
  7. 上一条/下一条导航
- 验证: 5 种类型素材各打开详情, 均正确

---

## Sprint 6: 家庭协作

### S6.T1 — InviteDialog 组件
- 依赖: S1.T2, S1.T4
- 文件: components/family/InviteDialog.tsx
- 操作:
  1. Dialog: 输入邀请人邮箱 (可选) + 选择角色 (查看者/编辑者)
  2. 生成唯一 invite_token
  3. 显示邀请链接 (复制按钮)
  4. 不强制邮箱 — 可直接复制链接发给家人 (微信分享友好)
  5. INSERT family_members (user_id=null, invite_token=xxx)
- 验证: 生成链接; 数据库记录正确

### S6.T2 — 接受邀请页面
- 依赖: S6.T1
- 文件: app/(main)/invite/[token]/page.tsx
- 操作:
  1. 读取 token → 查询 family_members
  2. 如果未登录 → 显示逝者信息 + "注册/登录后加入" (保留 token 在 URL)
  3. 如果已登录 → 显示逝者信息 + 邀请者姓名 + "加入此记忆空间" 按钮
  4. 点击加入: UPDATE family_members SET user_id, accepted_at
  5. 加入后 redirect to /profile/[profileId]
- 验证: 新用户通过链接注册后自动加入; 已有用户点击即加入

### S6.T3 — MemberList 组件 + 家庭管理页面
- 依赖: S6.T1, S6.T2
- 文件: components/family/MemberList.tsx, components/family/RoleBadge.tsx, app/(main)/profile/[profileId]/family/page.tsx
- 操作:
  1. MemberList: 显示所有成员 (头像/名字/角色/加入时间)
  2. 未接受的邀请: 显示 "待接受" 状态 + 可复制链接 + 可撤销
  3. 角色修改: owner 可改其他人角色
  4. 移除成员: owner 可移除 (需确认)
  5. 页面: ProfileHeader + InviteDialog 入口 + MemberList
- 验证: 邀请+接受+修改角色+移除, 全流程测试

---

## Sprint 7: 纪念日提醒 + 微信导入

### S7.T1 — ReminderForm + ReminderList
- 依赖: S1.T2, S1.T4
- 文件: components/reminders/ReminderForm.tsx, components/reminders/ReminderList.tsx, app/(main)/profile/[profileId]/reminders/page.tsx
- 操作:
  1. ReminderForm: 标题 + 日期 + 循环(一次/每年/农历每年) + 开关
  2. 预设建议: 逝者生日 (如已填) → "TA 的生日"; 逝者忌日 → "TA 的忌日"; 清明节
  3. ReminderList: 列表展示, 可编辑/删除/开关
  4. 页面整合
- 验证: 创建提醒 → DB 记录; 编辑/删除/开关

### S7.T2 — ReminderBanner
- 依赖: S7.T1
- 文件: components/reminders/ReminderBanner.tsx
- 操作:
  1. 在 dashboard 和 timeline 页面顶部检查: 今天或未来 7 天内是否有该用户的提醒
  2. 如有: 温暖的横幅 "后天是爷爷的生日"
  3. 横幅可关闭 (本次 session 内不再显示)
  4. 风格: amber-50 背景, amber-800 文字, 左侧蜡烛/心形图标
- 验证: mock 提醒日期为明天, 横幅出现; 关闭后不再显示

### S7.T3 — 微信聊天记录解析器
- 依赖: S1.T1
- 文件: lib/utils/wechat-parser.ts
- 操作:
  1. parseWechatExport(txtContent: string, targetName: string): ParsedMessage[]
  2. ParsedMessage: { date, sender, type ('text'|'image'|'audio'|'video'), content, mediaFilename? }
  3. 解析逻辑:
     - 按行读取 txt
     - 正则匹配日期时间行: `\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]`
     - 识别 [图片] [语音] [视频] 标记
     - 普通行视为文字消息
  4. 只保留 sender === targetName 的消息
  5. 错误处理: 格式异常行跳过 + 计数
- 验证: 单元测试: mock 微信导出 txt → 正确解析; 异常行跳过

### S7.T4 — WechatImporter 组件 + 向导
- 依赖: S7.T3, S3.T5
- 文件: components/upload/WechatImporter.tsx
- 操作:
  1. 步骤 1: 用户上传 txt 文件
  2. 步骤 2: 系统列出对话中的参与者 → 用户选择"哪个是逝者"
  3. 步骤 3: 预览解析结果 (X 条文字, Y 张图片, Z 条语音)
  4. 步骤 4: 用户上传对应的媒体文件夹 (ZIP)
  5. 步骤 5: 系统匹配媒体文件 + 批量创建 memories
  6. 每条消息自动设置 memory_date, source_label = "微信聊天记录"
- 验证: 完整流程测试: 上传 txt + ZIP → memories 创建正确

---

## Sprint 8: 设置 + 导出 + 收尾

### S8.T1 — 设置页面
- 依赖: S1.T8
- 文件: app/(main)/settings/page.tsx
- 操作:
  1. 修改密码
  2. 数据导出入口 (选择要导出的 profile)
  3. 删除账号 (极度危险: 需输入 "永久删除" 确认, 删除所有数据)
  4. 关于/帮助链接
- 验证: 修改密码成功; 删除账号后所有数据清除

### S8.T2 — 数据导出 API
- 依赖: S3.T5
- 文件: app/api/export/[profileId]/route.ts
- 操作:
  1. 权限检查: 只有 owner 可导出
  2. 查询 profile 所有 memories
  3. 生成 metadata.json: profile 信息 + memories 元数据 + annotations
  4. 从 Storage 读取所有文件
  5. 打包 ZIP 返回 (使用 archiver 或 JSZip)
  6. 前端显示下载进度 (文件可能很大)
- 验证: 导出 ZIP → 解压后文件完整 + metadata.json 正确

### S8.T3 — 首页 (Landing Page)
- 依赖: S1.T2
- 文件: app/page.tsx
- 操作:
  1. 未登录: Landing page
     - Hero: "永不丢失关于 TA 的真实记忆" + 简短描述
     - 三个价值点: 汇集 / 时间线 / 家人共建
     - CTA: "开始守护记忆" → /register
  2. 已登录: redirect to /dashboard
  3. 设计: 安静、温暖, 不使用"AI""数字永生"等词汇
  4. 一张示意图或温暖的插画 (先用占位符)
- 验证: 未登录看到 landing; 已登录跳转 dashboard

### S8.T4 — 全局 Loading + Error 状态
- 依赖: S1.T2
- 文件: app/(main)/loading.tsx, app/(main)/error.tsx, app/(main)/profile/[profileId]/loading.tsx, components/common/*.tsx
- 操作:
  1. loading.tsx: Skeleton 占位符 (不是简单 spinner)
  2. error.tsx: 温和的错误提示 + 重试按钮
  3. 通用组件: EmptyState, LoadingSpinner, ConfirmDialog
  4. 每个页面的 loading/error 文件
- 验证: 慢网络模拟 → loading 状态正确; 模拟 API 错误 → error 展示

### S8.T5 — 响应式打磨 + 可访问性
- 依赖: 所有前序任务
- 文件: 全局
- 操作:
  1. 在 375px / 768px / 1280px 三个断点逐页检查
  2. 修复溢出/对齐/字体大小问题
  3. 所有交互元素可 keyboard 操作
  4. img 标签有 alt 属性
  5. 对比度满足 WCAG AA
  6. 语义化 HTML (nav, main, section, article)
- 验证: 三个断点逐页截图检查; lighthouse accessibility > 90

### S8.T6 — 部署配置
- 依赖: 所有前序任务
- 文件: vercel.json, next.config.ts, .env.production (配置项)
- 操作:
  1. Vercel 项目创建 + 环境变量配置
  2. Supabase production 项目配置
  3. next.config.ts: images.remotePatterns 配置 Supabase Storage domain
  4. 确保 production build 无 error
  5. 配置自定义域名 (如有)
- 验证: `pnpm build` 成功; Vercel 部署成功; 线上可访问

---

## 任务总览

| Sprint | 任务数 | 核心产出 |
|--------|--------|---------|
| Sprint 1 | 8 | 项目骨架 + 认证 + 布局 |
| Sprint 2 | 4 | 逝者档案 CRUD |
| Sprint 3 | 6 | 媒体上传全流程 |
| Sprint 4 | 5 | 时间线视图 (核心) |
| Sprint 5 | 6 | 素材详情 + 注释 |
| Sprint 6 | 3 | 家庭协作 |
| Sprint 7 | 4 | 纪念日 + 微信导入 |
| Sprint 8 | 6 | 设置 + 导出 + 首页 + 打磨 |
| **总计** | **42** | |

## 执行指令

每个 Sprint 开始时，在 Claude Code 中执行:

````

按照 TASKS.md 中 Sprint X 的任务列表顺序执行。
每个任务遵循 TDD: 先写测试 → 运行失败 → 实现代码 → 测试通过 → 重构。
完成一个任务后 commit，message 格式: feat(scope): S.T - 简短描述。
完成整个 Sprint 后，运行全部测试确认无回归。

```
```

***

## 接下来的操作步骤

**你现在要做的（Phase 0，约 60 分钟）：**

1. 创建 Git 仓库：`git init ego-memory-anchor`
2. 将以上 4 份文档存入仓库根目录
3. 创建 Supabase 项目（free tier 即可），获取 URL + anon key
4. 确保 Claude Code 环境中 Superpowers + ECC 已激活
5. 在 Claude Code 中打开项目，确认 CLAUDE.md 被自动加载

**然后启动 Phase 1（约 30 分钟）：**

```
使用 /brainstorming 模式。
上下文: 读取 PRODUCT_SPEC.md 和 DESIGN.md。
任务: 对 TASKS.md Sprint 1 的任务逐个确认理解，提出任何疑问或改进建议。
完成后直接进入 /writing-plans 细化 Sprint 1 的执行细节。
```

**Phase 2.5（你花 10 分钟确认计划）→ Phase 3 自主执行。**

4 份文档已就绪，可以开始开发。
