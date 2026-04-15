# Storage Design — Supabase Storage 架构设计

> 本文档定义忆锚项目的 Supabase Storage 设计规范，确保图片/媒体文件的正确存储、访问控制和 URL 构造。

## 1. 背景问题

### 本次 Bug 修复发现的问题

| 问题 | 原因 | 修复 |
|------|------|------|
| 图片显示 404 | `TimelineItem` 构造 URL 缺少 bucket 名称 `memories/` | 添加 bucket 前缀 |
| SELECT 策略失效 | `storage.foldername(profiles.name)` 错误 | 改为 `storage.foldername(objects.name)` |
| 私有 bucket 无法访问 | 私有 bucket 使用 public URL 格式无效 | 改为 public bucket 或使用 signed URL |

### 根本原因

Supabase Storage 有两种访问模式：

```
┌─────────────────────────────────────────────────────────────────┐
│  Public Bucket                                                   │
│  URL: /storage/v1/object/public/{bucket}/{path}                │
│  任何知道 URL 的人都可以访问（但 RLS 控制谁能 INSERT/DELETE）     │
│  SELECT 策略决定谁能"看到"文件，但不影响下载                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  Private Bucket                                                  │
│  URL: /storage/v1/object/sign/{bucket}/{path}  (signed URL)     │
│  必须使用 signed URL 才能访问，signed URL 由服务端生成             │
│  CDN 缓存效果差（因为 URL 每次不同）                              │
└─────────────────────────────────────────────────────────────────┘
```

## 2. 推荐架构

### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **Public Bucket + RLS** | 简单、CDN 可缓存 | 文件路径暴露（但 UUID 难以猜测） | 社交媒体、公开内容 |
| Private Bucket + Signed URL | 安全、临时访问控制 | 每次需生成 URL、无法 CDN 缓存 | 私密文件、付费内容 |
| Private Bucket + Server Proxy | 完全控制、可缓存 | 增加服务器负载 | 敏感文件、需要审计 |

### 忆锚的推荐方案

**忆锚场景**：记忆照片是私人内容，但：
- 用户明确分享意图（邀请家人查看）
- 需要良好的加载体验（CDN 缓存）

**推荐：Public Bucket + RLS 严格控制**

```
理由：
1. 记忆照片虽然私密，但文件路径是 UUID，无法猜测
2. RLS 已控制谁能上传/删除文件
3. Public URL 可 CDN 缓存，加载体验好
4. 避免 signed URL 的性能开销
```

## 3. Bucket 结构

### 3.1 Buckets

| Bucket | Public | 用途 | 文件大小限制 |
|--------|--------|------|-------------|
| `memories` | ✅ true | 用户上传的记忆文件（照片、视频、音频） | 500MB |
| `avatars` | ✅ true | 用户头像 | 5MB |

### 3.2 路径结构

```
memories/
└── {profile_id}/              # 按档案隔离
    └── {memory_id}/           # 按记忆 ID 隔离
        └── {uuid}.{ext}      # UUID 文件名，避免特殊字符问题

avatars/
└── {user_id}                  # 按用户 ID 隔离
    └── avatar.{ext}
```

**关键原则：UUID 文件名**
- 上传时将原文件名重命名为 UUID
- 原始文件名保存在数据库 `memories.file_name`
- 避免文件系统特殊字符问题

## 4. URL 模式

### 4.1 Public URL（当前使用）

```typescript
// ✅ 正确格式
const url = `${SUPABASE_URL}/storage/v1/object/public/memories/${file_path}`

// ❌ 错误格式（缺少 bucket 名称）
const url = `${SUPABASE_URL}/storage/v1/object/public/${file_path}`
```

### 4.2 Signed URL（如需私有访问）

```typescript
import { createClient } from '@supabase/supabase-js'

async function getSignedUrl(bucket: string, path: string): Promise<string> {
  const supabase = await createClient(url, anonKey)
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 3600) // 1小时后过期
  return data.signedUrl
}
```

## 5. RLS 策略（关键！）

### 5.1 核心原则

```
Supabase Storage RLS 策略有两个阶段：
1. WITH CHECK (INSERT/UPDATE/DELETE) - 控制谁能写入
2. USING (SELECT) - 控制谁能"看到"文件列表

⚠️ 重要：Public bucket 的 SELECT 策略不影响文件下载！
        即使 SELECT 策略阻止某用户查询文件，
        如果该用户知道 URL，仍然可以下载（因为是 public bucket）
```

### 5.2 正确的 RLS 模式

#### INSERT 策略（上传）

```sql
CREATE POLICY "Users can upload memories" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'memories'
  AND (
    -- 用户必须是档案 owner
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (storage.foldername(objects.name))[1]::uuid
      AND profiles.user_id = auth.uid()
    )
    -- 或者用户是家庭成员（有编辑权限）
    OR EXISTS (
      SELECT 1 FROM family_members fm
      JOIN profiles p ON p.id = fm.profile_id
      WHERE p.id = (storage.foldername(objects.name))[1]::uuid
      AND fm.user_id = auth.uid()
      AND fm.accepted_at IS NOT NULL
      AND fm.role IN ('admin', 'editor')
    )
  )
);
```

**❌ 错误模式（曾使用）**
```sql
-- 错误：使用 profiles.name 而不是 objects.name
(storage.foldername(profiles.name))[1]::uuid
```

**✅ 正确模式**
```sql
-- 正确：从 storage path 提取 profile_id
(storage.foldername(objects.name))[1]::uuid
```

#### SELECT 策略（查看文件列表）

```sql
CREATE POLICY "Users can view memories" ON storage.objects FOR SELECT
USING (
  bucket_id = 'memories'
  AND (
    -- 用户是档案 owner
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (storage.foldername(objects.name))[1]::uuid
      AND profiles.user_id = auth.uid()
    )
    -- 或者用户是家庭成员
    OR EXISTS (
      SELECT 1 FROM family_members fm
      JOIN profiles p ON p.id = fm.profile_id
      WHERE p.id = (storage.foldername(objects.name))[1]::uuid
      AND fm.user_id = auth.uid()
      AND fm.accepted_at IS NOT NULL
    )
  )
);
```

#### DELETE 策略（删除）

```sql
CREATE POLICY "Users can delete memories" ON storage.objects FOR DELETE
USING (
  bucket_id = 'memories'
  AND (
    -- 用户是档案 owner
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (storage.foldername(objects.name))[1]::uuid
      AND profiles.user_id = auth.uid()
    )
    -- 或者用户是家庭成员（有编辑权限）
    OR EXISTS (
      SELECT 1 FROM family_members fm
      JOIN profiles p ON p.id = fm.profile_id
      WHERE p.id = (storage.foldername(objects.name))[1]::uuid
      AND fm.user_id = auth.uid()
      AND fm.accepted_at IS NOT NULL
      AND fm.role IN ('admin', 'editor')
    )
  )
);
```

## 6. 文件名处理

### 6.1 上传时重命名

```typescript
// ✅ 推荐：UUID 文件名
const storagePath = `${profileId}/${memoryId}/${crypto.randomUUID()}.${ext}`

// 数据库保存原始文件名
await supabase.from('memories').insert({
  file_path: storagePath,      // UUID 文件名
  file_name: originalFile.name // 原始文件名
})
```

### 6.2 sanitizeFilename（备用）

如果确实需要保留原文件名：

```typescript
function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')  // 白名单：只允许字母数字点横下划线
    .replace(/_+/g, '_')               // 合并多个下划线
    .replace(/^_+/, '')                // 移除开头下划线
    .replace(/_+$/, '')                // 移除结尾下划线
    .replace(/\.+/g, '.')              // 合并多个点
    .substring(0, 200)                 // 长度限制
}
```

## 7. 前端组件规范

### 7.1 获取图片 URL

**在 Server Components 中：**

```typescript
// lib/utils/storage.ts
export function getMemoryPublicUrl(filePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL not set')
  return `${supabaseUrl}/storage/v1/object/public/memories/${filePath}`
}
```

**在 Client Components 中（需要认证）：**

```typescript
// 使用 getSignedUrl 动态获取
async function getImageUrl(filePath: string): Promise<string> {
  const supabase = createBrowserClient(...)
  const { data } = await supabase.storage
    .from('memories')
    .createSignedUrl(filePath, 3600)
  return data.signedUrl
}
```

### 7.2 TimelineItem 示例

```typescript
function MediaPreview({ memory }: { memory: Memory }) {
  // ✅ 正确：包含 bucket 名称
  const imageUrl = memory.file_path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/memories/${memory.file_path}`
    : null

  if (!imageUrl) return <Placeholder />

  return <img src={imageUrl} alt={memory.file_name || '照片'} />
}
```

## 8. 数据库 Schema 关联

### 8.1 memories 表

```sql
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  contributor_id UUID NOT NULL REFERENCES auth.users(id),
  type memory_type NOT NULL,
  file_path TEXT,           -- Storage 路径，如 profile_id/memory_id/uuid.jpg
  file_name TEXT,           -- 原始文件名（用户可见）
  file_size BIGINT,
  mime_type TEXT,
  thumbnail_path TEXT,       -- 缩略图路径（可选）
  -- ... 其他字段
);
```

### 8.2 索引

```sql
CREATE INDEX idx_memories_profile_id ON memories(profile_id);
CREATE INDEX idx_memories_contributor_id ON memories(contributor_id);
```

## 9. 测试验证

### 9.1 Storage 策略测试

```bash
# 测试上传（需要认证）
node scripts/test-upload.mjs <profile_id> --user seed1@test.com --sanitized

# 测试服务角色（绕过 RLS）
node scripts/test-upload.mjs <profile_id> --service-role --sanitized
```

### 9.2 URL 验证

```bash
# 验证 public URL 格式
curl -I "https://{project}.supabase.co/storage/v1/object/public/memories/{path}"

# 期望：HTTP/2 200 + content-type: image/*
```

## 10. 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `400 Invalid key` | 文件名包含特殊字符 | 使用 UUID 文件名或 sanitizeFilename |
| `new row violates row-level security policy` | RLS INSERT 策略未正确配置 | 检查 WITH CHECK 条件 |
| `signature verification failed` | 使用 ANON key 访问 private bucket | 使用 signed URL 或 public bucket |
| `Bucket not found` | URL 缺少 bucket 名称 | 添加 bucket 前缀 |

## 11. 迁移检查清单

如果需要重新创建存储策略：

- [ ] 确认 `storage.objects.name` 格式是 `profile_id/memory_id/filename.ext`
- [ ] 使用 `(storage.foldername(objects.name))[1]::uuid` 提取 profile_id
- [ ] 不要使用 `profiles.name` 或 `profiles.id` 直接比较
- [ ] 测试 INSERT/SELECT/DELETE 三种操作
- [ ] 验证 public URL 可以访问文件
