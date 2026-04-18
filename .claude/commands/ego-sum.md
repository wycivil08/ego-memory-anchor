---
name: ego-sum
description: ego-memory-anchor 项目知识总结技能。读取 docs/sum/ 下的 5 个核心文档，还原项目的完整上下文。
argument-hint: [action]
---

# ego-sum — 项目知识总结技能

## 触发

```
/sum
/sum read
/sum refresh
/sum verify
```

## 动作

| 参数 | 说明 |
|------|------|
| (无) | 读取并汇总项目当前状态 |
| `read` | 读取 docs/sum/ 下 5 个核心文档 |
| `refresh` | 更新 docs/sum/ 文档（基于最新代码状态） |
| `verify` | 验证文档与实际代码的同步状态 |

---

## docs/sum/ 文档集

读取以下 5 个文档，还原 99% 的项目全貌：

| # | 文档 | 回答问题 |
|---|------|---------|
| 1 | `docs/sum/PROJECT_OVERVIEW.md` | 这是什么项目？为什么存在？ |
| 2 | `docs/sum/ARCHITECTURE.md` | 数据模型、存储、认证如何设计？ |
| 3 | `docs/sum/FEATURES.md` | 有哪些功能？页面结构？组件树？ |
| 4 | `docs/sum/DESIGN_SYSTEM.md` | UI 规范、颜色、间距、组件规格？ |
| 5 | `docs/sum/DEVELOPMENT.md` | 如何开发、测试、调试？ |

---

## 输出格式

### 1. 项目概述（来自 PROJECT_OVERVIEW.md）

```
## 忆锚 (ego-memory-anchor)

**一句话定位**: [核心定位]
**目标用户**: [目标用户]
**核心差异化**: [与网盘/竞品的关键区别]
**当前状态**: [开发阶段]
```

### 2. 技术栈（来自 PROJECT_OVERVIEW.md）

```
## 技术栈

- 前端: Next.js 15 + TypeScript + Tailwind CSS 4
- 后端: Supabase (Auth + Postgres + Storage + RLS)
- 测试: Vitest + React Testing Library + Playwright
- 部署: Vercel
- 包管理: pnpm
```

### 3. 数据模型（来自 ARCHITECTURE.md）

```
## 核心表

- profiles: 逝者档案（姓名、头像、生卒日期、关系）
- memories: 记忆素材（照片/视频/语音/文字/文档）
- family_members: 家庭协作（角色：owner/editor/viewer）
- reminders: 纪念日提醒（支持农历）
- privacy_consents: 隐私同意记录

**安全**: 所有表开启 RLS；source_label 不可变（DB trigger）
**存储**: memories + avatars bucket 公开，UUID 路径
```

### 4. 功能清单（来自 FEATURES.md）

```
## 已实现功能

### 认证
- [x] 邮箱注册（+隐私政策同意）
- [x] 邮箱登录
- [x] JWT Session 管理
- [x] 中间件路由保护

### 档案管理
- [x] 创建档案
- [x] 编辑档案
- [x] 删除档案
- [x] 档案封面照片
- [x] 多档案支持

### 时间线
- [x] 自动时间线（按年/月/日分组）
- [x] 虚拟滚动（@tanstack/react-virtual）
- [x] 筛选（类型/标签/日期）
- [x] SourceBadge "原始记录"

### 上传
- [x] 批量上传（最多3并发）
- [x] EXIF 日期提取
- [x] 缩略图生成
- [x] 日期精度选择

### 家庭协作
- [x] 邀请链接生成
- [x] 角色管理（admin/editor/viewer）
- [x] 接受邀请流程
- [ ] 共同编辑权限

### 纪念日
- [x] 纪念日提醒 CRUD
- [x] 农历支持
- [ ] CeremonyBanner（蜡烛动画）
- [ ] TodayMemory（今天的记忆）

### 设置
- [x] 修改密码
- [x] 数据导出（ZIP）
- [ ] 删除账号
```

### 5. UI 规范（来自 DESIGN_SYSTEM.md）

```
## 设计规范

### 色彩
- Primary: amber-700 (#B45309)
- Background: stone-50 (#FAFAF8)
- Text: stone-900 / stone-500
- **注意**: text-stone-400 对比度不足，使用 text-stone-500

### 圆角
- 卡片: rounded-xl
- 按钮: rounded-lg
- 输入框: rounded-md
- 头像: rounded-full

### 动效
- 默认过渡: transition-all duration-200 ease-in-out
- 列表加载: stagger fade-in (50ms/项)
- **禁止**: bounce, shake, spin, scale-bounce
```

### 6. 测试状态（来自 DEVELOPMENT.md）

```
## 测试

- 单元测试: 222 passed
- E2E 测试: 15 passed, 7 skipped (--workers=1)
- 构建: success

### 运行命令
pnpm test --run              # 单元测试
npx playwright test --workers=1  # E2E
pnpm build                   # 构建
```

---

## 文档同步检查

每次 `/sum` 运行时，检查：

| 检查项 | 说明 |
|-------|------|
| 文档完整性 | 5 个文档都存在且非空 |
| 最新 commit | 文档最后更新时间 vs 代码最后修改时间 |
| 功能清单准确性 | FEATURES.md 中的功能与实际代码对比 |

---

## 输出示例

```
## 忆锚项目当前状态

### 1. 项目概述
**定位**: 面向丧亲/丧宠人群的真实记忆聚合平台
**差异化**: 守护真实记录，对抗第二重丧失；绝不生成合成内容
**阶段**: MVP 开发中 (Sprint 8)

### 2. 技术栈
Next.js 15 + TypeScript + Tailwind CSS 4 + Supabase + Playwright

### 3. 数据模型
- profiles (逝者档案)
- memories (记忆素材，source_label 不可变)
- family_members (家庭协作，角色制)
- reminders (纪念日提醒)
- privacy_consents (隐私同意)

### 4. 已完成功能
[见上方功能清单]

### 5. UI 规范
[见上方设计规范]

### 6. 测试状态
单元: 222 passed | E2E: 15 passed | Build: success

### 7. 下一步建议
- 完成 S8 剩余任务（数据导出、隐私政策页面）
- E2E 测试覆盖率提升
- Accessibility 审计
```

---

## 关联 Skill

| Skill | 用途 |
|-------|------|
| `ego-test` | 运行测试、分析失败 |
| `tdd-guide` | TDD 红绿重构循环 |
| `code-reviewer` | 代码审查 |
| `build-error-resolver` | 构建错误修复 |

---

## 注意事项

1. 读取文档时优先使用 `docs/sum/` 下的摘要文档
2. 如需详细规格，参考 `docs/v2/` 下的完整文档
3. 测试相关问题优先使用 `ego-test` skill
4. 文档与实际代码不同步时，提示用户执行 `/sum refresh`
