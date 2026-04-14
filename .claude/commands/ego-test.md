---
name: ego-test
description: ego-memory-anchor 项目测试验证技能。基于 CLAUDE.md 定义的最新测试标准，运行测试、分析失败、执行 TDD 红绿环。
argument-hint: [scope]
---

# ego-test — 项目测试验证技能

## 触发

```
/ego-test [scope]
/test [scope]
```

- 无 scope: 运行全部单元测试
- `unit [file]`: 运行特定测试文件
- `e2e`: 运行 E2E 测试
- `coverage`: 运行覆盖率报告
- `fix [file]`: 分析失败并尝试修复

## 规则（来自 CLAUDE.md）

### TDD 强制流程

```
1. RED: 先写测试，定义预期行为（必填）
2. RUN: 运行测试，确认失败
3. GREEN: 写最少量代码让测试通过
4. REFACTOR: 清理代码，测试仍通过
```

### 测试禁止

- ❌ 禁止 mock Supabase client（用 `supabase start` 本地实例）
- ❌ 禁止修改测试断言来通过测试
- ❌ 禁止跳过测试提交
- ❌ E2E 不测试边界情况（留给单元测试）
- ❌ 不在测试中 hardcode secrets

## 工作流

### 1. 运行测试

**单元测试（默认）:**
```bash
pnpm test --run
```

**特定文件:**
```bash
pnpm test --run tests/unit/lib/utils/exif.test.ts
```

**E2E 测试:**
```bash
pnpm playwright test
```

**覆盖率报告:**
```bash
pnpm test --run --coverage
```

### 2. 分析失败

读取失败的测试文件，理解预期行为。

常见失败类型：

| 失败类型 | 可能原因 | 解决方案 |
|---------|---------|---------|
| `expect(received).toBe(expected)` | 断言值不匹配 | 检查业务逻辑或测试断言 |
| `ReferenceError: xxx is not defined` | 类型/函数未导入 | 检查 import 语句 |
| `TypeError: Cannot read property` | null/undefined | 添加防御性检查 |
| `RLS policy denied` | 权限不足 | 检查 RLS 策略或测试身份 |
| `HTMLMediaElement.load() not implemented` | jsdom 限制 | 使用 `vi.fn()` mock |

### 3. TDD 红绿环

**RED — 写失败的测试:**
```typescript
// 测试文件: lib/utils/__tests__/myfunc.test.ts
import { myFunction } from '../myfunc';

test('should return X when input is Y', () => {
  expect(myFunction('Y')).toBe('X');
});
```

**GREEN — 写最少量代码:**
```typescript
// lib/utils/myfunc.ts
export function myFunction(input: string): string {
  return 'X'; // 最简实现
}
```

**REFACTOR — 清理代码:**
```typescript
// 重构为正确实现
export function myFunction(input: string): string {
  const validInputs = { Y: 'X', Z: 'Y' };
  return validInputs[input] ?? 'default';
}
```

### 4. 修复失败测试

使用 **tdd-guide** agent 协助分析：

```
使用 tdd-guide agent 分析 tests/unit/lib/utils/exif.test.ts 的失败
```

## Server Action 测试清单

每个 Server Action 必须覆盖：

| Server Action | 必须测试的场景 |
|--------------|--------------|
| `createProfile` | 正常创建 / 姓名为空拒绝 / 未登录 rejection |
| `updateProfile` | 正常更新 / 无权限 rejection |
| `deleteProfile` | 正常删除 / 非 owner rejection |
| `createMemory` | 正常创建 / RLS 隔离 / 批量创建 |
| `createAnnotation` | 正常添加 / viewer 权限拒绝 |
| `createInvitation` | 生成链接 / 角色验证 |
| `acceptInvitation` | 有效 token / 过期 token / 已使用 token |

## E2E 测试（Playwright）

### 5 条核心流程

```
1. 注册 → 登录 → 登出
2. 创建档案 → 上传照片 → 时间线显示
3. 添加注释 → 验证持久化
4. 邀请家人 → 接受邀请 → 共同编辑
5. 未登录访问受保护页面 → 重定向
```

### axe-core 无障碍检查

```typescript
import AxeBuilder from '@axe-core/playwright';

test('页面无障碍', async ({ page }) => {
  await page.goto('/profile/test-profile-id');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### E2E 测试隔离

```typescript
// 使用 storageState 隔离认证状态
test.use({
  storageState: '.auth/test-user.json',
});
```

## 测试 Fixtures

```
tests/
├── fixtures/
│   ├── sample-photo.jpg    # 真实 JPEG (< 1MB)
│   ├── sample-video.mp4    # 真实 MP4 (< 5MB)
│   ├── sample-audio.m4a   # 真实音频 (< 1MB)
│   └── wechat-export-sample.txt  # Mock 微信导出
├── unit/
│   ├── lib/utils/         # 工具函数测试
│   ├── lib/actions/       # Server Action 测试
│   └── components/        # 组件测试
└── e2e/
    └── core-flows.spec.ts # 5 条核心流程
```

## 输出格式

测试完成后报告：

```
 Test Files  X passed (X)
      Tests  X passed | X failed (X)
   Duration  X.XXs

覆盖率: XX%
```

## 关联 Task ID

测试文件与 TASKS.md 的对应关系：

| Task | 测试文件 |
|------|---------|
| S3.T2 (EXIF) | `tests/unit/lib/utils/exif.test.ts` |
| S3.T3 (Thumbnail) | `tests/unit/lib/utils/thumbnail.test.ts` |
| S7.T3 (WeChat) | `tests/unit/lib/utils/wechat-parser.test.ts` |
| S2.T5 (Memory Actions) | `tests/unit/lib/actions/memory.test.ts` |
| S6.T1 (Family) | `tests/unit/lib/actions/family.test.ts` |

## Pre-commit Hook

每次 `git commit` 前自动运行：

```bash
pnpm test --run
```

如果测试失败，commit 被阻止。**严禁使用 `--no-verify` 绕过。**
