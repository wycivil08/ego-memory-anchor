# V2.1 UI/UX 最佳实践改进计划

> 基于 `ui-best-practice-A.md` 和 `ui-best-practice-B.md` 两份研究的综合结论

---

## 研究摘要

两份研究的核心结论**高度一致**：
1. 表单验证是最大短板，必须引入 react-hook-form + Zod
2. 媒体查看器（照片/视频/音频）应该用成熟库替换自建
3. 文件上传推荐使用 react-dropzone 或 Uppy
4. 虚拟滚动、EXIF、ZIP、UI组件库已是最佳实践，无需更换

---

## P0 优先级 - 立即修复

### 1. 表单验证 🔴 最紧急

**当前问题：** 无客户端即时校验，所有验证都在 server-side

**推荐方案：**
```bash
pnpm add react-hook-form @hookform/resolvers zod
```

**目标文件：**
- `app/(auth)/login/page.tsx`
- `app/(auth)/register/page.tsx`
- `app/(main)/profile/new/page.tsx`
- 组件: `components/profile/ProfileForm.tsx`

**Schema 示例：**
```typescript
// lib/schemas/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱'),
  password: z.string().min(1, '请输入密码'),
})

export const registerSchema = z.object({
  email: z.string().email('请输入有效的邮箱'),
  password: z.string()
    .min(8, '密码至少8位')
    .regex(/[a-zA-Z]/, '需包含字母')
    .regex(/[0-9]/, '需包含数字'),
  confirmPassword: z.string(),
  privacyConsent: z.literal(true, {
    errorMap: () => ({ message: '请同意隐私政策' })
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次密码不一致',
  path: ['confirmPassword'],
})
```

**实施检查清单：**
- [ ] 安装依赖
- [ ] 创建 `lib/schemas/` 目录和 auth schema
- [ ] 重构 Login 页面使用 react-hook-form + Zod
- [ ] 重构 Register 页面使用 react-hook-form + Zod
- [ ] 重构 ProfileForm 使用 react-hook-form + Zod
- [ ] 运行测试验证

---

### 2. 登录/注册模块 🔴

**当前状态：** Supabase Auth + 自建表单

**两个选择：**

| 方案 | 说明 | 工作量 |
|-----|------|-------|
| **方案A: 保持 Supabase + RHF** | 用 react-hook-form 重构现有表单 | 1-2天 |
| **方案B: Clerk 迁移** | 迁移到 Clerk Auth | 3-5天 |

**推荐：方案A（MVP阶段）**
- 保持 Supabase Auth 不变
- 表单层用 react-hook-form + Zod 重构
- 获得即时验证、友好错误提示

**方案B 考虑因素：**
- Clerk 提供: 预建 UI、MFA、社交登录、用户管理
- 适合场景: MVP后、用户量上来后、需要完整 Auth UI

---

### 3. 媒体查看器 🔴

#### 3.1 图片查看器 → react-photo-view
```bash
pnpm add react-photo-view
```

#### 3.2 视频播放器 → react-player
```bash
pnpm add react-player
```

#### 3.3 音频播放器 → wavesurfer.js
```bash
pnpm add wavesurfer.js @wavesurfer/react
```

**目标文件：**
- `components/memory/PhotoViewer.tsx`
- `components/memory/VideoPlayer.tsx`
- `components/memory/AudioPlayer.tsx`

---

## P1 优先级 - 短期优化

### 4. 文件上传 🟡

**当前状态：** 自建 UploadZone（功能完整，但可优化）

**推荐方案：**

| 方案 | 说明 | 推荐度 |
|-----|------|-------|
| **react-dropzone** | 轻量，只解决拖拽 UI | ⭐⭐⭐⭐⭐ |
| **Uppy** | 功能全：分片、断点续传、摄像头 | ⭐⭐⭐⭐ |

**推荐 react-dropzone（保持 Supabase Storage）：**
```bash
pnpm add react-dropzone
```

**理由：**
- 轻量级（约 10KB）
- 不绑定存储后端
- 与 Supabase Storage 完美配合
- 社区成熟

**注意：** 如果大文件（500MB+）上传是核心场景，考虑 Uppy + Tus 协议实现断点续传。

---

### 5. Toast 通知 🟡

**当前状态：** 可能自建或无统一方案

**推荐：Sonner（shadcn/ui 内置）**
```bash
npx shadcn@latest add sonner
```

**优点：**
- shadcn/ui 官方推荐
- 动画流畅、堆叠、dismissible 全支持
- 体积小 (~5KB)
- 中文支持好

---

### 6. 侧边栏组件 🟡

**当前状态：** 自建 Sidebar

**推荐：shadcn/ui Sidebar**
```bash
npx shadcn@latest add sidebar
```

**优点：**
- 响应式折叠
- 移动端 drawer 适配
- 键盘导航支持

---

## P2 优先级 - 可选优化

### 7. 日期选择器

**当前状态：** 自建 DatePicker + 原生 input

**推荐：** 在 shadcn Calendar 基础上封装精度选择

```bash
npx shadcn@latest add calendar popover
```

---

### 8. PDF 预览

**当前状态：** 自建 DocumentViewer

**推荐：** react-pdf
```bash
pnpm add react-pdf
```

---

### 9. 客户端图片压缩

**当前状态：** 服务端缩略图生成

**推荐补充：** browser-image-compression（上传前压缩）
```bash
pnpm add browser-image-compression
```

---

## 已是最佳实践 - 无需修改

| 模块 | 当前方案 | 评价 |
|-----|---------|------|
| 虚拟滚动 | @tanstack/react-virtual | ✅ 业界最佳 |
| EXIF 提取 | exifr | ✅ 最轻量最快 |
| ZIP 导出 | jszip | ✅ 标准方案 |
| 农历支持 | lunar-javascript | ✅ 中文生态最好 |
| UI组件库 | shadcn/ui | ✅ Next.js 生态第一 |
| CSS框架 | Tailwind CSS 4 | ✅ 无争议 |
| 部署 | Vercel | ✅ Next.js 最优 |
| 数据库+存储 | Supabase | ✅ 适合MVP |
| 测试 | Vitest + Playwright | ✅ 最佳组合 |

---

## 实施路线图

### Phase 1: 表单验证（1-2天）
```
Day 1:
- 安装 react-hook-form + zod + @hookform/resolvers
- 创建 lib/schemas/auth.ts
- 重构 Login 页面
- 重构 Register 页面

Day 2:
- 重构 ProfileForm
- 测试所有表单
- 验证无 regression
```

### Phase 2: 媒体查看器（1-2天）
```
- 安装 react-photo-view + react-player + wavesurfer.js
- 替换 PhotoViewer
- 替换 VideoPlayer
- 替换 AudioPlayer
```

### Phase 3: 基础设施（0.5-1天）
```
- 安装 react-dropzone
- 安装 Sonner
- 评估 Sidebar 组件
```

---

## 验证方法

### 功能验证
```bash
pnpm test --run          # 全部测试通过
pnpm build               # 构建成功
```

### UI 验证清单
- [ ] 登录：空表单提交 → 显示即时错误
- [ ] 登录：无效邮箱 → 离开字段时显示错误
- [ ] 注册：密码不匹配 → 显示错误
- [ ] 注册：未勾选隐私 → 按钮禁用
- [ ] 上传：拖拽文件 → 正确识别类型
- [ ] 上传：大文件 → 显示进度
- [ ] 图片：点击 → 全屏查看
- [ ] 音频：播放 → 显示波形
- [ ] Toast：操作后 → 显示通知

---

## 总结

| 优先级 | 模块 | 当前 | 目标 | 工作量 |
|-------|-----|------|------|-------|
| 🔴 P0 | 表单验证 | useActionState | react-hook-form + Zod | 2天 |
| 🔴 P0 | 登录/注册 | 自建表单 | RHF 重构 | 1天 |
| 🔴 P0 | 图片查看器 | 自建 | react-photo-view | 0.5天 |
| 🔴 P0 | 音频播放器 | 自建 | wavesurfer.js | 1天 |
| 🟡 P1 | 文件上传 | 自建 | react-dropzone | 0.5天 |
| 🟡 P1 | 视频播放器 | 自建 | react-player | 0.5天 |
| 🟡 P1 | Toast | 不统一 | Sonner | 0.5天 |

**核心行动项：**
1. `pnpm add react-hook-form @hookform/resolvers zod`
2. 重构所有表单
3. 替换媒体查看器

---

*生成时间: 2026-04-16*
*基于: ui-best-practice-A.md + ui-best-practice-B.md*
