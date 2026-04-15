# V2 反向更新：开发文档补丁 + Landing Page 详细设计

以下将 PRODUCT\_V2.md 的所有差异化设计 **反向落地到开发文档中**，分为三个补丁文档 + 一个完整的 Landing Page 规格书。

***

# 文档 5/8：TASKS\_V2\_PATCH.md — TASKS.md 变更补丁

```markdown
# TASKS_V2_PATCH.md — 基于 V2 差异化设计的任务变更

> 本文档列出所有需要新增/修改/重排序的任务。执行时合并到 TASKS.md 中。

---

## 一、优先级重排

### 家庭协作从 Sprint 6 → Sprint 3（紧接档案 CRUD 之后）

**理由：** 家庭协作是核心增长引擎，不是"锦上添花"。
每延迟一个 Sprint，种子用户的裂变窗口就缩短一个开发周期。

**新的 Sprint 顺序：**

| Sprint | V1 内容 | V2 内容 | 变化 |
|--------|---------|---------|------|
| S0 | 项目骨架 | 项目骨架 | 不变 |
| S1 | 认证+布局 | 认证+布局 | 不变 |
| S2 | 档案 CRUD | 档案 CRUD | 不变 |
| S3 | 记忆上传 | **家庭协作** ← 前移 | ⬆️ 提升 |
| S4 | 时间线 | 记忆上传 | ⬇️ 后移一位 |
| S5 | 素材详情+注释 | 时间线 | ⬇️ 后移一位 |
| S6 | 家庭协作 | 素材详情+注释 | ⬇️ 后移一位 |
| S7 | 纪念日+微信导入 | 纪念日+微信导入 | 不变 |
| S8 | 设置+导出+首页+收尾 | **Landing Page + 数据导出 + 收尾** | 内容变更 |

### 数据导出从 S8 可选 → S8 P0 必做

理由：导出功能是信任基石。Landing Page 的隐私承诺区块会写"一键导出"，
如果用户进来发现没有这个功能，信任瞬间崩塌。

---

## 二、新增任务

### S2 新增：S2.T5 — 档案封面照片选择

- 依赖: S2.T2
- 文件: components/profile/CoverPhotoSelector.tsx, app/(main)/profile/[profileId]/edit/page.tsx
- 操作:
  1. 在 ProfileForm 中增加"封面照片"选项
  2. 默认使用头像
  3. 后续（S4之后）可从已上传照片中选择作为封面
  4. 封面照片显示在 Dashboard 的 ProfileCard 背景中
- 验证: 设置封面 → Dashboard 卡片显示正确

### S3（V2新）新增：家庭协作完整任务（从原 S6 前移）

> 以下任务编号重新编排为 S3.T1 - S3.T3，内容与原 S6.T1-S6.T3 相同，
> 但增加了微信分享优化。

#### S3.T1 — InviteDialog 组件（增强版）
- 依赖: S1.T1, S1.T4
- 文件: components/family/InviteDialog.tsx
- 操作:
  1. Dialog: 选择角色 (查看者/编辑者)
  2. 生成唯一 invite_token
  3. 显示邀请链接 (复制按钮)
  4. **V2 新增：** 邀请链接的 URL 结构优化为微信友好格式
     - URL 不超过 100 字符
     - 链接预览（Open Graph）显示逝者姓名 + "邀请你共同守护 XX 的记忆"
  5. **V2 新增：** 生成的链接附带一段可复制的文案模板：
     "我在整理 [逝者姓名] 的照片和录音，邀请你一起来补充。点击链接加入："
  6. INSERT family_members (user_id=null, invite_token=xxx)
- 验证: 生成链接; 微信内打开预览正确; 数据库记录正确

#### S3.T2 — 接受邀请页面
- （同原 S6.T2，不变）

#### S3.T3 — MemberList + 家庭管理页面
- （同原 S6.T3，不变）

### S8 重构：Landing Page 完整任务拆解

原 S8.T3 只有一个简单的 Landing Page 任务。V2 需要拆成 4 个子任务：

#### S8.T3a — Landing Page Hero + 价值主张
- 依赖: S1.T1
- 文件: app/page.tsx, components/landing/HeroSection.tsx, components/landing/ValueProps.tsx
- 操作:
  1. Hero 区块:
     - 标题："永不丢失关于 TA 的真实记忆"
     - 副标题："一站式聚合照片、视频、语音、聊天记录，为逝去的亲人或宠物编织一条生命时间线"
     - CTA 按钮："开始守护记忆"→ /register
     - 背景：温暖的抽象插画或渐变（不用真人照片）
  2. 三个价值主张卡片：
     - 📸 "汇集" — "把散落在手机、微信、云盘里的照片和录音收集到一个安全的地方"
     - 📅 "时间线" — "自动按日期排列，编织成一条从出生到告别的生命故事"
     - 👨‍👩‍👧‍👦 "家人共建" — "邀请家人一起补充记忆，每个人的视角都珍贵"
- 验证: 页面渲染; 移动端排版; CTA 跳转正确

#### S8.T3b — Landing Page 创始人故事区块
- 依赖: S8.T3a
- 文件: components/landing/FounderStory.tsx
- 操作:
  1. 区块设计：
     - 左侧：创始人照片（圆形头像，带柔和阴影）
     - 右侧：故事文案（参照 MARKETING.md 1.2 模板）
     - 移动端：头像在上，文案在下
  2. 文案内容占位（创始人填写后替换）：
```

"为什么做忆锚"

三年前我失去了\_\_\_\_。
几个月后我发现了一件更可怕的事：
关于 TA 的记忆正在消散。

\[阅读完整故事 →]

```
3. "阅读完整故事"展开更多文字（不跳转新页面，用 expand/collapse）
4. 风格：stone-50 背景，文字 stone-700，标题 stone-900
- 验证: 展开/收起动效; 移动端排版

#### S8.T3c — Landing Page 隐私承诺区块
- 依赖: S8.T3a
- 文件: components/landing/PrivacyPledge.tsx
- 操作:
1. 标题："你的记忆，只属于你"
2. 四个承诺项（带图标）：
- 🔒 "零合成" — "我们不生成 AI 对话，不合成任何内容，只保存你上传的真实记录"
- 📦 "一键导出" — "随时下载你的全部数据，ZIP 格式，不依赖任何平台"
- 🗑️ "一键删除" — "你可以随时删除账号和全部数据，30 天内永久清除"
- 🚫 "零广告零追踪" — "不做数据分析，不投广告，不把你的数据分享给任何人"
3. 底部小字链接到完整隐私政策
4. 风格：amber-50 淡底色卡片，四个项两行两列
- 验证: 渲染正确; 隐私政策链接可点击

#### S8.T3d — Landing Page 底部 + SEO
- 依赖: S8.T3a
- 文件: components/landing/Footer.tsx, app/layout.tsx (metadata)
- 操作:
1. Footer：
- 品牌名 "忆锚"
- 链接：隐私政策 | 用户协议 | 联系我们
- 备案号（预留位置）
- 版权信息 "© 2026 ego · 守护真实记忆"
2. SEO metadata（在 layout.tsx 或 page.tsx 中）：
- title: "忆锚 — 永不丢失关于 TA 的真实记忆"
- description: "一站式聚合照片、视频、语音、聊天记录..."
- keywords: "纪念亲人,保存照片,微信聊天记录保存,宠物纪念..."
- Open Graph tags（title, description, image）
- canonical URL
3. 创建 public/og-image.jpg —— 1200x630px，温暖色调，品牌名+标语
- 验证: 微信分享链接有正确预览; Lighthouse SEO > 90

### S8 新增：S8.T2v2 — 数据导出功能（增强版）

替代原 S8.T2，增加以下内容：

- 依赖: S4 (上传功能完成后)
- 文件: app/api/export/[profileId]/route.ts, components/settings/ExportButton.tsx
- 操作:
1. **导出入口出现在三个位置**：
- 用户设置页 → 最醒目位置
- 档案编辑页 → 操作栏
- Landing Page 隐私承诺 → 文案中提及
2. 导出流程：
- 选择要导出的档案
- 服务端打包 ZIP（参考 PRODUCT_V2.md 中的导出包结构）
- 流式下载 + 进度提示
3. **ZIP 内容结构**：
```

_的记忆_.zip
├── 照片/
│   └── \_├── 视频/
├── 语音/
├── 文字记录/
├── 扫描件/
├── metadata.json
└── README.txt

```
4. metadata.json 包含：档案信息 + 每条素材的元数据(日期/标签/注释/贡献者)
5. README.txt 内容：
```

这是你从忆锚导出的全部数据。
格式通用，不依赖任何平台。
如需帮助，请联系 [support@yimao.app](mailto:support@yimao.app)​

```
- 验证: 导出 10 条混合素材 → ZIP 完整可解压 → metadata.json 结构正确

### S8 新增：S8.T7 — 隐私政策 + 用户协议页面

- 依赖: S1.T1
- 文件: app/privacy/page.tsx, app/terms/page.tsx
- 操作:
1. 隐私政策页面（中文），内容按 COMPLIANCE_CHINA.md 第 4 节提纲编写
2. 用户服务协议页面（中文）
3. 纯静态 Markdown 渲染，不需要动态数据
4. 底部 Footer 和注册页面链接到这两个页面
5. 注册流程中增加 checkbox："我已阅读并同意《隐私政策》和《用户协议》"
- checkbox 未勾选时注册按钮禁用
- 验证: 页面可访问; 注册流程需勾选才能提交

---

## 三、修改的现有任务

### S2.T3 — Dashboard 页面（增强）

增加以下内容：
- ProfileCard 增加 **素材数量统计**（照片 X 张 / 视频 X 段 / 语音 X 条）
- ProfileCard 增加 **家人数量**（"3 位家人共同守护"）
- ProfileCard 增加 **逝者一句话描述**
- Dashboard 顶部增加 **纪念日温馨横幅**（原在 S7，现在 Dashboard 预留位置）
- **V2 新增**：如果用户没有任何档案，空状态文案改为：
"为你想守护的人，建一个记忆空间"
CTA："为 TA 创建" → /profile/new

### S1.T6/T7 — 注册/登录页面（增强）

增加以下内容：
- 注册页增加 **隐私政策 + 用户协议 checkbox**
- 注册页底部增加 **一句话**："你的数据只属于你。我们不做 AI 合成，不投广告。"
- 视觉上与 Landing Page 保持一致的温暖色调

### S5.T5 — AnnotationEditor + SourceBadge（增强）

SourceBadge 的 V2 设计细节：
- 使用 `<Badge variant="secondary">` 样式
- 文字："原始记录"
- 颜色：stone-200 背景 + stone-600 文字
- 位置：每条素材卡片的右上角 或 日期旁边
- **不可点击、不可编辑、不可删除** — 纯展示
- Tooltip："此内容为用户上传的原始真实记录"

---

## 四、V2 Sprint 总览（完整）

| Sprint | 任务数 | 核心产出 | V2 变化 |
|--------|--------|---------|--------|
| S0 | 4 | 项目骨架 | 不变 |
| S1 | 8 | 认证+布局 | 注册页增加隐私 checkbox |
| S2 | 5 (+1) | 档案 CRUD | +封面照片; Dashboard 增强 |
| **S3** | **3** | **家庭协作** | **⬆️ 从 S6 前移** |
| S4 | 6 | 记忆上传 | 不变（原 S3 内容） |
| S5 | 5 | 时间线 | 不变（原 S4 内容） |
| S6 | 6 | 素材详情+注释 | 不变（原 S5 内容） |
| S7 | 4 | 纪念日+微信导入 | 不变 |
| **S8** | **9** (+3) | Landing Page + 导出 + 合规 + 收尾 | **Landing Page 拆为 4 子任务; 导出增强; +隐私政策页** |
| **总计** | **50** | | 原 41 → 50 |
```

***

# 文档 6/8：DESIGN\_V2\_PATCH.md — DESIGN.md 变更补丁

```markdown
# DESIGN_V2_PATCH.md — 基于 V2 差异化设计的技术蓝图变更

---

## 1. 页面结构变更

### 新增页面

| 路由 | 组件 | 类型 | 说明 |
|------|------|------|------|
| `/privacy` | PrivacyPage | Server (静态) | 隐私政策 |
| `/terms` | TermsPage | Server (静态) | 用户协议 |

### Landing Page 页面结构细化

```

app/page.tsx
├── HeroSection          ← 标题 + 副标题 + CTA
├── ValueProps           ← 三个价值主张卡片
├── FounderStory         ← 创始人故事（可展开）
├── PrivacyPledge        ← 隐私承诺四项
├── CTABanner            ← 底部重复 CTA："开始守护记忆"
└── Footer               ← 品牌 + 链接 + 备案号

```

---

## 2. 组件树变更

### 新增组件目录: `components/landing/`

```

components/landing/
├── HeroSection.tsx         # 首屏大标题区
├── ValueProps.tsx           # 三个价值主张卡片
├── FounderStory.tsx         # 创始人故事区块
├── PrivacyPledge.tsx        # 隐私承诺区块
├── CTABanner.tsx            # 底部 CTA
└── Footer.tsx               # 全站底部

````

### 修改组件: `components/profile/ProfileCard.tsx`

V2 增加的字段渲染：

```typescript
interface ProfileCardProps {
  profile: Profile & {
    memoryCount: number          // 素材总数
    // V2 新增：
    memoryCounts: {
      photo: number
      video: number
      audio: number
      text: number
      document: number
    }
    familyMemberCount: number    // 家人数量
  }
}
````

**卡片布局 V2：**

```
┌─────────────────────────┐
│ [封面照片 / 头像背景]     │  ← 如有封面照片，作为卡片顶部背景
│                         │
│  [头像]                  │
│  爷爷 · 张建国            │
│  1945 — 2023             │
│  "永远笑眯眯的老爷子"     │
│                         │
│  📷 210  🎬 12  🎤 50    │  ← 分类素材数
│  👨‍👩‍👧‍👦 4 位家人共同守护    │  ← 家人数
└─────────────────────────┘
```

### 新增组件: `components/settings/ExportButton.tsx`

导出按钮的通用组件，出现在三个位置：

1. `/settings` 设置页
2. `/profile/[profileId]/edit` 档案编辑页
3. Landing Page 隐私承诺文案中（文字链接）

```typescript
interface ExportButtonProps {
  profileId: string
  profileName: string
  variant?: 'button' | 'link'  // button 用于设置页，link 用于内联
}
```

### 修改组件: `components/memory/SourceBadge.tsx`

V2 详细规格：

```typescript
// SourceBadge 设计规范
// 位置：TimelineItem 卡片内，日期旁边
// 样式：shadcn Badge variant="secondary"
// 颜色：bg-stone-100 text-stone-500 border-stone-200
// 文字："原始记录"
// 交互：不可点击，hover 显示 tooltip
// Tooltip："此内容为用户上传的原始真实记录，未经任何修改"
// 重要：此组件不接受任何可改变标签文字的 prop

export function SourceBadge() {
  return (
    <Badge variant="secondary" className="...">
      原始记录
    </Badge>
  )
}
// 没有 props。这是故意的——标签内容不可配置。
```

***

## 3. 数据模型变更

### profiles 表新增字段

```sql
ALTER TABLE profiles ADD COLUMN cover_photo_path TEXT;
-- 封面照片的 Storage 路径，从已上传的素材中选择
-- 如果为空，Dashboard 使用 avatar_path
```

### 邀请链接的 Open Graph 元数据

邀请页面 `/invite/[token]` 需要动态 OG 标签：

```typescript
// app/(main)/invite/[token]/page.tsx
export async function generateMetadata({ params }) {
  const invitation = await getInvitation(params.token)
  const profile = await getProfile(invitation.profile_id)
  
  return {
    title: `加入「${profile.name}」的记忆空间 — 忆锚`,
    description: `${invitation.inviter_name} 邀请你共同守护 ${profile.name} 的真实记忆`,
    openGraph: {
      title: `加入「${profile.name}」的记忆空间`,
      description: `共同守护真实记忆`,
      images: [profile.avatar_url || '/og-default.jpg'],
    },
  }
}
```

***

## 4. SEO 基础架构

### Root Layout Metadata

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: '忆锚 — 永不丢失关于 TA 的真实记忆',
    template: '%s — 忆锚',
  },
  description: '一站式聚合照片、视频、语音、聊天记录，为逝去的亲人或宠物编织一条生命时间线。不做 AI 合成，只保存真实记忆。',
  keywords: ['纪念亲人', '保存去世亲人照片', '微信聊天记录保存', '宠物纪念', '在线纪念馆', '记忆保存'],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://yimao.app',
    siteName: '忆锚',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  robots: {
    index: true,
    follow: true,
  },
}
```

### 语义化 HTML 规范

```
Landing Page:
<main>
  <section aria-label="产品介绍">        ← HeroSection
  <section aria-label="核心价值">        ← ValueProps
  <section aria-label="创始人故事">      ← FounderStory
  <section aria-label="隐私承诺">        ← PrivacyPledge
  <section aria-label="开始使用">        ← CTABanner
</main>
<footer>                                ← Footer

Timeline Page:
<main>
  <header aria-label="逝者信息">         ← ProfileHeader
  <nav aria-label="筛选">               ← TimelineFilters
  <section aria-label="时间线">
    <article> ... </article>            ← 每条 TimelineItem
  </section>
</main>
```

***

## 5. 邀请链接分享文案模板

InviteDialog 生成链接时，附带可复制的文案：

```
模板 A（默认）：
"我在整理{逝者姓名}的照片和录音，邀请你一起来补充记忆。
点击链接加入：{链接}"

模板 B（宠物）：
"我在整理{宠物名}的照片和视频，邀请你一起看看。
点击链接加入：{链接}"
```

**实现方式：** InviteDialog 底部有"复制邀请文案"按钮，
点击后将文案 + 链接一起复制到剪贴板。用户直接粘贴到微信即可。

````

---

# 文档 7/8：LANDING_PAGE_SPEC.md — Landing Page 完整设计规格

```markdown
# LANDING_PAGE_SPEC.md — 忆锚 Landing Page 完整设计规格

---

## 1. 页面结构与视觉节奏

````

┌─────────────────────────────────────────────────────┐
│ Navbar: logo "忆锚" ··················· \[登录] \[注册] │
├─────────────────────────────────────────────────────┤
│                                                     │
│              § HeroSection (100vh)                   │
│    ─ 大标题 + 副标题 + CTA + 抽象插画/渐变背景 ─     │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│              § ValueProps                            │
│    ─ 三张卡片横排（移动端竖排） ─                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│              § HowItWorks                            │
│    ─ 三步流程：上传 → 时间线自动生成 → 家人共建 ─     │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│              § FounderStory                          │
│    ─ 创始人照片 + 故事 ─                             │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│              § PrivacyPledge                         │
│    ─ 四个承诺 ─                                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│              § CTABanner                             │
│    ─ "开始守护记忆" 按钮 ─                           │
│                                                     │
├─────────────────────────────────────────────────────┤
│ Footer: 品牌 | 隐私政策 | 协议 | 联系 | 备案号       │
└─────────────────────────────────────────────────────┘

```

---

## 2. 各区块详细设计

### 2.1 HeroSection

**桌面版 (≥1024px)：**

```

┌──────────────────────────────────────────────────────┐
│                                                      │
│     \[左侧 60%]                    \[右侧 40%]         │
│                                                      │
│     永不丢失                       ┌──────────┐      │
│     关于 TA 的真实记忆              │ 温暖色调  │      │
│                                    │ 抽象插画  │      │
│     一站式聚合照片、视频、          │ 时间线    │      │
│     语音、聊天记录，               │ 意象      │      │
│     为逝去的亲人或宠物              └──────────┘      │
│     编织一条生命时间线                                │
│                                                      │
│     \[  开始守护记忆  →  ]                             │
│                                                      │
│     已有 XX 个家庭在使用忆锚守护记忆                   │
│     ← MVP 初期隐藏此行，有数据后再展示                 │
│                                                      │
└──────────────────────────────────────────────────────┘

```

**移动端 (<640px)：**

```

┌────────────────────────┐
│  \[插画/渐变背景]        │
│                        │
│  永不丢失               │
│  关于 TA 的真实记忆      │
│                        │
│  一站式聚合照片、视频、  │
│  语音、聊天记录          │
│                        │
│  \[ 开始守护记忆 → ]     │
│                        │
└────────────────────────┘

```

**设计规范：**

| 元素 | 规范 |
|------|------|
| 标题 | text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 |
| 副标题 | text-lg sm:text-xl text-stone-600 leading-relaxed max-w-2xl |
| CTA 按钮 | shadcn Button size="lg", amber-700 背景, 白色文字, rounded-lg, px-8 py-3 |
| 背景 | stone-50 底色 + 右侧/顶部渐变暖色（amber-50 → transparent） |
| 间距 | py-20 sm:py-32 |

### 2.2 ValueProps

```

┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
│    📸               │  │    📅               │  │   👨‍👩‍👧‍👦              │
│                     │  │                     │  │                     │
│    汇集             │  │    时间线           │  │    家人共建         │
│                     │  │                     │  │                     │
│ 把散落在手机、微信、│  │ 自动按日期排列，    │  │ 邀请家人一起        │
│ 云盘里的照片和录音  │  │ 编织成一条从出生    │  │ 补充记忆，每个人    │
│ 收集到一个安全的    │  │ 到告别的生命故事    │  │ 的视角都珍贵        │
│ 地方                │  │                     │  │                     │
└───────────────────┘  └───────────────────┘  └───────────────────┘

```

**设计规范：**

| 元素 | 规范 |
|------|------|
| 卡片 | shadcn Card, rounded-xl, p-8, text-center |
| 图标 | 48px, amber-600 |
| 标题 | text-xl font-semibold text-stone-900 |
| 描述 | text-sm text-stone-600 leading-relaxed |
| 布局 | grid grid-cols-1 sm:grid-cols-3 gap-6 |
| 间距 | py-16 sm:py-24 |

### 2.3 HowItWorks（新增区块）

```

它如何工作

①                    ②                    ③
上传记忆          时间线自动生成        家人一起守护

拖拽照片、视频、    系统读取拍摄日期     邀请家人加入，
语音到忆锚，       自动按年→月→日排列    每个人都可以
支持微信聊天       编织成完整的         补充记忆和注释
记录一键导入       生命时间线

```

**设计规范：**

| 元素 | 规范 |
|------|------|
| 步骤编号 | 48px 圆形, amber-100 背景, amber-800 数字 |
| 连接线 | 桌面端三个步骤间有水平虚线连接; 移动端垂直排列 |
| 标题 | text-lg font-semibold |
| 背景 | stone-50（与 Hero 一致） |

### 2.4 FounderStory

**桌面版：**

```

┌──────────────────────────────────────────────────────┐
│                                                      │
│  "为什么做忆锚"                                       │
│                                                      │
│  ┌────────┐                                          │
│  │ \[创始人│   三年前我失去了\_\_\_\_。                     │
│  │  头像] │   几个月后我发现了一件更可怕的事：          │
│  │ 80px   │   关于 TA 的记忆正在消散。                 │
│  └────────┘                                          │
│             换了手机后，很多照片找不到了。               │
│             微信里那条语音消息，因为太久没点开，          │
│             已经无法播放了。                            │
│                                                      │
│             ▼ 阅读更多                                │
│                                                      │
│  ┌─ 展开后 ──────────────────────────────────┐       │
│  │ 我开始把所有能找到的照片、视频、语音消息     │       │
│  │ 收集到一起。翻遍了旧手机、微信聊天、        │       │
│  │ 云盘、家人的相册……                         │       │
│  │                                           │       │
│  │ 这个过程很痛苦，但每找到一条记录，          │       │
│  │ 我都觉得——"还好，这段记忆还在。"           │       │
│  │                                           │       │
│  │ 忆锚不"复活"任何人，不生成 AI 对话，       │       │
│  │ 不合成任何内容。                           │       │
│  │ 我们只做一件事：守护你已有的真实记录，      │       │
│  │ 让它们永远不丢失。                         │       │
│  └───────────────────────────────────────────┘       │
│                                                      │
└──────────────────────────────────────────────────────┘

```

**设计规范：**

| 元素 | 规范 |
|------|------|
| 背景 | white (与 stone-50 交替产生节奏感) |
| 创始人头像 | 80px rounded-full, border-2 border-stone-200 |
| 引言文字 | text-lg text-stone-700 leading-relaxed italic |
| 展开文字 | text-base text-stone-600 |
| "阅读更多" | text-amber-700 cursor-pointer, 展开用 transition-all |
| 间距 | py-16 sm:py-24 |

### 2.5 PrivacyPledge

```

┌──────────────────────────────────────────────────────┐
│                                                      │
│  你的记忆，只属于你                                    │
│                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐   │
│  │ 🔒 零合成            │  │ 📦 一键导出          │   │
│  │                      │  │                      │   │
│  │ 不生成 AI 对话，      │  │ 随时下载全部数据，    │   │
│  │ 不合成任何内容，      │  │ ZIP 格式，           │   │
│  │ 只保存你上传的        │  │ 不依赖任何平台        │   │
│  │ 真实记录              │  │                      │   │
│  └─────────────────────┘  └─────────────────────┘   │
│                                                      │
│  ┌─────────────────────┐  ┌─────────────────────┐   │
│  │ 🗑️ 一键删除          │  │ 🚫 零广告零追踪      │   │
│  │                      │  │                      │   │
│  │ 随时删除账号和        │  │ 不做数据分析，        │   │
│  │ 全部数据，           │  │ 不投广告，            │   │
│  │ 30 天内永久清除       │  │ 不把数据分享给任何人  │   │
│  └─────────────────────┘  └─────────────────────┘   │
│                                                      │
│  阅读完整隐私政策 →                                   │
│                                                      │
└──────────────────────────────────────────────────────┘

```

**设计规范：**

| 元素 | 规范 |
|------|------|
| 背景 | amber-50 / 极淡暖色 |
| 卡片 | bg-white rounded-xl p-6, border border-amber-100 |
| 图标 | 32px, amber-700 |
| 标题 | text-base font-semibold text-stone-900 |
| 描述 | text-sm text-stone-600 |
| 布局 | grid grid-cols-1 sm:grid-cols-2 gap-4 |
| 链接 | text-amber-700 hover:underline |

### 2.6 CTABanner

```

┌──────────────────────────────────────────────────────┐
│                                                      │
│           守护关于 TA 的真实记忆                       │
│           从今天开始                                  │
│                                                      │
│           \[  免费开始使用  →  ]                       │
│                                                      │
│     无需信用卡 · 数据随时可导出 · 永久免费基础功能     │
│                                                      │
└──────────────────────────────────────────────────────┘

```

**设计规范：**

| 元素 | 规范 |
|------|------|
| 背景 | stone-900 (深色反差) |
| 标题 | text-2xl sm:text-3xl font-bold text-white |
| CTA | Button variant="default", amber-500 背景, stone-900 文字, size="lg" |
| 小字 | text-sm text-stone-400 |
| 间距 | py-20 text-center |

### 2.7 Footer

```

┌──────────────────────────────────────────────────────┐
│                                                      │
│  忆锚 · 守护真实记忆                                  │
│                                                      │
│  隐私政策  ·  用户协议  ·  联系我们                    │
│                                                      │
│  © 2026 ego · ICP备案号预留位置                       │
│                                                      │
└──────────────────────────────────────────────────────┘

```

| 元素 | 规范 |
|------|------|
| 背景 | stone-100 |
| 文字 | text-sm text-stone-500 |
| 链接 | text-stone-600 hover:text-stone-900 |
| 间距 | py-12 |

---

## 3. 响应式适配要点

| 区块 | 桌面 (≥1024px) | 平板 (640-1023px) | 手机 (<640px) |
|------|----------------|-------------------|---------------|
| Hero | 左文右图并排 | 左文右图并排，图缩小 | 上图下文垂直 |
| ValueProps | 三列 | 三列（缩窄） | 单列 |
| HowItWorks | 三步横排+连接线 | 三步横排 | 单列垂直 |
| FounderStory | 头像左浮+文字右侧 | 同桌面 | 头像居中上方+文字下方 |
| PrivacyPledge | 2x2 网格 | 2x2 网格 | 单列 |
| CTABanner | 居中 | 居中 | 居中 |

---

## 4. 性能要求

| 指标 | 目标 |
|------|------|
| First Contentful Paint | < 1.0s |
| Largest Contentful Paint | < 2.0s |
| Cumulative Layout Shift | < 0.1 |
| Lighthouse Performance | > 90 |
| Lighthouse SEO | > 95 |
| Lighthouse Accessibility | > 95 |

**实现要点：**
- Hero 插画用 SVG 或 CSS 渐变，不用大图
- 不引入第三方分析/追踪脚本
- 使用 next/font 加载 Inter，避免 FOUT
- 所有图片使用 Next.js Image 组件（自动 lazy loading + 格式优化）
```

***

# 文档 8/8：V2\_CHANGELOG.md — 变更汇总清单

```markdown
# V2_CHANGELOG.md — 所有文档变更汇总

> 本文档列出 V2 产品设计引入的全部变更，供 Claude Code 执行时参照。

---

## 需要更新的现有文档

### CLAUDE.md 变更

1. **项目结构新增**:
```

components/landing/       # Landing Page 组件
app/privacy/page.tsx      # 隐私政策页
app/terms/page.tsx        # 用户协议页
docs/                     # V2 文档目录

```

2. **安全红线新增**:
```

* 绝不移除或修改 SourceBadge 的"原始记录"文字
* 注册流程必须包含隐私政策同意 checkbox
* 数据导出入口必须在设置页最醒目位置

```

### PRODUCT_SPEC.md 变更

1. P0 功能列表新增：家庭邀请(从P1升级)、数据导出(从P1升级)、Landing Page 隐私区块
2. 新增用户故事 US-12: "作为潜在用户，我打开 Landing Page 需要看到你们不做 AI 合成的承诺，才愿意注册"
3. 新增用户故事 US-13: "作为用户，我要随时看到'原始记录'标记，确认这些内容未被篡改"

### DESIGN.md 变更

1. profiles 表新增 `cover_photo_path` 字段
2. 页面结构新增 `/privacy`, `/terms`
3. 组件树新增 `components/landing/` 目录（6 个组件）
4. ProfileCard 接口新增 `memoryCounts` 和 `familyMemberCount`
5. 邀请页面需动态 Open Graph 元数据

### TASKS.md 变更

1. **Sprint 顺序重排**: 家庭协作从 S6 → S3
2. **新增 9 个任务**:
- S2.T5 封面照片
- S8.T3a Hero + 价值主张
- S8.T3b 创始人故事
- S8.T3c 隐私承诺
- S8.T3d Footer + SEO
- S8.T2v2 导出功能增强
- S8.T7 隐私政策+协议页面
- S3.T1-T3 家庭协作前移
3. **修改 3 个任务**: S2.T3 Dashboard增强、S1.T6/T7 注册增强、S5.T5 SourceBadge增强
4. **总任务数**: 41 → 50

---

## 新增的独立文档

| 文档 | 存放位置 | 用途 |
|------|---------|------|
| PRODUCT_V2.md | docs/ | 差异化产品策略 |
| MARKETING.md | docs/ | 冷启动与增长 |
| COMPLIANCE_CHINA.md | docs/ | 中国大陆合规 |
| COMPLIANCE_GLOBAL.md | docs/ | 全球合规 |
| TASKS_V2_PATCH.md | docs/ | TASKS.md 变更补丁 |
| DESIGN_V2_PATCH.md | docs/ | DESIGN.md 变更补丁 |
| LANDING_PAGE_SPEC.md | docs/ | Landing Page 完整设计 |
| V2_CHANGELOG.md | docs/ | 本文档 |

---

## Claude Code 执行顺序建议

1. **先将补丁合并到主文档**：把 TASKS_V2_PATCH 和 DESIGN_V2_PATCH 的变更手动合并到 TASKS.md 和 DESIGN.md 中
2. **或者让 Claude Code 读取补丁文档**：在 CLAUDE.md 中添加：
```

## V2 参考文档

* 差异化设计: docs/PRODUCT\_V2.md
* Landing Page 设计: docs/LANDING\_PAGE\_SPEC.md
* 任务变更: docs/TASKS\_V2\_PATCH.md
* 技术变更: docs/DESIGN\_V2\_PATCH.md

```
3. 按新的 Sprint 顺序执行 S0 → S1 → S2 → **S3(家庭协作)** → S4 → ... → S8

---

## 关键提醒

| 提醒 | 详情 |
|------|------|
| **S3 前移是最重要的变更** | 家庭协作是增长引擎，必须在上传功能之前就绑定用户 |
| **Landing Page 不是最后做** | S8 在时间线上看是最后，但 Landing Page 的文案和设计应从 S1 就开始准备（文案可以先写） |
| **导出功能不能拖** | 如果 Landing Page 承诺了"一键导出"但功能不存在，用户信任直接归零 |
| **SourceBadge 是灵魂** | 这个小小的徽章是忆锚与所有竞品/网盘的最深层区别，代码中绝不允许使它可配置或可隐藏 |
```

***

**全部 8 份文档已完整交付。** 完整文档体系如下：

```echarts
{
  "tooltip": { "trigger": "item" },
  "series": [{
    "type": "treemap",
    "width": "95%",
    "height": "85%",
    "breadcrumb": { "show": true },
    "label": { "fontSize": 11, "formatter": "{b}" },
    "data": [
      {
        "name": "产品策略层",
        "value": 30,
        "itemStyle": { "color": "#b45309" },
        "children": [
          { "name": "PRODUCT_V2.md\n差异化设计", "value": 12 },
          { "name": "LANDING_PAGE_SPEC.md\nLP完整规格", "value": 10 },
          { "name": "MARKETING.md\n冷启动与增长", "value": 8 }
        ]
      },
      {
        "name": "合规层",
        "value": 15,
        "itemStyle": { "color": "#d97706" },
        "children": [
          { "name": "COMPLIANCE_CHINA.md\n中国大陆", "value": 8 },
          { "name": "COMPLIANCE_GLOBAL.md\n全球", "value": 7 }
        ]
      },
      {
        "name": "开发执行层（补丁）",
        "value": 25,
        "itemStyle": { "color": "#3b82f6" },
        "children": [
          { "name": "TASKS_V2_PATCH.md\n任务变更", "value": 10 },
          { "name": "DESIGN_V2_PATCH.md\n技术变更", "value": 8 },
          { "name": "V2_CHANGELOG.md\n变更汇总", "value": 7 }
        ]
      },
      {
        "name": "现有文档（需更新）",
        "value": 30,
        "itemStyle": { "color": "#6366f1" },
        "children": [
          { "name": "CLAUDE.md\n+V2参考+安全红线", "value": 8 },
          { "name": "TASKS.md\nSprint重排+9新任务", "value": 10 },
          { "name": "DESIGN.md\n+新组件+新字段+SEO", "value": 7 },
          { "name": "PRODUCT_SPEC.md\n+P0提升+新US", "value": 5 }
        ]
      }
    ]
  }]
}
```

**下一步行动：**

1. 将 8 份文档放入 `docs/` 目录
2. 按 `V2_CHANGELOG.md` 中的指引更新 `CLAUDE.md`（添加 V2 参考文档路径 + 新安全红线）
3. 启动 Claude Code，从 **S0.T1** 开始执行，按 V2 新 Sprint 顺序推进
