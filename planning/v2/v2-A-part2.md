# 剩余文档补全

以下是尚未输出的完整内容：**V2 CLAUDE.md 完整版**、**合并后的 V2 TASKS.md 完整版**、**合并后的 V2 DESIGN.md 完整版**，以及 **Claude Code 启动执行指南**。

***

# 文档 A：V2 CLAUDE.md（完整替换版）

```markdown
# CLAUDE.md — ego-memory-anchor V2 项目宪法

## 项目概述
ego-memory-anchor（忆锚）是一款面向丧亲/丧宠人群的真实记忆聚合平台。
核心理念：守护真实记录，对抗第二重丧失。绝不生成合成内容。
忆锚不是网盘——它是一个人（或一只宠物）的数字纪念空间。
MVP 形态：中文 Web 应用（PWA-ready），海外部署优先。

## 产品差异化要点（开发时必须理解）
- 每个"档案"不是文件夹，是一个人的生命空间——有生命摘要、享年、家人动态、纪念日倒计时
- 每条"记忆"不是文件——是素材+时间锚点+家人故事+不可变的"原始记录"标记
- 家庭协作是增长引擎（P0），不是附加功能
- 数据导出按钮放在设置页最显眼位置——这是信任设计
- 纪念仪式（蜡烛、横幅、"这天的记忆"）是差异化核心

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
- 绝不将 memories 表的 source_label 设为可修改
- 绝不引入数据分析、广告、第三方追踪 SDK
- 绝不跳过测试直接提交
- 绝不修改 .claudeignore 或 lint 配置来绕过检查
- 绝不在客户端 localStorage 中存储敏感个人数据（同意标记除外）

## 项目结构

```

ego-memory-anchor/
├── CLAUDE.md
├── PRODUCT\_SPEC.md
├── DESIGN.md
├── TASKS.md
├── STORAGE\_DESIGN.md
├── planning/                      # 策略文档（不编辑）
│   ├── differentiation.md         # 差异化设计
│   ├── marketing-coldstart.md     # 营销冷启动方案
│   ├── compliance-china.md        # 中国大陆合规报告
│   ├── compliance-global.md       # 全球合规报告
│   └── research/                  # 原始研究文档
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
│   │   │   └── \[profileId]/
│   │   │       ├── page.tsx              # 生命摘要 + 时间线
│   │   │       ├── edit/page.tsx
│   │   │       ├── upload/page.tsx
│   │   │       ├── memory/\[memoryId]/page.tsx
│   │   │       ├── family/page.tsx
│   │   │       └── reminders/page.tsx
│   │   ├── settings/page.tsx
│   │   └── invite/\[token]/page.tsx
│   ├── privacy/page.tsx
│   ├── terms/page.tsx
│   ├── api/
│   │   ├── export/\[profileId]/route.ts
│   │   └── upload/route.ts
│   ├── page.tsx                   # Landing page
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                        # shadcn/ui
│   ├── layout/                    # Sidebar, Header, MobileNav, UserMenu
│   ├── profile/                   # ProfileCard, ProfileForm, ProfileHeader, ProfileSummary, MemoryStats, ReminderCountdown, FamilyActivity
│   ├── timeline/                  # Timeline, TimelineYear, TimelineItem, TimelineFilters, TimelineEmpty, TodayMemory
│   ├── memory/                    # MemoryCard, MemoryDetail, PhotoViewer, VideoPlayer, AudioPlayer, TextViewer, AnnotationEditor, SourceBadge
│   ├── upload/                    # UploadZone, UploadProgress, BatchUploadList, DatePicker, WechatImporter, PrivacyConsentDialog
│   ├── family/                    # InviteDialog, MemberList, RoleBadge
│   ├── reminders/                 # ReminderForm, ReminderList, CeremonyBanner
│   ├── landing/                   # HeroSection, ValueProps, TrustSection, FounderStory
│   └── common/                    # EmptyState, LoadingSpinner, ConfirmDialog, FileTypeIcon
├── lib/
│   ├── supabase/
│   │   ├── server.ts
│   │   ├── client.ts
│   │   └── middleware.ts
│   ├── actions/
│   │   ├── profile.ts
│   │   ├── memory.ts
│   │   ├── family.ts
│   │   ├── reminder.ts
│   │   └── annotation.ts
│   ├── utils/
│   │   ├── date.ts                # 农历转换、享年计算、周年计算
│   │   ├── exif.ts                # EXIF 日期提取
│   │   ├── file.ts                # 文件类型检测、大小验证
│   │   ├── thumbnail.ts           # 缩略图生成
│   │   ├── wechat-parser.ts       # 微信聊天记录解析
│   │   ├── storage.ts             # Storage URL 构造
│   │   ├── stats.ts               # 档案统计
│   │   └── upload.ts              # 上传流程
│   └── types/
│       ├── database.ts            # Supabase 自动生成
│       └── index.ts               # 业务类型
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── tests/
│   ├── fixtures/
│   │   ├── sample-photo.jpg
│   │   ├── sample-video.mp4
│   │   ├── sample-audio.m4a
│   │   └── wechat-export-sample.txt
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

````

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
````

禁止使用纯黑 #000000 和纯白 #ffffff。

### 字体

* 中文: system-ui (苹方 / 思源黑体)
* 英文/数字: Inter (通过 next/font)
* 标题: text-2xl font-semibold tracking-tight
* 正文: text-base leading-relaxed
* 辅助文字: text-sm text-muted-foreground

### 间距节奏

| 场景     | 间距                                             |
| ------ | ---------------------------------------------- |
| 页面内边距  | px-4 sm:px-6 lg:px-8                           |
| 卡片内边距  | p-6                                            |
| 卡片间距   | gap-4 sm:gap-6                                 |
| 区块间距   | space-y-8                                      |
| 表单字段间距 | space-y-4                                      |
| 页面最大宽度 | max-w-4xl mx-auto (时间线), max-w-lg mx-auto (表单) |

### 圆角

* 卡片: rounded-xl
* 按钮: rounded-lg
* 输入框: rounded-md
* 头像: rounded-full

### 阴影

* 卡片默认: shadow-sm
* 卡片悬停: hover:shadow-md transition-shadow
* 弹窗: shadow-xl
* 禁止: shadow-2xl 及更大

### 动效

* 所有过渡: transition-all duration-200 ease-in-out
* 列表项加载: stagger fade-in (每项延迟 50ms)
* Toast: 从右上角滑入, 3秒自动消失
* 蜡烛点亮: opacity 0→1 + 微弱摇曳 (CSS keyframe, 无限循环)
* 禁止: bounce, shake, spin, scale-bounce

### 照片展示

* 社交媒体 Feed 流标准
* 单图必须保留原始比例，自适应宽高，设置 maxHeight 防过长
* 严禁使用 aspect-\[4/3] 粗暴裁剪人脸

### 空状态设计

```
[图标 64px — 温暖的线描图标]
[标题 text-lg font-medium]
[描述 text-sm text-muted-foreground]
[CTA 按钮 (如有)]
```

文案原则: 温暖邀请，不催促。"这里还没有记忆，你可以随时添加"

### SourceBadge 设计规范

* 外观: amber-50 背景 + amber-800 文字 + 📌 图标 + rounded-full
* 时间线卡片: 仅显示 "📌 原始记录"
* 详情页: 完整 "📌 原始记录 · 爸爸上传 · 2024.12.03"
* 不可点击、不可编辑，传递信任感

### 纪念仪式横幅设计

* 背景: amber-50 + 左侧蜡烛图标
* 文字: amber-900
* 布局: 左侧图标 + 中间文案("今天是爷爷的生日") + 右侧记忆缩略图
* "点亮蜡烛"按钮: ghost variant, 点击后蜡烛变暖黄 + 火焰 CSS 动画
* 可关闭: X 按钮, session 内不再显示

## Testing Pipeline

### 测试分层

| 层级   | 工具                   | 覆盖率目标                  | 何时写          |
| ---- | -------------------- | ---------------------- | ------------ |
| 单元测试 | Vitest + RTL         | 工具函数 100%, Actions 80% | 实现前 (TDD)    |
| 集成测试 | Vitest + 真实 Supabase | 核心数据流                  | 实现后立即        |
| E2E  | Playwright           | 核心用户流程 (5条)            | Sprint 末尾    |
| 视觉截图 | Playwright           | 关键页面                   | UI Sprint 末尾 |

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
# Playwright E2E（配置后）
pnpm test:e2e
```

## Debugging Rules

* NEVER guess-and-check. Always reproduce the bug first.
* Read error messages and stack traces completely before proposing fixes.
* When a fix attempt fails twice, stop and re-analyze from scratch.
* After fixing, run the full test suite, not just the affected test.

## 关键设计决策记录

* **为什么 Web 不是 App**: DPM 振荡理论；家庭协作零摩擦；迭代速度
* **为什么不做 AI 对话**: 外化纽带风险；研究证据仅 10 人样本
* **为什么不做全息**: 锚定感来自内容真实性非呈现介质
* **为什么中文优先**: 种子用户在华人社区；微信解析是差异化
* **为什么海外部署优先**: 避免数据跨境合规阻塞 MVP 开发
* **为什么家庭协作是 P0**: 它是核心增长引擎（裂变系数）
* **为什么导出是 P0**: 它是信任锚点，不是附加功能
* **为什么 SourceBadge 不可变**: 真实性承诺必须制度化

````

---

# 文档 B：V2 DESIGN.md（完整合并版）

```markdown
# DESIGN.md — ego-memory-anchor V2 技术蓝图

## 1. 数据模型

### 1.1 ER 关系图

````

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
| type | text | NOT NULL, CHECK in ('photo','video','audio','text','document') | |
| file_path | text | | Storage 路径 |
| file_name | text | | 原始文件名（用户可见） |
| thumbnail_path | text | | 缩略图 Storage 路径 |
| content | text | | 文字内容 (type='text') |
| memory_date | date | | 记忆发生日期 |
| memory_date_precision | text | DEFAULT 'day', CHECK in ('day','month','year','unknown') | |
| tags | jsonb | DEFAULT '[]'::JSONB | 用户标签 |
| annotation | text | | 注释/故事 |
| source_label | text | DEFAULT '原始记录' NOT NULL | 来源标记（不可变） |
| exif_data | jsonb | | 原始 EXIF |
| file_size | bigint | | 字节 |
| mime_type | text | | |
| sort_order | integer | | 同日期内排序 |
| created_at | timestamptz | DEFAULT now() | |
| updated_at | timestamptz | DEFAULT now() | |

#### family_members (家庭协作)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles ON DELETE CASCADE, NOT NULL | |
| user_id | uuid | FK → auth.users, NULL | 未注册为 NULL |
| invited_email | text | | |
| display_name | text | | |
| role | text | DEFAULT 'viewer', CHECK in ('admin','editor','viewer') | |
| invite_token | text | UNIQUE | |
| invited_by | uuid | FK → auth.users | |
| invited_at | timestamptz | DEFAULT now() | |
| accepted_at | timestamptz | | |

#### reminders (纪念日提醒)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | |
| profile_id | uuid | FK → profiles ON DELETE CASCADE, NOT NULL | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| title | text | NOT NULL | |
| reminder_date | date | NOT NULL | |
| recurrence | text | DEFAULT 'yearly', CHECK in ('once','yearly','lunar_yearly') | |
| enabled | boolean | DEFAULT true | |
| created_at | timestamptz | DEFAULT now() | |

#### privacy_consents (隐私同意记录 — V2新增)
| 列名 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uuid | PK | |
| user_id | uuid | FK → auth.users, NOT NULL | |
| consent_type | text | NOT NULL | 'sensitive_data_upload' |
| consented_at | timestamptz | DEFAULT now() | |
| ip_address | text | | 合规留痕 |

### 1.3 RLS 策略

```sql
-- profiles
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

-- memories
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

-- source_label 不可变 trigger
CREATE OR REPLACE FUNCTION prevent_source_label_update()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.source_label IS DISTINCT FROM OLD.source_label THEN
    RAISE EXCEPTION 'source_label is immutable and cannot be modified';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_source_label_immutable
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION prevent_source_label_update();

-- family_members
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

-- reminders
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reminders" ON reminders
  FOR ALL USING (auth.uid() = user_id);

-- privacy_consents
ALTER TABLE privacy_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own consents" ON privacy_consents
  FOR ALL USING (auth.uid() = user_id);
````

### 1.4 关键索引

```sql
CREATE INDEX idx_memories_profile_date ON memories(profile_id, memory_date DESC);
CREATE INDEX idx_memories_profile_type ON memories(profile_id, type);
CREATE INDEX idx_memories_tags ON memories USING GIN(tags);
CREATE INDEX idx_family_profile_user ON family_members(profile_id, user_id);
CREATE INDEX idx_reminders_profile ON reminders(profile_id, reminder_date);
```

### 1.5 Storage Buckets

| Bucket     | Public | 用途        | 限制    |
| ---------- | ------ | --------- | ----- |
| `memories` | ✅ true | 所有上传的媒体文件 | 500MB |
| `avatars`  | ✅ true | 逝者头像      | 5MB   |

路径规范: `{profile_id}/{memory_id}/{uuid}.{ext}`

详细 Storage 设计参见 STORAGE\_DESIGN.md。

***

## 2. 页面结构

```
app/
├── page.tsx                              # Landing page (V2: 含信任承诺+创始人故事)
├── layout.tsx
├── globals.css
├── privacy/page.tsx                      # 隐私政策 [V2新增]
├── terms/page.tsx                        # 服务条款 [V2新增]
│
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── callback/route.ts
│   └── layout.tsx
│
├── (main)/
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── profile/
│   │   ├── new/page.tsx
│   │   └── [profileId]/
│   │       ├── page.tsx                  # 生命摘要 + 时间线 (THE CORE PAGE)
│   │       ├── edit/page.tsx
│   │       ├── upload/page.tsx
│   │       ├── memory/[memoryId]/page.tsx
│   │       ├── family/page.tsx
│   │       └── reminders/page.tsx
│   ├── settings/page.tsx
│   └── invite/[token]/page.tsx
│
└── api/
    ├── export/[profileId]/route.ts
    └── upload/route.ts
```

***

## 3. 组件树

```
components/
├── ui/                              # shadcn/ui
│
├── layout/
│   ├── Sidebar.tsx
│   ├── MobileNav.tsx
│   ├── Header.tsx
│   └── UserMenu.tsx
│
├── profile/
│   ├── ProfileCard.tsx              # Dashboard 列表卡片
│   ├── ProfileForm.tsx              # 创建/编辑表单
│   ├── ProfileHeader.tsx            # 旧版简版 header (保留兼容)
│   ├── ProfileSummary.tsx           # [V2] 生命摘要容器
│   ├── MemoryStats.tsx              # [V2] 📷328 🎥21 统计面板
│   ├── ReminderCountdown.tsx        # [V2] 纪念日倒计时
│   └── FamilyActivity.tsx           # [V2] 家人动态
│
├── timeline/
│   ├── Timeline.tsx                 # 容器 (虚拟滚动)
│   ├── TimelineYear.tsx             # 年份分隔
│   ├── TimelineItem.tsx             # 单条记忆卡片
│   ├── TimelineFilters.tsx          # 筛选栏
│   ├── TimelineEmpty.tsx            # 空状态
│   └── TodayMemory.tsx              # [V2] "这一天的记忆"
│
├── memory/
│   ├── MemoryCard.tsx
│   ├── MemoryDetail.tsx
│   ├── PhotoViewer.tsx
│   ├── VideoPlayer.tsx
│   ├── AudioPlayer.tsx
│   ├── TextViewer.tsx
│   ├── AnnotationEditor.tsx
│   └── SourceBadge.tsx              # [V2强化] 不可变标记
│
├── upload/
│   ├── UploadZone.tsx
│   ├── UploadProgress.tsx
│   ├── BatchUploadList.tsx
│   ├── DatePicker.tsx
│   ├── WechatImporter.tsx
│   └── PrivacyConsentDialog.tsx     # [V2新增] 敏感信息同意
│
├── family/
│   ├── InviteDialog.tsx
│   ├── MemberList.tsx
│   └── RoleBadge.tsx
│
├── reminders/
│   ├── ReminderForm.tsx
│   ├── ReminderList.tsx
│   └── CeremonyBanner.tsx           # [V2] 纪念仪式横幅+蜡烛
│
├── landing/                          # [V2新增]
│   ├── HeroSection.tsx
│   ├── ValueProps.tsx
│   ├── TrustSection.tsx
│   └── FounderStory.tsx
│
└── common/
    ├── EmptyState.tsx
    ├── LoadingSpinner.tsx
    ├── ConfirmDialog.tsx
    └── FileTypeIcon.tsx
```

***

## 4. 关键技术方案

### 4.1 文件上传流程

```
用户拖拽 → 前端校验(类型+大小) → EXIF提取(exifr) → 缩略图生成(canvas)
→ 隐私同意检查(首次弹窗) → 上传原文件到 Storage → 上传缩略图
→ INSERT memories → 时间线刷新
```

文件大小限制: 照片 50MB, 视频 500MB, 音频 100MB, 文档 50MB, 单次最多 100 文件。

### 4.2 微信聊天记录解析

```
用户上传 txt + 媒体 ZIP → 解析 txt (逐行正则) → 用户选择逝者姓名
→ 筛选逝者消息 → 匹配媒体文件 → 预览 → 批量创建 memories
```

### 4.3 虚拟滚动

* @tanstack/react-virtual
* 视口 ± 5 items
* 年份 sticky header
* Desktop 多列 / Mobile 单列

### 4.4 数据导出 (V2)

```
export_张明远_20260415/
├── metadata.json       # 档案+记忆元数据+注释
├── photos/
├── videos/
├── audio/
├── documents/
└── README.txt          # 人类可读说明
```

### 4.5 生命摘要数据查询 (V2新增)

```sql
SELECT 
  p.*,
  COUNT(m.id) FILTER (WHERE m.type = 'photo') as photo_count,
  COUNT(m.id) FILTER (WHERE m.type = 'video') as video_count,
  COUNT(m.id) FILTER (WHERE m.type = 'audio') as audio_count,
  COUNT(m.id) FILTER (WHERE m.type = 'text') as text_count,
  COUNT(m.id) FILTER (WHERE m.type = 'document') as document_count
FROM profiles p
LEFT JOIN memories m ON m.profile_id = p.id
WHERE p.id = $1
GROUP BY p.id;
```

### 4.6 响应式断点

| 断点         | 布局                |
| ---------- | ----------------- |
| \< 640px   | 底部导航, 单列时间线, 全屏媒体 |
| 640-1024px | 侧边导航收起, 双列        |
| > 1024px   | 侧边导航展开, 三列        |

***

## 5. 情感设计原则

* 圆角统一 rounded-xl
* 阴影轻柔 shadow-sm
* 动画克制 150ms ease
* 照片保留原始比例（严禁粗暴裁剪）
* 空状态温暖邀请
* SourceBadge 传递信任
* 纪念横幅传递仪式感

````

---

# 文档 C：V2 TASKS.md（完整合并版）

```markdown
# TASKS.md — ego-memory-anchor V2 MVP 开发任务

格式: ID: S{sprint}.T{task}, 标注 [V2] 为新增任务

---

## Sprint 0: 项目骨架

### S0.T1 — 初始化 Next.js 项目
- 操作: `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"`
- 验证: `pnpm dev` 启动无报错

### S0.T2 — 安装核心依赖
- 操作: `pnpm add @supabase/supabase-js @supabase/ssr exifr jszip @tanstack/react-virtual lunar-javascript`
- 开发依赖: `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event`
- 验证: 安装成功

### S0.T3 — 配置测试环境
- 文件: vitest.config.ts, tests/setup.ts, tests/fixtures/
- 验证: `pnpm test` 跑通空测试

### S0.T4 — 数据库 Schema Migration
- 文件: supabase/migrations/001_initial_schema.sql
- 含全部表、RLS、indexes、source_label immutable trigger、privacy_consents 表
- 验证: `supabase db push` 成功

---

## Sprint 1: 认证 + 基础布局

### S1.T1 — shadcn/ui 初始化
- 操作: `pnpm dlx shadcn@latest init` + 安装 button, card, input, label, dialog, dropdown-menu, avatar, badge, toast, separator, skeleton, tabs, popover, calendar, alert-dialog, textarea, select
- 验证: Button + Card 渲染正确

### S1.T2 — Supabase 客户端配置
- 文件: lib/supabase/server.ts, client.ts, middleware.ts, middleware.ts
- 验证: 未登录重定向; 登录后可访问 dashboard

### S1.T3 — TypeScript 类型定义
- 文件: lib/types/database.ts (supabase gen types), lib/types/index.ts
- 验证: 编译通过

### S1.T4 — 注册页面
- 文件: app/(auth)/register/page.tsx, app/(auth)/layout.tsx
- 验证: 注册成功

### S1.T5 — 登录页面
- 文件: app/(auth)/login/page.tsx, app/(auth)/callback/route.ts
- 验证: 登录 → 跳转 dashboard

### S1.T6 — 主布局框架
- 文件: app/(main)/layout.tsx, components/layout/*
- Desktop: 左侧 Sidebar + 右侧内容; Mobile: 顶部 Header + 底部 Nav
- 验证: 响应式切换正确

---

## Sprint 2: 逝者档案 CRUD + 生命摘要

### S2.T1 — ProfileForm 组件
- 字段: 姓名, 头像, 关系, 物种, 生卒日期, 描述
- 验证: 表单校验

### S2.T2 — 创建档案页面
- 文件: app/(main)/profile/new/page.tsx
- 验证: 创建 → DB记录 → 跳转

### S2.T3 — Dashboard 页面
- ProfileCard 列表 + 空状态 + 创建按钮
- 验证: 空状态/有数据渲染正确

### S2.T4 — 编辑/删除档案
- 文件: app/(main)/profile/[profileId]/edit/page.tsx
- 验证: 编辑/删除成功

### S2.T5 [V2] — 享年与统计计算工具
- 文件: lib/utils/date.ts, lib/utils/stats.ts
- TDD: calculateAge, getMemoryStats, getNextReminder
- 验证: 单元测试 (闰年, 跨年, 只有出生日等)

### S2.T6 [V2] — 生命摘要组件 (ProfileSummary)
- 文件: components/profile/ProfileSummary.tsx, MemoryStats.tsx, ReminderCountdown.tsx, FamilyActivity.tsx
- 验证: 有数据/无数据均正确渲染

---

## Sprint 3: 记忆上传

### S3.T1 — UploadZone 组件
- 拖拽 + 点击 + 类型校验 + 大小校验
- 验证: 非法类型被拒

### S3.T2 — EXIF 提取工具 (TDD)
- 文件: lib/utils/exif.ts
- 验证: 有EXIF→日期; 无EXIF→null

### S3.T3 — 缩略图生成工具 (TDD)
- 文件: lib/utils/thumbnail.ts
- 验证: 照片→缩略图; 视频→首帧

### S3.T4 — 上传进度组件
- 文件: components/upload/UploadProgress.tsx, BatchUploadList.tsx
- 验证: 各状态渲染

### S3.T5 — 上传页面 + 上传逻辑
- 文件: app/(main)/profile/[profileId]/upload/page.tsx, lib/utils/upload.ts
- 并发上传最多 3 文件
- 验证: 照片+视频上传成功

### S3.T6 — DatePicker 组件
- 支持精度: 日/月/年/不确定
- 验证: 各选项正确

---

## Sprint 4: 时间线视图

### S4.T1 — 时间线数据加载
- 文件: lib/utils/timeline.ts
- 分组: 年→月→日; 分页50条
- 验证: 单元测试

### S4.T2 — TimelineItem 组件
- 5种类型渲染 + SourceBadge
- 验证: 5种类型视觉正确

### S4.T3 — Timeline 容器 + 虚拟滚动
- @tanstack/react-virtual + sticky year header
- 验证: 100条mock流畅滚动

### S4.T4 — TimelineFilters 组件
- 类型/标签/日期范围 → URL params
- 验证: 筛选生效

### S4.T5 — 时间线页面整合
- ProfileSummary [V2] + TimelineFilters + Timeline + TimelineEmpty
- 验证: 完整页面渲染

---

## Sprint 5: 素材详情 + 注释

### S5.T1 — PhotoViewer (缩放)
### S5.T2 — AudioPlayer (波形)
### S5.T3 — VideoPlayer
### S5.T4 — TextViewer (聊天气泡)

### S5.T5 — AnnotationEditor + SourceBadge
- SourceBadge 完整信息: "📌 原始记录 · 爸爸上传 · 2024.12.03"
- 验证: 注释保存; badge 渲染; 权限控制

### S5.T6 — 素材详情页面
- 5种 viewer + 注释 + 元信息 + 标签编辑 + 上/下导航
- 验证: 各类型正确

### S5.T7 [V2] — SourceBadge 不可变性强化
- 文件: supabase/migrations/xxx_source_label_immutable.sql
- 验证: UPDATE source_label → 失败

---

## Sprint 6: 家庭协作 (P0 增长引擎)

### S6.T1 — InviteDialog 组件
- 生成 invite_token + 复制链接
- 验证: 链接生成正确

### S6.T2 — 接受邀请页面
- app/(main)/invite/[token]/page.tsx
- 未登录→引导注册→自动加入; 已登录→点击加入
- 验证: 完整流程

### S6.T3 — MemberList + 家庭管理页面
- 成员列表 + 角色修改 + 移除 + 待接受状态
- 验证: 全流程

---

## Sprint 7: 纪念日 + 微信导入

### S7.T1 — ReminderForm + ReminderList
- 农历支持 (lunar-javascript)
- 验证: CRUD + 农历转换

### S7.T2 [V2] — CeremonyBanner (纪念仪式横幅)
- 触发: reminder_date ±3天
- 随机记忆展示 + "点亮蜡烛" CSS 动画
- 验证: mock日期→横幅出现→蜡烛正常

### S7.T3 [V2] — TodayMemory (这一天的记忆)
- 查询历史今天(月-日)的记忆
- 轻柔展示 / 无匹配则隐藏
- 验证: mock数据→渲染; 无数据→不显示

### S7.T4 — 微信聊天记录解析器 (TDD)
- 文件: lib/utils/wechat-parser.ts
- 验证: 8+ 单元测试

### S7.T5 — WechatImporter 组件 + 向导
- 5步导入流程
- 验证: 完整流程

---

## Sprint 8: 设置 + Landing + 收尾

### S8.T1 — 设置页面
- 修改密码 + **数据导出(最显眼位置)** + 删除账号
- 验证: 各功能正常

### S8.T2 [V2] — 数据导出 API
- metadata.json + README.txt + 按类型分文件夹 + ZIP
- 验证: 导出→解压→完整

### S8.T3 [V2] — Landing Page
- Hero + 价值主张 + **信任承诺区块** + **创始人故事** + Footer
- SEO meta + Open Graph
- 验证: Lighthouse SEO > 90

### S8.T4 — 全局 Loading + Error 状态
- loading.tsx skeleton + error.tsx 温和提示

### S8.T5 — 响应式打磨 + 可访问性
- 375/768/1280 三断点逐页检查
- Lighthouse accessibility > 90

### S8.T6 — 部署到 Vercel
- 环境变量 + production Supabase + build 验证

### S8.T7 [V2] — 隐私政策 + 服务条款页面
- app/privacy/page.tsx + app/terms/page.tsx
- 验证: 渲染正确; 链接可达

### S8.T8 [V2] — 敏感信息同意弹窗
- components/upload/PrivacyConsentDialog.tsx
- 首次上传弹出 → 同意后写入 localStorage + DB
- 验证: 首次弹/后续不弹/清缓存重弹

### S8.T9 — E2E 测试
- 5条核心流程 (CLAUDE.md 中定义)
- 视觉截图基线
- 验证: 全部通过

---

## 任务总览

| Sprint | 任务数 | 核心产出 |
|--------|--------|---------|
| 0 | 4 | 项目骨架 |
| 1 | 6 | 认证 + 布局 |
| 2 | 6 | 档案 CRUD + 生命摘要 |
| 3 | 6 | 记忆上传 |
| 4 | 5 | 时间线 (核心) |
| 5 | 7 | 素材详情 + 注释 |
| 6 | 3 | 家庭协作 (增长引擎) |
| 7 | 5 | 纪念日 + 微信导入 |
| 8 | 9 | Landing + 设置 + 合规 + 收尾 |
| **总计** | **51** | |

## 执行指令

每个 Sprint 开始时在 Claude Code 中:

````

按照 TASKS.md 中 Sprint X 的任务列表顺序执行。
每个任务遵循 TDD: 先写测试 → 运行失败 → 实现代码 → 测试通过 → 重构。
完成一个任务后 commit: feat(scope): SX.TY - 描述
完成整个 Sprint 后运行全部测试确认无回归。

```
```

***

# 文档 D：Claude Code 启动执行指南

````markdown
# Claude Code 启动执行指南 — ego-memory-anchor V2

## 前置准备（你做，30分钟）

### Step 1: 项目目录准备
```bash
mkdir ego-memory-anchor && cd ego-memory-anchor
git init
````

### Step 2: 放入文档

将以下文件放入项目根目录:

* CLAUDE.md (文档 A)
* PRODUCT\_SPEC.md (文档 5 — V2版)
* DESIGN.md (文档 B)
* TASKS.md (文档 C)
* STORAGE\_DESIGN.md (保留现有)

将策略文档放入 planning/:

* planning/differentiation.md (文档 1)
* planning/marketing-coldstart.md (文档 2)
* planning/compliance-china.md (文档 3)
* planning/compliance-global.md (文档 4)

### Step 3: 环境准备

```bash
# 确保已安装
node --version    # >= 18
pnpm --version    # >= 8
supabase --version # >= 1.100

# Supabase 本地环境
supabase init
supabase start
```

### Step 4: .env.local

```bash
cp .env.local.example .env.local
# 填入 Supabase 本地环境的 URL 和 Key
```

***

## 开始开发

### 启动 Claude Code

```bash
claude
```

### Phase 1: 激活 Superpowers + 执行 Sprint 0

```
using superpowers

读取 CLAUDE.md、PRODUCT_SPEC.md、DESIGN.md、TASKS.md。
按照 TASKS.md 中 Sprint 0 的任务顺序执行。
每个任务完成后 commit。
```

### Phase 2: 逐 Sprint 执行

每个 Sprint 启动命令:

```
按照 TASKS.md 中 Sprint {N} 的任务列表顺序执行。
使用 TDD 流程。完成一个任务后立即 commit。
Sprint 末尾运行 pnpm test --run 和 pnpm build 确认无回归。
```

### Phase 2.5: 你的人工检查点

每个 Sprint 完成后:

1. `pnpm dev` 打开浏览器看效果
2. 检查核心页面是否符合 CLAUDE.md UI Design System
3. 如有问题，写成具体 issue 反馈给下一个 Claude Code session

### 模型切换提示

* Sprint 0-1 的架构性工作: 让 Opus 主导
* Sprint 2-7 的实现工作: Sonnet subagent 执行, Opus 审查
* Sprint 8 的 E2E + Landing: Opus 主导（需要全局视角）

***

## 关键提醒

1. **不要跳过测试** — TDD 是质量保障的底线
2. **不要一次执行多个 Sprint** — 一个 Sprint 完成 + 验证后再开始下一个
3. **遇到 Supabase RLS 问题** — 参考 STORAGE\_DESIGN.md 的常见错误表
4. **UI 不对劲** — 让 Playwright 截图 → Opus 审查 → 生成修复任务
5. **source\_label 必须不可变** — 这是信任基石，trigger 必须在 migration 中创建

````

---

## 全部文档交付清单

```echarts
{
  "tooltip": { "trigger": "item" },
  "series": [{
    "type": "treemap",
    "width": "95%",
    "height": "85%",
    "breadcrumb": { "show": true },
    "label": { "fontSize": 11 },
    "levels": [
      { "itemStyle": { "borderWidth": 2, "borderColor": "#fff" } },
      { "itemStyle": { "borderWidth": 1, "borderColor": "#e5e5e5" } }
    ],
    "data": [
      {
        "name": "开发文档 (4份)",
        "itemStyle": { "color": "#6366f1" },
        "children": [
          { "name": "CLAUDE.md\n项目宪法", "value": 25 },
          { "name": "PRODUCT_SPEC.md\n产品规格", "value": 20 },
          { "name": "DESIGN.md\n技术蓝图", "value": 30 },
          { "name": "TASKS.md\n51个任务", "value": 25 }
        ]
      },
      {
        "name": "策略文档 (4份)",
        "itemStyle": { "color": "#f59e0b" },
        "children": [
          { "name": "差异化设计\n专属档案vs网盘", "value": 20 },
          { "name": "营销冷启动\n创始人故事+内容矩阵", "value": 20 },
          { "name": "中国大陆合规\nPIPL+ICP+数据跨境", "value": 15 },
          { "name": "全球合规\nGDPR+CCPA", "value": 10 }
        ]
      },
      {
        "name": "执行文档 (1份)",
        "itemStyle": { "color": "#22c55e" },
        "children": [
          { "name": "Claude Code\n启动执行指南", "value": 10 }
        ]
      }
    ]
  }]
}
````

| # | 文档                      | 类型 | 存放位置                            | 状态       |
| - | ----------------------- | -- | ------------------------------- | -------- |
| A | **V2 CLAUDE.md**        | 开发 | 项目根目录 (替换)                      | ✅        |
| B | **V2 DESIGN.md**        | 开发 | 项目根目录 (替换)                      | ✅        |
| C | **V2 TASKS.md**         | 开发 | 项目根目录 (替换)                      | ✅        |
| 5 | **V2 PRODUCT\_SPEC.md** | 开发 | 项目根目录 (替换)                      | ✅ (前次输出) |
| 1 | **差异化设计**               | 策略 | planning/differentiation.md     | ✅ (前次输出) |
| 2 | **营销冷启动**               | 策略 | planning/marketing-coldstart.md | ✅ (前次输出) |
| 3 | **中国大陆合规**              | 策略 | planning/compliance-china.md    | ✅ (前次输出) |
| 4 | **全球合规**                | 策略 | planning/compliance-global.md   | ✅ (前次输出) |
| D | **Claude Code 启动指南**    | 执行 | planning/execution-guide.md     | ✅        |

**全部 9 份文档已完整输出。** 将文档 A/B/C/5 放入项目根目录替换旧版，文档 1-4/D 放入 `planning/` 目录，即可按执行指南启动 Claude Code 开发。
