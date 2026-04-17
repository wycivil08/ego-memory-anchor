---
name: ego-drive
description: ego-memory-anchor 项目自主驱动技能。基于 AUTONOMOUS_WORKFLOW.md，执行完整开发循环：规划→TDD→构建→部署→汇报。
argument-hint: [task-id]
---

# ego-drive — 项目自主驱动技能

## 触发

```
/ego-drive [task-id]
/drive [task-id]
```

## 核心原则

1. **信任但验证**: Agent 可以自主执行，但需要通过测试和构建验证
2. **Auto-fix then Report**: 发现问题先自己修，修好了再汇报
3. **渐进式自主**: 从明确的任务开始，逐步扩大自主范围

## 自主开发循环（10 步）

```
1. READ:   读取 TASKS.md 中任务描述
2. READ:   读取相关设计文档（DESIGN.md, CLAUDE.md）
3. WRITE TEST: 先写测试（RED）— TDD 强制要求
4. RUN TEST:  运行测试，确认失败
5. IMPLEMENT: 实现最小代码（GREEN）
6. RUN TEST:  运行测试，确认通过
7. REFACTOR:  清理代码，测试仍通过
8. COMMIT:    提交代码（符合 commit 规范）
9. BUILD:    运行 pnpm build 验证
10. DEPLOY:   自动部署到 Vercel Preview
```

## Pre-deploy 检查清单

部署前必须确认：
- [ ] `pnpm test --run` 全部通过
- [ ] `pnpm lint --max-warnings=0` 0 errors
- [ ] `pnpm build` 成功
- [ ] E2E 测试通过（关键流程）
- [ ] 无 console.error

## 测试触发时机

| 时机 | 命令 | 反馈速度 | 覆盖范围 |
|------|------|---------|---------|
| 每次代码修改 | `vitest --changed` | <30s | 受影响测试 |
| 功能点完成 | `pnpm test --run && pnpm lint` | ~2-5min | 全量单元+lint |
| Sprint 末尾 | `pnpm test --run && pnpm playwright test` | ~10min | 全量+E2E |

## TDD 强制流程

```
RED    → 先写测试，定义预期行为
RUN    → vitest --changed，确认失败
GREEN  → 写最少量代码让测试通过
REFACTOR → 清理代码，vitest --changed 仍通过
```

**Agent 专用规则：**
- 禁止删除或修改测试断言来让测试通过
- 测试本身有问题时，应汇报而非自行修改

## 调试循环（Bug Fix Mode）

```
发现 bug → 读错误信息 → 分析原因
→ 尝试修复（最多 3 次，每次之间跑测试验证）
→ 修复成功 → 跑完整测试套件 → 自动部署 → 汇报
→ 失败 2 次 → 停止并汇报给用户
```

## 浏览器控制工具

已安装 `@playwright/mcp`，Agent 可以：

```
puppeteer_navigate   → 打开页面
puppeteer_screenshot → 捕获页面状态
puppeteer_click      → 点击元素
puppeteer_fill       → 填写表单
puppeteer_evaluate    → 执行 JS 验证 DOM
```

## 汇报模板

### 任务完成汇报

```
## Sprint {N}.T{M} 完成汇报

### 任务
- S{N}.T{M}: [描述]

### 验证
- [x] pnpm test --run: X passed
- [x] pnpm lint: 0 errors
- [x] pnpm build: success
- [x] Deployed to: https://xxx.vercel.app

### 截图
![功能截图]

### 发现的问题
- 无 / 问题描述

### 下一步
- 继续 S{N}.T{M+1} / 汇报给用户
```

### Bug 修复汇报

```
## Bug 修复汇报

### 问题
- 描述

### 原因
- 分析

### 修复
- 做了什么

### 验证
- [x] pnpm test --run: 全部通过
- [x] pnpm lint: 0 errors
- [x] pnpm build: success
- [x] Deployed to: https://xxx.vercel.app
```

## 自主执行权限

### 可以自主执行（无需汇报）
- 修复 bug（最多 3 次尝试）
- 重构代码
- 写/跑/调测试
- 提交代码
- 部署到 Vercel

### 必须汇报
- 删除文件
- 修改 migration
- 添加依赖
- 修改 RLS 策略

### 停止并汇报
- 同一问题失败 2 次
- 不确定如何修复
- 发现安全问题

## 快速参考

### 开发命令
```bash
pnpm test --run              # 单元测试
pnpm lint                    # Lint
pnpm build                   # 构建
pnpm playwright test         # E2E
vitest --changed             # 增量测试
node scripts/verify-all.mjs  # 后端冒烟测试
```

### 关键文件
| 路径 | 用途 |
|------|------|
| `docs/v2/TASKS.md` | Sprint 任务列表 |
| `docs/v2/CLAUDE.md` | 项目宪法 |
| `docs/AUTONOMOUS_WORKFLOW.md` | 自主工作流 |
| `.mcp.json` | Playwright MCP 配置 |

## 安全红线

- 绝不生成关于逝者的合成内容
- 绝不跳过测试提交
- 绝不使用 `--no-verify` 绕过 pre-commit hook
- 绝不引入未经安全审查的依赖
