# AUTONOMOUS_WORKFLOW.md — 忆锚自主开发工作流

> 本文档是 `docs/v2/CLAUDE.md` 的详细补充。Claude Code Agent 在执行开发任务时会自动遵循本文档的规范。
> 参考级别：本文档提供完整的操作细节，CLAUDE.md 提供授权边界。

---

## 1. 核心原则

1. **信任但验证**：Agent 可以自主执行，但需要通过测试和构建验证
2. **Auto-fix then Report**：发现问题先自己修，修好了再汇报
3. **渐进式自主**：从明确的任务开始，逐步扩大自主范围

---

## 2. 自主开发循环（Task Agent Mode）

### 2.1 完整循环（10 步）

```
1. READ: 读取 TASKS.md 中任务描述
2. READ: 读取相关设计文档（DESIGN.md, CLAUDE.md）
3. WRITE TEST: 先写测试（RED）— TDD 强制要求
4. RUN TEST: 运行测试，确认失败
5. IMPLEMENT: 实现最小代码（GREEN）
6. RUN TEST: 运行测试，确认通过
7. REFACTOR: 清理代码，测试仍通过
8. COMMIT: 提交代码（符合 commit 规范）
9. BUILD: 运行 pnpm build 验证
10. DEPLOY: 自动部署到 Vercel Preview
11. REPORT: 汇报完成状态（含截图）
```

### 2.2 调试循环（Bug Fix Mode）

```
发现 bug → 读错误信息 → 分析原因
→ 尝试修复（最多 3 次，每次之间跑测试验证）
→ 修复成功 → 跑完整测试套件 → 自动部署 → 汇报
→ 失败 2 次 → 停止并汇报给用户
```

### 2.3 Pre-deploy 检查清单

Agent 在部署前必须确认：
- [ ] `pnpm build` 成功
- [ ] `pnpm test --run` 全部通过
- [ ] 无 console.error
- [ ] E2E 测试通过（关键流程）

---

## 3. 测试策略

### 3.1 测试分层

| 层级 | 工具 | 覆盖率 | Agent 行为 |
|------|------|--------|----------|
| 单元测试 | Vitest + jsdom | 工具函数 100% | TDD，先写测试 |
| 集成测试 | Vitest + 真实 Supabase | Server Actions 80% | 先写测试，真实 DB |
| E2E 测试 | Playwright | 5 条核心流程 | Agent 生成 + Healer 修复 |
| 视觉回归 | Playwright screenshot | 关键页面 | Agent 用 vision model 对比 |
| 可访问性 | axe-core | WCAG 2.1 AA | Agent 运行 scan |

### 3.2 TDD 强制流程

```
RED    → 先写测试，定义预期行为
RUN    → 运行测试，确认失败
GREEN  → 写最少量代码让测试通过
REFACTOR → 清理代码，测试仍通过
```

**Agent 专用规则：**
- 禁止删除或修改测试断言来让测试通过
- 测试本身有问题时，应汇报而非自行修改

### 3.3 Self-Testing（基于 ReVeal 研究）

Agent 生成自己的验证测试：

```
Agent 实现代码 → Agent 生成验证测试 → 测试失败
→ Agent 分析原因 → Agent 修复 → 循环（最多 3 次）
→ 通过 → 汇报
```

---

## 4. 浏览器控制工具

### 4.1 工具选择

| 工具 | 用途 | 状态 |
|------|------|------|
| Playwright | E2E 测试、截图 | 已安装 |
| @playwright/mcp | AI 浏览器控制 | 可选安装 |
| axe-core | 可访问性测试 | 可选安装 |
| browser-use | 高级浏览器自动化 | 可选安装 |

### 4.2 MCP 工具使用

如果安装了 `@playwright/mcp`，Agent 可以：

```
puppeteer_navigate   → 打开页面
puppeteer_screenshot  → 捕获页面状态
puppeteer_click      → 点击元素
puppeteer_fill       → 填写表单
puppeteer_evaluate   → 执行 JS 验证 DOM
```

### 4.3 视觉回归检测

```typescript
// Agent 截图对比流程
const screenshot = await page.screenshot({ fullPage: true })
// Agent 将截图发给 vision model 分析
// "对比上次截图，这个页面有什么变化？哪些是预期的，哪些是 bug？"
```

---

## 5. 汇报模板

### 5.1 任务完成汇报

```
## Sprint {N}.T{M} 完成汇报

### 任务
- S{N}.T{M}: [描述]

### 验证
- [x] pnpm test --run: X passed
- [x] pnpm build: success
- [x] Deployed to: https://xxx.vercel.app

### 截图
![功能截图]

### 发现的问题
- 无 / 问题描述

### 下一步
- 继续 S{N}.T{M+1} / 汇报给用户
```

### 5.2 Bug 修复汇报

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
- [x] pnpm build: success
- [x] Deployed to: https://xxx.vercel.app

### 截图
![修复后截图]
```

---

## 6. Claude Code 配置

### 6.1 推荐设置（~/.claude/settings.json）

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm *)",
      "Bash(vercel *)",
      "Bash(git *)"
    ]
  },
  "hooks": {
    "preTool": [
      { "name": "block-dangerous", "pattern": "rm -rf (?!.*(tmp|build|cache))" }
    ]
  }
}
```

### 6.2 危险操作拦截

以下操作被拦截，需人类确认：
- `rm -rf` 在非 tmp/build/cache 目录
- `git push --force`
- 修改 `.env.local`
- 删除 migration 文件

---

## 7. 快速参考

### 自主执行（无需汇报）
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

---

## 8. 参考资料

- [Swarmia: Five Levels of AI Agent Autonomy](https://www.swarmia.com/blog/five-levels-ai-agent-autonomy/)
- [Playwright: Test Agents](https://playwright.dev/docs/test-agents)
- [ReVeal: Self-Verification for Code Agents](https://openreview.net/forum?id=q56ZI1Co43)
- [Kent Beck: TDD with AI Agents](https://newsletter.pragmaticengineer.com/p/tdd-ai-agents-and-coding-with-kent)
- [browser-use: AI Browser Automation](https://github.com/browser-use/browser-use)
