# CHANGELOG.md — V1 → V2 变更记录

## 优先级重排

### Sprint 顺序变更（最重要）

| Sprint | V1 内容 | V2 内容 | 变化 |
|--------|---------|---------|------|
| S0 | 项目骨架 | 项目骨架 | 不变 |
| S1 | 认证+布局 | 认证+布局 | 注册页增加隐私 checkbox |
| S2 | 档案 CRUD | 档案 CRUD | +封面照片; Dashboard 增强 |
| **S3** | 记忆上传 | **家庭协作** | ⬆️ **从 S6 前移** |
| S4 | 时间线 | 记忆上传 | 后移一位 |
| S5 | 素材详情+注释 | 时间线 | 后移一位 |
| S6 | 家庭协作 | 素材详情+注释 | 后移一位 |
| S7 | 纪念日+微信导入 | 纪念日+微信导入 | 不变 |
| S8 | 设置+导出+Landing+收尾 | Landing + 导出 + 合规 + 收尾 | Landing 拆为4子任务 |

### 理由

- 家庭协作是核心增长引擎，不是"锦上添花"
- 数据导出是信任基石，必须在 Landing Page 承诺之前完成
- Landing Page 隐私承诺必须功能存在才能写

---

## TASKS.md 变更

### 新增任务 (9个)

| Task ID | 内容 | Sprint |
|---------|------|--------|
| S2.T5 | 档案封面照片选择 | S2 |
| S3.T1 | InviteDialog（增强版：微信友好+Open Graph预览） | S3 |
| S3.T2 | 接受邀请页面 | S3 |
| S3.T3 | MemberList + 家庭管理页面 | S3 |
| S8.T2v2 | 数据导出（增强版：入口三处+ZIP结构+metadata.json） | S8 |
| S8.T3a | Landing Page Hero + 价值主张 | S8 |
| S8.T3b | Landing Page 创始人故事 | S8 |
| S8.T3c | Landing Page 隐私承诺 | S8 |
| S8.T3d | Landing Page Footer + SEO | S8 |
| S8.T7 | 隐私政策 + 用户协议页面 | S8 |

### 修改任务 (3个)

| Task ID | 变更内容 |
|---------|---------|
| S2.T3 | Dashboard 增强：素材数量统计、家人数量、一句话描述、纪念日横幅 |
| S1.T6/T7 | 注册/登录页增强：隐私政策checkbox、一句话承诺 |
| S5.T5 | SourceBadge 强化：不可变设计、tooltip、位置规范 |

### 总任务数

**V1: 41 tasks → V2: 53 tasks**

---

## CLAUDE.md 变更

### 项目结构新增

```
components/landing/              # Landing Page 组件（新增）
app/privacy/page.tsx             # 隐私政策页（新增）
app/terms/page.tsx               # 用户协议页（新增）
docs/v2/                         # V2 文档集（新增）
```

### 安全红线新增

- 绝不将 memories 表的 source_label 设为可修改
- 注册流程必须包含隐私政策同意 checkbox
- 数据导出入口必须在设置页最醒目位置

### Storage 规则更新

- memories bucket 设为 public（UUID 路径不可猜测）
- avatars bucket 设为 public

---

## DESIGN.md 变更

### 数据模型

| 表 | 变更 |
|----|------|
| profiles | 新增 `cover_photo_path` 字段 |
| memories | `source_label` 不可变 trigger（新增） |
| privacy_consents | 新增表（V2） |

### RLS 策略新增

- family_members: 成员可见自己的记录
- privacy_consents: 用户可见自己的同意记录

### 页面结构新增

| 路由 | 类型 | 说明 |
|------|------|------|
| `/privacy` | Server (静态) | 隐私政策 |
| `/terms` | Server (静态) | 用户协议 |
| `/invite/[token]` | Server | 邀请页需动态 OG 元数据 |

### 组件树新增

```
components/landing/
├── HeroSection.tsx
├── ValueProps.tsx
├── FounderStory.tsx
├── PrivacyPledge.tsx
├── CTABanner.tsx
└── Footer.tsx

components/settings/ExportButton.tsx  # 导出按钮通用组件
```

### ProfileCard 接口变更

```typescript
interface ProfileCardProps {
  profile: Profile & {
    memoryCounts: { photo: number; video: number; audio: number; text: number; document: number }
    familyMemberCount: number
  }
}
```

---

## PRODUCT_SPEC.md 变更（V2 差异化补充）

### P0 优先级提升

| 功能 | V1 | V2 |
|------|-----|-----|
| 家庭邀请+协作 | P1 | **P0** |
| 数据导出 | P1 | **P0** |
| Landing Page 隐私承诺 | 未列入 | **P0** |

### 新增用户故事

- US-12: 潜在用户看到"不做 AI 合成"承诺才愿注册
- US-13: 用户随时看到"原始记录"标记确认内容未被篡改

---

## 技术规格变更

### Landing Page SEO

所有页面必须实现：
- title: "忆锚 — 永不丢失关于 TA 的真实记忆"
- description meta
- Open Graph tags
- JSON-LD structured data（可选）

### 邀请链接格式

微信友好：URL 不超过 100 字符，附带可复制的邀请文案模板

### 导出 ZIP 结构

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

---

## Bug Fixes

### Storage Bucket 配置修复

**问题：** `supabase/migrations/001_initial_schema.sql` 中 buckets 设置为 `public: false`，但代码中所有地方都在构造 `public/` URL。

**影响：** 上传成功，但图片预览失败（bucket 私有时 public URL 无效）。

**修复：** 将 buckets 设为 `public: true`：
```sql
VALUES
  ('avatars', 'avatars', true, 5242880, ...),
  ('memories', 'memories', true, 524288000, ...)
```

**安全说明：** v2 设计中 UUID 路径作为"模糊安全"（security through obscurity），真正的安全边界是 Supabase RLS 策略。Bucket public 不意味着数据完全开放——RLS 仍然限制用户只能访问授权的档案。

### Server Action 测试架构修复

**问题：** V1 实现的 Server Action 测试大量使用 `vi.mock()` mock 了 Supabase client，违反 CLAUDE.md 中"禁止 mock Supabase client"规则。

**影响：** 162 个"通过"的测试实际上没有测试任何真实的数据库操作。

**修复：** 改为使用真实 Supabase client + UUID + afterAll 清理策略。

**涉及文件需改造（6个文件使用 vi.mock）：**
| 文件 | 类型 | 改造方式 |
|------|------|---------|
| `tests/unit/lib/actions/memory.test.ts` | Server Action | 改用真实 Supabase + UUID cleanup |
| `tests/unit/lib/actions/family.test.ts` | Server Action | 改用真实 Supabase + UUID cleanup |
| `tests/unit/lib/actions/reminder.test.ts` | Server Action | 改用真实 Supabase + UUID cleanup |
| `tests/unit/lib/actions/auth.test.ts` | Server Action | 改用真实 Supabase + UUID cleanup |
| `tests/unit/lib/utils/storage.test.ts` | 工具函数 | 可保留 mock（测试 URL 构造，不调用 Supabase） |
| `tests/unit/lib/supabase/middleware.test.ts` | Middleware | 可保留 mock（Edge Runtime 无法连接本地 Supabase） |

**说明：** `storage.test.ts` 和 `middleware.test.ts` 的 mock 是合理的——前者测试 URL 构造逻辑，后者运行在 Edge Runtime 上下文。主要改造对象是 4 个 Server Action 测试文件。
