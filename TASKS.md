# TASKS.md — ego-memory-anchor MVP 开发任务

格式说明:
- ID: S{sprint}.T{task}
- 依赖: 必须先完成的任务 ID
- 文件: 主要涉及的文件路径
- 验证: 如何确认完成

---

## Sprint 0: 项目骨架初始化

### S0.T1 — 初始化 Next.js 项目
- 依赖: 无
- 文件: 项目根目录
- 操作:
  1. `pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"`
  2. 初始化 Git（如果尚未初始化）：`git init`，初始 commit
  3. 确保 .gitignore 包含 .env.local, .next, node_modules
- 验证: `pnpm dev` 启动无报错，能看到默认 Next.js 页面

### S0.T2 — 安装核心依赖
- 依赖: S0.T1
- 文件: package.json
- 操作:
  1. `pnpm add @supabase/supabase-js @supabase/ssr`
  2. `pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event`
  3. `pnpm add exifr jszip archiver` (EXIF 提取、ZIP 处理、文件压缩)
  4. `pnpm add @tanstack/react-virtual` (时间线虚拟滚动)
  5. `pnpm add lunar-javascript` (农历转换)
- 验证: `pnpm install` 成功，package.json 包含所有依赖

### S0.T3 — 配置测试环境
- 依赖: S0.T1
- 文件: vitest.config.ts, tests/setup.ts
- 操作:
  1. 创建 vitest.config.ts，配置 @testing-library/jest-dom
  2. 创建 tests/setup.ts 配置 React Testing Library
  3. 创建 tests/unit/.gitkeep 和 tests/e2e/.gitkeep
  4. 创建测试示例 tests/unit/example.test.ts 确认环境正常
- 验证: `pnpm test` 可运行且测试通过

### S0.T4 — 配置 Supabase 环境
- 依赖: S0.T1
- 文件: .env.local.example, supabase/migrations/001_initial_schema.sql
- 操作:
  1. 创建 .env.local.example:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```
  2. 创建 supabase/migrations/001_initial_schema.sql，包含完整 Schema（profiles, memories, family_members, reminders 表）
  3. 包含所有 RLS 策略和 Storage bucket 定义
- 验证: SQL 文件语法正确，migration 文件可被 supabase CLI 读取

---

## Sprint 1: 项目基础 + 认证

### S1.T1 — shadcn/ui 初始化 + 基础组件
- 依赖: S0.T1
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
- 依赖: S1.T4, S1.T1
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
- 依赖: S1.T6, S1.T1
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
- 依赖: S1.T1
- 文件: components/profile/ProfileForm.tsx
- 操作:
  1. 表单字段: 姓名(必填), 头像上传, 关系(下拉选择), 物种(人/宠物), 生日, 去世日期, 一句话描述
  2. 关系选项: 父亲/母亲/爷爷/奶奶/外公/外婆/配偶/子女/兄弟姐妹/朋友/同事/宠物-猫/宠物-狗/宠物-其他/其他
  3. 选择"宠物"类关系时 species 自动设为 'pet'
  4. 头像上传: 预览 + 上传到 avatars bucket
  5. 日期选择器: 支持"不确定"选项
- 验证: 组件渲染测试; 表单校验测试 (姓名为空, 日期矛盾)

### S2.T2 — 创建档案页面
- 依赖: S2.T1, S1.T3
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
- 依赖: S1.T1
- 文件: components/upload/UploadZone.tsx
- 操作:
  1. 拖拽区域 + 点击选择文件
  2. 支持多文件
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
  3. extractExifData(file: File): Promise<Record<string, unknown>> — 提取完整 EXIF
  4. 支持 JPEG, PNG, HEIC
  5. 静默处理无 EXIF 的文件 (返回 null)
- 验证: 单元测试: 有 EXIF 的照片 → 提取日期; 无 EXIF 的文件 → null

### S3.T3 — 缩略图生成工具
- 依赖: S1.T1
- 文件: lib/utils/thumbnail.ts
- 操作:
  1. generateThumbnail(file: File, maxSize: 400): Promise<Blob | null>
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
     c. 上传原文件到 Storage
     d. 上传缩略图到 Storage
     e. INSERT memories 表
  3. 并发上传: 最多 3 个文件同时上传
  4. 上传完成后可继续上传更多, 或跳转时间线
- 验证: 上传 1 张照片 → Storage 有文件 + DB 有记录; 批量上传 5 个混合文件 → 全部成功

### S3.T6 — DatePicker 组件
- 依赖: S1.T1
- 文件: components/upload/DatePicker.tsx
- 操作:
  1. 日期输入组件，支持手动选择日期
  2. 支持精度选择: 精确到日 / 只知道月 / 只知道年 / 不确定
  3. "不确定"时返回 null，memory_date_precision = 'unknown'
  4. 批量模式: 可对多个无日期文件统一指定日期
  5. 嵌入 UploadPage 的文件列表中，每个文件可单独指定日期
- 验证: 组件测试: 各精度选项正确; 不确定选项返回正确值

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
- 依赖: S1.T1
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
  5. Desktop: 多列瀑布流; Mobile: 单列
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
- 依赖: S1.T1
- 文件: components/memory/PhotoViewer.tsx
- 操作:
  1. 全屏照片查看
  2. 手势: 双指缩放 (mobile), 滚轮缩放 (desktop)
  3. 加载 Skeleton + 渐进式显示
  4. EXIF 信息展示 (可展开: 拍摄时间, 设备)
- 验证: 照片正确显示; 缩放流畅

### S5.T2 — AudioPlayer 组件
- 依赖: S1.T1
- 文件: components/memory/AudioPlayer.tsx
- 操作:
  1. 自定义音频播放器 (不用浏览器默认)
  2. 播放/暂停/进度条/时长显示
  3. 波形可视化 (Web Audio API + canvas)
  4. 风格: 温暖色调, 与整体设计统一
- 验证: 音频播放正常; 波形渲染; 进度拖拽

### S5.T3 — VideoPlayer 组件
- 依赖: S1.T1
- 文件: components/memory/VideoPlayer.tsx
- 操作:
  1. HTML5 video + 自定义控件
  2. 播放/暂停/进度/音量/全屏
  3. 加载时显示缩略图
- 验证: 视频播放正常; 全屏可用

### S5.T4 — TextViewer 组件
- 依赖: S1.T1
- 文件: components/memory/TextViewer.tsx
- 操作:
  1. 聊天记录格式: 消息气泡样式 (逝者的消息在左, 用户的在右)
  2. 普通文字: 段落展示
  3. 日期/时间标记
  4. 长文本折叠 + "展开全部"
- 验证: 聊天格式渲染正确; 长文本折叠生效

### S5.T5 — AnnotationEditor + SourceBadge
- 依赖: S1.T1
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
- 依赖: S1.T1, S1.T4
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
- 依赖: S1.T1, S1.T4
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
  1. `pnpm add jszip`
  2. parseWechatExport(txtContent: string, targetName: string): ParsedMessage[]
  3. ParsedMessage: { date, sender, type ('text'|'image'|'audio'|'video'), content, mediaFilename? }
  4. 解析逻辑:
     - 按行读取 txt
     - 正则匹配日期时间行: `\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]`
     - 识别 [图片] [语音] [视频] 标记
     - 普通行视为文字消息
  5. 只保留 sender === targetName 的消息
  6. 错误处理: 格式异常行跳过 + 计数
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
  3. 生成 metadata.json: profile 信息 + memories 元数据 + 注释
  4. 从 Storage 读取所有文件
  5. 打包 ZIP 返回 (使用 archiver 或 JSZip)
  6. 前端显示下载进度 (文件可能很大)
- 验证: 导出 ZIP → 解压后文件完整 + metadata.json 正确

### S8.T3 — 首页 (Landing Page)
- 依赖: S1.T1
- 文件: app/page.tsx
- 操作:
  1. 未登录: Landing page
     - Hero: "永不丢失关于 TA 的真实记忆" + 简短描述
     - 三个价值点: 汇集 / 时间线 / 家人共建
     - CTA: "开始守护记忆" → /register
  2. 已登录: redirect to /dashboard
  3. 设计: 安静、温暖, 不使用"AI""数字永生"等词汇
- 验证: 未登录看到 landing; 已登录跳转 dashboard

### S8.T4 — 全局 Loading + Error 状态
- 依赖: S1.T1
- 文件: app/(main)/loading.tsx, app/(main)/error.tsx, components/common/*.tsx
- 操作:
  1. loading.tsx: Skeleton 占位符 (不是简单 spinner)
  2. error.tsx: 温和的错误提示 + 重试按钮
  3. 通用组件: EmptyState, LoadingSpinner, ConfirmDialog
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
- 验证: `pnpm build` 成功; Vercel 部署成功; 线上可访问

---

## 任务总览

| Sprint | 任务数 | 核心产出 |
|--------|--------|---------|
| Sprint 1 | 8 | 项目骨架 + 认证 + 布局 |
| Sprint 2 | 4 | 逝者档案 CRUD |
| Sprint 3 | 5 | 媒体上传全流程 |
| Sprint 4 | 5 | 时间线视图 (核心) |
| Sprint 5 | 6 | 素材详情 + 注释 |
| Sprint 6 | 3 | 家庭协作 |
| Sprint 7 | 4 | 纪念日 + 微信导入 |
| Sprint 8 | 6 | 设置 + 导出 + 首页 + 打磨 |
| **总计** | **41** | |

## 执行指令

每个 Sprint 开始时，在 Claude Code 中执行:

按照 TASKS.md 中 Sprint X 的任务列表顺序执行。
每个任务遵循 TDD: 先写测试 → 运行失败 → 实现代码 → 测试通过 → 重构。
完成一个任务后 commit，message 格式: `feat(scope): S.T - 简短描述`。
完成整个 Sprint 后，运行全部测试确认无回归。

## Sprint QA 步骤 (每个 Sprint 末尾执行)

完成一个 Sprint 后，必须执行以下 QA 步骤再 commit:

```
### Sprint-N QA Checklist
1. $ pnpm test --run          # 全部单元测试通过
2. $ pnpm test:e2e             # E2E 测试通过 (Playwright 已配置后)
3. $ pnpm build                # 生产构建成功
4. git commit "chore(sprint-n): complete sprint n QA"
```

### 工具函数测试优先级 (必须 TDD)

| 优先级 | 文件 | 测试用例数 | 何时完成 |
|--------|------|----------|---------|
| P0 | lib/utils/wechat-parser.ts | 8+ | Sprint 7 前 |
| P0 | lib/utils/exif.ts | 4+ | Sprint 3 前 |
| P0 | lib/utils/thumbnail.ts | 3+ | Sprint 3 前 |
| P1 | lib/utils/date.ts | 4+ | Sprint 7 前 |
| P1 | lib/utils/file.ts | 3+ | Sprint 3 前 |

### E2E 测试 Fixtures (Sprint 1 末尾前创建)

```
tests/fixtures/
├── sample-photo.jpg    # 真实照片，无隐私，< 5MB
├── sample-video.mp4     # 测试视频，< 5MB
├── sample-audio.m4a    # 测试音频，< 1MB
└── wechat-export-sample.txt  # 符合微信导出格式的 mock 数据
```

### Playwright 截图基准 (Sprint 4 末尾前配置)

```typescript
// tests/e2e/visual-screenshots.spec.ts
const keyPages = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'dashboard-empty', path: '/dashboard' },
  { name: 'timeline', path: '/profile/test-id' },
  { name: 'upload', path: '/profile/test-id/upload' },
];

for (const page of keyPages) {
  test(`screenshot: ${page.name}`, async ({ page: p }) => {
    await p.goto(page.path);
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.screenshot({ path: `screenshots/${page.name}-desktop.png`, fullPage: true });
    await p.setViewportSize({ width: 375, height: 812 });
    await p.screenshot({ path: `screenshots/${page.name}-mobile.png`, fullPage: true });
  });
}
```

### axe-core 无障碍测试 (E2E 测试必须包含)

每个 E2E spec 文件的每个 test 中:
```typescript
const accessibilityResults = await new AxeBuilder({ page }).analyze();
expect(accessibilityResults.violations).toEqual([]);
```

### Server Action 测试清单

| Sprint | Server Action | 测试场景 |
|--------|-------------|---------|
| Sprint 1 | createProfile | 正常/字段校验/未登录 |
| Sprint 2 | createMemory | 正常/RLS/批量 |
| Sprint 3 | createAnnotation | 正常/权限 |
| Sprint 6 | createInvitation | 生成/角色 |
| Sprint 6 | acceptInvitation | 有效/过期/已使用 |

## E2E 核心流程 (5 条必须覆盖)

```typescript
// tests/e2e/core-flows.spec.ts

test('1. 注册 → 登录 → 登出', async ({ page }) => { ... });
test('2. 创建档案 → 上传照片 → 时间线显示', async ({ page }) => { ... });
test('3. 添加注释 → 验证持久化', async ({ page }) => { ... });
test('4. 邀请家人 → 接受邀请 → 共同编辑', async ({ page }) => { ... });
test('5. 未登录访问 → 重定向', async ({ page }) => { ... });
```

