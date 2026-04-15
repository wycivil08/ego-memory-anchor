# TASKS.md — ego-memory-anchor V2 MVP 开发任务

格式: ID: S{sprint}.T{task}, 标注 [V2] 为新增任务, 标注 [BUGFIX] 为 bug 修复

---

## Phase 0: Critical Bug Fixes（优先于所有开发）

### P0.T1 [BUGFIX] — Storage Bucket 配置修复
- **问题**: `supabase/migrations/001_initial_schema.sql` 中 buckets 设置为 `public: false`，但代码中所有地方都在构造 `public/` URL
- **影响**: 上传成功，但图片预览失败
- **操作**:
  1. 修改 migration，将 `avatars` 和 `memories` bucket 设为 `public: true`
  2. `supabase db push` 到本地和 production
  3. 验证图片加载正常
- **验证**: 本地 preview + Vercel preview 都能正常显示图片
- **提交**: `fix(storage): set buckets public:true to enable image preview`

### P0.T2 [BUGFIX] — Server Action 测试架构修复
- **问题**: V1 实现的 Server Action 测试使用 `vi.mock()` mock 了 Supabase client，违反"禁止 mock Supabase client"规则
- **影响**: 162 个"通过"的测试实际上没有测试任何真实的数据库操作
- **涉及文件**:
  - `tests/unit/lib/actions/memory.test.ts` → 改用真实 Supabase + UUID cleanup
  - `tests/unit/lib/actions/family.test.ts` → 改用真实 Supabase + UUID cleanup
  - `tests/unit/lib/actions/reminder.test.ts` → 改用真实 Supabase + UUID cleanup
  - `tests/unit/lib/actions/auth.test.ts` → 改用真实 Supabase + UUID cleanup
- **不需改造**:
  - `tests/unit/lib/utils/storage.test.ts` → 保留 mock（测试 URL 构造）
  - `tests/unit/lib/supabase/middleware.test.ts` → 保留 mock（Edge Runtime）
- **提交**: `test: refactor Server Action tests to use real Supabase client`

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
- 文件: lib/supabase/server.ts, client.ts, middleware.ts
- 验证: 未登录重定向; 登录后可访问 dashboard

### S1.T3 — TypeScript 类型定义
- 文件: lib/types/database.ts (supabase gen types), lib/types/index.ts
- 验证: 编译通过

### S1.T4 — 注册页面
- 文件: app/(auth)/register/page.tsx, app/(auth)/layout.tsx
- **[V2增强]** 注册页增加隐私政策+用户协议 checkbox，未勾选禁用注册按钮
- **[V2增强]** 注册页底部增加一句话："你的数据只属于你。我们不做 AI 合成，不投广告。"
- 验证: 注册成功 + checkbox 校验

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
- **[V2增强]** ProfileCard 增加素材数量统计（照片X张/视频X段/语音X条）
- **[V2增强]** ProfileCard 增加家人数量（"3 位家人共同守护"）
- **[V2增强]** ProfileCard 增加逝者一句话描述
- **[V2增强]** Dashboard 顶部预留纪念日温馨横幅位置
- **[V2增强]** 空状态文案改为"为你想守护的人，建一个记忆空间"
- 验证: 空状态/有数据渲染正确

### S2.T4 — 编辑/删除档案
- 文件: app/(main)/profile/[profileId]/edit/page.tsx
- 验证: 编辑/删除成功

### S2.T5 [V2] — 档案封面照片选择
- 文件: components/profile/CoverPhotoSelector.tsx, app/(main)/profile/[profileId]/edit/page.tsx
- 操作:
  1. ProfileForm 增加"封面照片"选项
  2. 默认使用头像
  3. 后续可从已上传照片中选择作为封面
  4. 封面照片显示在 Dashboard 的 ProfileCard 背景中
- 验证: 设置封面 → Dashboard 卡片显示正确

### S2.T6 [V2] — 享年与统计计算工具
- 文件: lib/utils/date.ts, lib/utils/stats.ts
- TDD: calculateAge, getMemoryStats, getNextReminder
- 验证: 单元测试 (闰年, 跨年, 只有出生日等)

### S2.T7 [V2] — 生命摘要组件
- 文件: components/profile/ProfileSummary.tsx, MemoryStats.tsx, ReminderCountdown.tsx, FamilyActivity.tsx
- 验证: 有数据/无数据均正确渲染

---

## Sprint 3: 家庭协作（增长引擎 P0）

### S3.T1 — InviteDialog 组件（增强版）
- **[V2]** 微信友好 URL（不超过100字符）
- **[V2]** 链接预览（Open Graph）显示逝者姓名 + "邀请你共同守护 XX 的记忆"
- **[V2]** 生成可复制的邀请文案模板："我在整理{逝者姓名}的照片和录音，邀请你一起来补充。点击链接加入："
- 文件: components/family/InviteDialog.tsx
- 验证: 生成链接; 微信内打开预览正确; 数据库记录正确

### S3.T2 — 接受邀请页面
- 文件: app/(main)/invite/[token]/page.tsx
- **[V2]** 动态 Open Graph 元数据（generateMetadata）
- 未登录 → 引导注册 → 自动加入; 已登录 → 点击加入
- 验证: 完整流程

### S3.T3 — MemberList + 家庭管理页面
- 文件: app/(main)/profile/[profileId]/family/page.tsx, components/family/MemberList.tsx, components/family/RoleBadge.tsx
- 成员列表 + 角色修改 + 移除 + 待接受状态
- 验证: 全流程

---

## Sprint 4: 记忆上传

### S4.T1 — UploadZone 组件
- 拖拽 + 点击 + 类型校验 + 大小校验
- **[V2]** 首次上传触发隐私同意弹窗
- 验证: 非法类型被拒

### S4.T2 — EXIF 提取工具 (TDD)
- 文件: lib/utils/exif.ts
- 验证: 有EXIF→日期; 无EXIF→null

### S4.T3 — 缩略图生成工具 (TDD)
- 文件: lib/utils/thumbnail.ts
- 验证: 照片→缩略图; 视频→首帧

### S4.T4 — 上传进度组件
- 文件: components/upload/UploadProgress.tsx, BatchUploadList.tsx
- 验证: 各状态渲染

### S4.T5 — 上传页面 + 上传逻辑
- 文件: app/(main)/profile/[profileId]/upload/page.tsx, lib/utils/upload.ts
- 并发上传最多 3 文件
- 验证: 照片+视频上传成功

### S4.T6 — DatePicker 组件
- 支持精度: 日/月/年/不确定
- 验证: 各选项正确

---

## Sprint 5: 时间线视图

### S5.T1 — 时间线数据加载
- 文件: lib/utils/timeline.ts
- 分组: 年→月→日; 分页50条
- 验证: 单元测试

### S5.T2 — TimelineItem 组件
- 5种类型渲染 + SourceBadge
- SourceBadge: "原始记录" 硬编码，不可点击，hover tooltip
- 验证: 5种类型视觉正确

### S5.T3 — Timeline 容器 + 虚拟滚动
- @tanstack/react-virtual + sticky year header
- Desktop 多列 / Mobile 单列
- 验证: 100条mock流畅滚动

### S5.T4 — TimelineFilters 组件
- 类型/标签/日期范围 → URL params
- 验证: 筛选生效

### S5.T5 — 时间线页面整合
- ProfileSummary + TimelineFilters + Timeline + TimelineEmpty
- 验证: 完整页面渲染

---

## Sprint 6: 素材详情 + 注释

### S6.T1 — PhotoViewer (缩放)
### S6.T2 — AudioPlayer (波形)
### S6.T3 — VideoPlayer
### S6.T4 — TextViewer (聊天气泡)

### S6.T5 — AnnotationEditor + SourceBadge
- SourceBadge 完整信息: "原始记录 · {上传者} · {日期}"
- 验证: 注释保存; badge 渲染; 权限控制

### S6.T6 — 素材详情页面
- 5种 viewer + 注释 + 元信息 + 标签编辑 + 上/下导航
- 验证: 各类型正确

### S6.T7 [V2] — SourceBadge 不可变性强化
- 文件: supabase/migrations/xxx_source_label_immutable.sql
- 验证: UPDATE source_label → 失败

---

## Sprint 7: 纪念日 + 微信导入

### S7.T1 — ReminderForm + ReminderList
- 农历支持 (lunar-javascript)
- 验证: CRUD + 农历转换

### S7.T2 [V2] — CeremonyBanner (纪念仪式横幅)
- 触发: reminder_date ±3天
- 随机记忆展示 + "点亮蜡烛" CSS 动画
- 可关闭: X按钮, session内不再显示
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

## Sprint 8: Landing Page + 设置 + 收尾

### S8.T1 — 设置页面
- 修改密码 + **数据导出(最显眼位置)** + 删除账号
- 验证: 各功能正常

### S8.T2 [V2] — 数据导出功能（增强版）
- **导出入口三处**: 设置页最醒目 + 档案编辑页 + Landing Page 隐私承诺文案
- 文件: app/api/export/[profileId]/route.ts, components/settings/ExportButton.tsx
- **[V2]** ZIP 内容结构:
  ```
  {逝者姓名}_的记忆_YYYY-MM-DD.zip
  ├── 照片/
  ├── 视频/
  ├── 语音/
  ├── 文字记录/
  ├── 扫描件/
  ├── metadata.json      # 档案+素材元数据+注释
  └── README.txt        # "这是你从忆锚导出的全部数据..."
  ```
- 验证: 导出10条混合素材 → ZIP完整可解压 → metadata.json正确

### S8.T3a [V2] — Landing Page Hero + 价值主张
- 文件: app/page.tsx, components/landing/HeroSection.tsx, components/landing/ValueProps.tsx
- 操作:
  1. Hero: 标题"永不丢失关于 TA 的真实记忆" + CTA按钮
  2. 三张价值主张卡片: 汇集 / 时间线 / 家人共建
- 验证: 页面渲染; 移动端排版; CTA跳转正确

### S8.T3b [V2] — Landing Page 创始人故事
- 文件: components/landing/FounderStory.tsx
- 操作: 创始人照片 + 故事文案（可展开/收起）
- 验证: 展开/收起动效; 移动端排版

### S8.T3c [V2] — Landing Page 隐私承诺
- 文件: components/landing/PrivacyPledge.tsx
- 操作: 四个承诺项（零合成/一键导出/一键删除/零广告零追踪）+ 链接到隐私政策
- 验证: 渲染正确; 隐私政策链接可点击

### S8.T3d [V2] — Landing Page Footer + SEO
- 文件: components/landing/Footer.tsx, app/layout.tsx (metadata)
- 操作:
  1. Footer: 品牌 + 链接 + 备案号预留位置
  2. SEO metadata (title, description, keywords, OpenGraph)
  3. public/og-image.jpg (1200x630px 温暖色调)
- 验证: 微信分享链接有正确预览; Lighthouse SEO > 90

### S8.T4 — 全局 Loading + Error 状态
- loading.tsx skeleton + error.tsx 温和提示

### S8.T5 — 响应式打磨 + 可访问性
- 375/768/1280 三断点逐页检查
- Lighthouse accessibility > 90

### S8.T6 — 部署到 Vercel
- 环境变量 + production Supabase + build 验证

### S8.T7 [V2] — 隐私政策 + 用户协议页面
- 文件: app/privacy/page.tsx, app/terms/page.tsx
- 操作: 静态页面，内容按 COMPLIANCE_CHINA.md 提纲
- 验证: 页面可访问; 链接可达

### S8.T8 [V2] — 敏感信息同意弹窗
- 文件: components/upload/PrivacyConsentDialog.tsx
- 首次上传弹出 → 同意后写入 localStorage + DB (privacy_consents)
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
| 1 | 6 | 认证+布局 |
| 2 | 7 | 档案 CRUD + 生命摘要 |
| **3** | **3** | **家庭协作（增长引擎）** |
| 4 | 6 | 记忆上传 |
| 5 | 5 | 时间线 |
| 6 | 7 | 素材详情+注释 |
| 7 | 5 | 纪念日+微信导入 |
| 8 | 10 | Landing Page + 导出 + 合规 + 收尾 |
| **总计** | **53** | |

## 执行指令

每个 Sprint 开始时在 Claude Code 中:

```
按照 docs/v2/TASKS.md 中 Sprint {N} 的任务列表顺序执行。
每个任务遵循 TDD: 先写测试 → 运行失败 → 实现代码 → 测试通过 → 重构。
完成一个任务后 commit: feat(scope): SX.TY - 描述
完成整个 Sprint 后运行 pnpm test --run 和 pnpm build 确认无回归。
```
