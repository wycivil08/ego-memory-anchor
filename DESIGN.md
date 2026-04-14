# DESIGN.md — ego-memory-anchor 技术蓝图

## 1. 数据模型

### 1.1 ER 关系图

```
auth.users (Supabase Auth)
│
├── 1:N ──> profiles (逝者档案)
│              │
│              ├── 1:N ──> memories (记忆素材)
│              ├── 1:N ──> family_members (家庭协作)
│              └── 1:N ──> reminders (纪念日提醒)
│
└── 1:N ──> family_members (被邀请记录)
```

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
| tags | jsonb | DEFAULT '[]'::JSONB | 用户标签（JSONB 数组，MVP 阶段不单独建表） |
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
```

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
│   ├── login/page.tsx                # 登录页 (邮箱+密码)
│   ├── register/page.tsx             # 注册页
│   ├── callback/route.ts            # Supabase OAuth callback handler
│   └── layout.tsx                    # Auth pages layout (centered card)
│
├── (main)/
│   ├── layout.tsx                    # 主布局 (sidebar/header + content area)
│   ├── dashboard/
│   │   └── page.tsx                  # 逝者档案列表 + 创建入口
│   │
│   ├── profile/
│   │   ├── new/page.tsx             # 创建逝者档案
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
│       └── [token]/page.tsx         # 接受家庭邀请
│
└── api/
    ├── export/[profileId]/route.ts   # 数据导出 API
    └── upload/route.ts              # 文件上传处理 (EXIF提取, 缩略图生成)
```

## 3. 组件树

```
components/
├── ui/                              # shadcn/ui (Button, Card, Dialog, Input, etc.)
│
├── layout/
│   ├── Sidebar.tsx                 # 侧边导航 (desktop)
│   ├── MobileNav.tsx               # 底部导航 (mobile)
│   ├── Header.tsx                  # 顶部栏
│   └── UserMenu.tsx                # 用户头像 + 下拉菜单
│
├── profile/
│   ├── ProfileCard.tsx             # 逝者档案卡片 (dashboard 列表用)
│   ├── ProfileForm.tsx             # 创建/编辑档案表单
│   └── ProfileHeader.tsx           # 时间线页面顶部的逝者信息区
│
├── timeline/
│   ├── Timeline.tsx                 # 时间线容器 (虚拟滚动)
│   ├── TimelineYear.tsx            # 年份分隔标记
│   ├── TimelineItem.tsx            # 单条记忆卡片
│   ├── TimelineFilters.tsx         # 筛选栏 (类型/标签/日期)
│   └── TimelineEmpty.tsx           # 空状态引导
│
├── memory/
│   ├── MemoryCard.tsx              # 记忆素材预览卡片
│   ├── MemoryDetail.tsx            # 素材详情展示
│   ├── PhotoViewer.tsx             # 照片查看器 (pinch zoom)
│   ├── VideoPlayer.tsx             # 视频播放器
│   ├── AudioPlayer.tsx             # 音频播放器 (带波形)
│   ├── TextViewer.tsx              # 文字/聊天记录展示
│   ├── AnnotationEditor.tsx         # 注释编辑器
│   └── SourceBadge.tsx             # "原始记录" 标记徽章
│
├── upload/
│   ├── UploadZone.tsx              # 拖拽上传区域
│   ├── UploadProgress.tsx          # 上传进度
│   ├── BatchUploadList.tsx         # 批量上传文件列表
│   ├── DatePicker.tsx              # 日期选择 (手动指定拍摄日期)
│   └── WechatImporter.tsx          # 微信记录导入向导
│
├── family/
│   ├── InviteDialog.tsx            # 邀请对话框
│   ├── MemberList.tsx              # 成员列表
│   └── RoleBadge.tsx               # 权限标记
│
├── reminders/
│   ├── ReminderForm.tsx            # 创建/编辑提醒
│   ├── ReminderList.tsx            # 提醒列表
│   └── ReminderBanner.tsx          # 首页/时间线顶部的提醒横幅
│
└── common/
    ├── EmptyState.tsx              # 通用空状态
    ├── LoadingSpinner.tsx          # 加载指示
    ├── ConfirmDialog.tsx           # 确认弹窗
    └── FileTypeIcon.tsx            # 文件类型图标
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
| < 640px (mobile)   | 底部导航, 单列时间线, 全屏媒体查看   |
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
