# UI/UX 美学最大化 + 自动化测试最佳实践

我针对你的两个问题做了研究，以下是结论和具体方案。

***

## 一、Claude Code 开发网站的 UI/UX 美学最大化

### 核心问题：Claude Code 写代码很强，但"审美"需要外部锚定

Claude Code 的弱点不是写不出好看的代码，而是**没有视觉反馈回路** — 它不能"看到"自己渲染出来的页面。这意味着你需要从三个层面解决：

**层面 1：组件库选择 — 让起点就很高**

**强烈建议引入 `shadcn/ui`**，理由：

| 对比项             | 纯 Tailwind 手写    | shadcn/ui                   |
| --------------- | ---------------- | --------------------------- |
| 美学基线            | 取决于 Claude 的"审美" | **Vercel 设计团队级别的默认样式**      |
| 可访问性            | 需要手动处理 ARIA      | 基于 Radix UI，**WCAG 合规开箱即用** |
| 一致性             | 随 session 漂移     | 设计 token 统一管控               |
| Claude Code 熟悉度 | 一般               | **极高** — 训练数据中大量 shadcn 项目  |
| 定制性             | 完全自由             | 完全可定制（它只是复制到你项目里的代码）        |

安装方式：

```bash
pnpm dlx shadcn@latest init
# 然后按需添加组件：
pnpm dlx shadcn@latest add button card dialog input textarea select toast avatar badge tabs dropdown-menu
```

**这样 CLAUDE.md 中的 UI 组件部分可以改为"使用 shadcn/ui 组件，不自己造轮子"。**

**层面 2：设计规范锚定 — 在 CLAUDE.md 中写死视觉规则**

Claude Code 最听 CLAUDE.md 的话。把美学要求写成**不可违反的规则**：

```markdown
# UI Design System (追加到 CLAUDE.md)

## 设计原则
- 整体风格：温暖、克制、留白充足，参考 Linear.app 的简洁感 + Notion 的温暖感
- 情感基调：安静陪伴，不是科技炫酷

## 颜色系统 (shadcn/ui theme)
- Background: stone-50 (#fafaf9) — 温暖米白，不是冷白
- Foreground: stone-900 (#1c1917)
- Primary: amber-700 (#b45309) — 温暖琥珀色，用于 CTA
- Primary-foreground: white
- Muted: stone-100 (#f5f5f4)
- Muted-foreground: stone-500 (#78716c)
- Border: stone-200 (#e7e5e4)
- Destructive: red-600
- 禁止使用纯黑 #000000 和纯白 #ffffff

## 字体
- 中文：system-ui (苹方 / 思源黑体)
- 数字/英文：Inter (Google Fonts)
- 标题：text-2xl font-semibold, tracking-tight
- 正文：text-sm, leading-relaxed
- 辅助文字：text-xs, text-muted-foreground

## 间距
- 页面内边距：px-4 sm:px-6 lg:px-8
- 卡片间距：gap-4 sm:gap-6
- 区块间距：space-y-8
- 组件内部间距：p-4 或 p-6

## 圆角
- 卡片：rounded-xl
- 按钮：rounded-lg
- 输入框：rounded-md
- 头像：rounded-full

## 阴影
- 卡片悬停：hover:shadow-md transition-shadow
- 弹窗：shadow-xl
- 不使用 shadow-2xl 及更大阴影

## 动效
- 所有过渡：transition-all duration-200 ease-in-out
- 页面切换：fade-in (opacity 0→1, 150ms)
- 列表项加载：stagger fade-in (每项延迟 50ms)
- 禁止：弹跳(bounce)、旋转(spin)、缩放弹出(scale-bounce)

## 组件规范
- 所有卡片：bg-card rounded-xl border p-6 hover:shadow-md transition-shadow
- 所有按钮使用 shadcn Button 组件，不自定义
- 空状态：居中布局，64px 插画图标 + text-lg 标题 + text-sm 描述 + CTA 按钮
- 表单标签：text-sm font-medium, 与输入框间距 space-y-2
```

**层面 3：视觉验证回路 — 让 Claude "看到" 页面**

这是最关键的一环。有三种方法：

**方法 A（推荐）：Playwright 截图 + Opus 审查**

在每个 UI Sprint 完成后，加一个自动截图步骤：

```typescript
// tests/visual/screenshots.spec.ts
import { test } from '@playwright/test';

const pages = [
  { name: 'landing', path: '/' },
  { name: 'login', path: '/login' },
  { name: 'dashboard-empty', path: '/dashboard' },
  { name: 'dashboard-with-profiles', path: '/dashboard' }, // 需要 seed data
  { name: 'timeline', path: '/profile/test-id' },
  { name: 'upload', path: '/profile/test-id/upload' },
  { name: 'memory-detail-photo', path: '/profile/test-id/memory/photo-id' },
  { name: 'memory-detail-audio', path: '/profile/test-id/memory/audio-id' },
];

for (const page of pages) {
  test(`screenshot: ${page.name}`, async ({ page: p }) => {
    await p.goto(page.path);
    await p.waitForLoadState('networkidle');
    // 桌面
    await p.setViewportSize({ width: 1440, height: 900 });
    await p.screenshot({ path: `screenshots/${page.name}-desktop.png`, fullPage: true });
    // 手机
    await p.setViewportSize({ width: 375, height: 812 });
    await p.screenshot({ path: `screenshots/${page.name}-mobile.png`, fullPage: true });
  });
}
```

截图后，用 Opus 做 UI 审查：

```
审查 screenshots/ 目录下的所有截图。对照 CLAUDE.md 中的 UI Design System 规范，
逐页检查：1) 颜色是否符合规范 2) 间距是否一致 3) 空状态是否温暖 4) 移动端是否可用
列出所有违反规范的地方，生成修复任务。
```

**方法 B：Browser MCP Tool**

Claude Code 可以通过 **MCP (Model Context Protocol) 的 browser tool** 直接操控浏览器并截图。如果你配置了 Playwright MCP server，Claude Code 可以在编码过程中：

1. 启动本地 dev server
2. 打开浏览器访问页面
3. 截图并"看到"渲染结果
4. 自行判断是否符合设计规范

配置方式（在 `.claude/mcp.json` 中）：

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@anthropic/mcp-playwright"]
    }
  }
}
```

**方法 C：`ui-ux-pro-max-skill` 的定位**

这个 skill 来自 Superpowers/ECC 生态，它的核心做法是：

* 强制 Claude 在写 UI 代码前先描述视觉意图
* 生成代码后强制自查 accessibility 和响应式
* 引入 design review checkpoint

**它是流程约束，不是视觉能力。** 可以和上述方法搭配使用，但**不能替代 shadcn/ui + 设计规范 + 截图验证**。建议作为辅助激活，不作为主要依赖。

### UI/UX 最终推荐方案

```echarts
{
  "tooltip": { "trigger": "item" },
  "series": [{
    "type": "funnel",
    "left": "10%",
    "top": 20,
    "bottom": 20,
    "width": "80%",
    "min": 0,
    "max": 100,
    "minSize": "0%",
    "maxSize": "100%",
    "sort": "descending",
    "gap": 4,
    "label": { "show": true, "position": "inside", "fontSize": 13, "color": "#fff" },
    "itemStyle": { "borderColor": "#fff", "borderWidth": 2 },
    "data": [
      { "value": 100, "name": "shadcn/ui 组件库 — 美学基线", "itemStyle": { "color": "#6366f1" } },
      { "value": 80, "name": "CLAUDE.md 设计规范 — 视觉约束", "itemStyle": { "color": "#8b5cf6" } },
      { "value": 60, "name": "Playwright 截图 — 视觉验证", "itemStyle": { "color": "#a78bfa" } },
      { "value": 40, "name": "Opus UI 审查 — 细节打磨", "itemStyle": { "color": "#c4b5fd" } },
      { "value": 20, "name": "ui-ux-pro-max-skill — 流程防护", "itemStyle": { "color": "#ddd6fe" } }
    ]
  }]
}
```

***

## 二、网站自动化测试 / Agent 驱动测试的 Claude Code 最佳实践

### 测试金字塔：我们的 MVP 需要什么

```echarts
{
  "tooltip": { "trigger": "axis", "axisPointer": { "type": "shadow" } },
  "xAxis": { "type": "value" },
  "yAxis": { 
    "type": "category", 
    "data": ["E2E 测试\n(Playwright)", "集成测试\n(Server Actions)", "单元测试\n(Utils/Parser)"],
    "axisLabel": { "fontSize": 12 }
  },
  "series": [{
    "type": "bar",
    "data": [
      { "value": 8, "itemStyle": { "color": "#f59e0b" } },
      { "value": 15, "itemStyle": { "color": "#3b82f6" } },
      { "value": 25, "itemStyle": { "color": "#22c55e" } }
    ],
    "label": { "show": true, "position": "right", "formatter": "{c} 个" }
  }],
  "grid": { "left": "25%", "right": "15%" }
}
```

### 三层测试策略

**第 1 层：单元测试 (Vitest) — Sonnet 写，自动验证**

覆盖所有 `lib/utils/` 工具函数，这些是**确定性逻辑，最适合 TDD**：

| 模块                 | 测试重点                          |
| ------------------ | ----------------------------- |
| `exif.ts`          | 各种图片格式的日期提取、无 EXIF 的 fallback |
| `wechat-parser.ts` | 消息解析正确性、媒体文件映射、边界情况（空消息、特殊字符） |
| `file.ts`          | 文件类型检测、大小验证、格式转换              |
| `date.ts`          | 农历↔公历转换、周年计算、跨年处理             |

**使用 Superpowers 的 `/tdd` 流程**：

```
/tdd — 开发 wechat-parser.ts
1. 先写测试（红）：定义微信消息解析的预期输入/输出
2. 运行测试确认失败
3. 写最小实现让测试通过（绿）
4. 重构代码保持测试通过
```

**第 2 层：集成测试 (Vitest + Supabase 本地) — Sonnet 写，Opus 审查**

测试 Server Actions 的完整数据流：

```typescript
// tests/integration/memory.test.ts
describe('createMemory', () => {
  it('should create a memory record with correct metadata', async () => {
    // 使用 Supabase 本地实例的真实数据库
    const profile = await createTestProfile();
    const result = await createMemory({
      profileId: profile.id,
      type: 'photo',
      filePath: 'test/photo.jpg',
      memoryDate: '2024-01-15',
      tags: ['春节'],
    });
    expect(result.data).toBeDefined();
    expect(result.data.source_label).toBe('原始记录');
    expect(result.data.tags).toEqual(['春节']);
  });

  it('should enforce RLS — user cannot access another user profile', async () => {
    // 用另一个用户的 token 尝试创建 → 应该失败
  });
});
```

**关键原则：不 mock Supabase**。用 `supabase start` 的本地实例跑真实数据库，每个测试前 seed、测试后清理。这样 RLS 策略也能被测试到。

**第 3 层：E2E 测试 (Playwright) — Opus 写**

E2E 测试只覆盖**核心用户流程**，不追求覆盖率：

```typescript
// tests/e2e/core-flow.spec.ts
test('完整核心流程：注册 → 创建档案 → 上传 → 查看时间线 → 注释', async ({ page }) => {
  // 1. 注册
  await page.goto('/register');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'TestPass123');
  await page.click('button[type="submit"]');
  
  // 2. 创建档案
  await page.waitForURL('/dashboard');
  await page.click('text=开始守护第一份记忆');
  await page.fill('[name="name"]', '爸爸');
  // ... 填写表单
  await page.click('button[type="submit"]');
  
  // 3. 上传照片
  await page.waitForURL(/\/profile\/.+/);
  await page.click('text=上传');
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('tests/fixtures/sample-photo.jpg');
  await page.click('text=开始上传');
  await page.waitForSelector('text=上传完成');
  
  // 4. 查看时间线
  await page.goto(page.url().replace('/upload', ''));
  await expect(page.locator('[data-testid="memory-card"]')).toHaveCount(1);
  
  // 5. 添加注释
  await page.click('[data-testid="memory-card"]');
  await page.fill('[name="annotation"]', '这是爸爸最喜欢的那张照片');
  await page.click('text=添加注释');
  await expect(page.locator('text=这是爸爸最喜欢的那张照片')).toBeVisible();
});
```

### Agent 驱动测试的最佳实践

**做法 1：Subagent 专职测试**

在 `/executing-plans` 过程中，每完成一个实现任务，**自动派一个 subagent 写测试**：

```
# 在 CLAUDE.md 中添加规则：
## Testing Protocol
- Every implementation task MUST be followed by a test-writing subtask
- The test-writing subagent MUST be a fresh context (not the same agent that wrote the code)
- This prevents the "wrote the code so I know it works" bias
```

**做法 2：Superpowers /tdd 的严格模式**

Superpowers 的 TDD skill 强制执行红→绿→重构循环。在 `CLAUDE.md` 中激活：

```markdown
## Development Methodology
- All utility functions: strict TDD (/tdd skill)
- Server Actions: write test first, then implement
- UI components: implement first, then write interaction tests
```

**做法 3：测试作为 PR Gate**

在 `CLAUDE.md` 的 Git 规则中：

```markdown
## Git Rules (enhanced)
- NEVER commit if any test is failing
- Run `pnpm test` before every commit
- Run `pnpm test:e2e` before marking a Sprint as complete
```

ECC 的 hooks 可以自动执行这个：pre-commit hook 自动跑 `pnpm test`，如果失败则阻止 commit。

### 测试的优先级与投入比

| 测试类型                  | 写测试的模型                         | 占比  | 何时写           |
| --------------------- | ------------------------------ | --- | ------------- |
| 单元测试 (utils)          | **Sonnet** (TDD)               | 50% | 实现前           |
| 集成测试 (Server Actions) | **Sonnet** 写，**Opus** 审        | 30% | 实现后立即         |
| E2E 测试 (核心流程)         | **Opus**                       | 15% | Sprint 完成后    |
| 视觉截图测试                | **Playwright** 自动 + **Opus** 审 | 5%  | UI Sprint 完成后 |

***

## 需要更新到文档中的变更

基于以上讨论，**4 份文档需要以下更新**：

### CLAUDE.md 更新

1. **添加 shadcn/ui 到技术栈**
2. **添加完整的 UI Design System 规范**（上面那段颜色/字体/间距/动效规则）
3. **添加 Testing Protocol 规则**
4. **添加 Browser MCP 配置说明**

### TASKS.md 更新

1. **T0.1 增加**：安装 shadcn/ui，配置主题色，添加基础组件（Button, Card, Input, Dialog, Toast, Avatar, Badge, Tabs, DropdownMenu, Select, Textarea）
2. **每个 Sprint 末尾增加**：`T{n}.visual` — Playwright 截图 + Opus UI 审查任务
3. **T4.8 E2E 测试增加**：视觉截图基线生成

### DESIGN.md 更新

1. **组件树中的 UI Components 改为引用 shadcn/ui**，不自建

***

**要我现在生成更新后的完整 4 份文档吗？** 还是你先确认以下两点：

| # | 决策项          | 我的建议                                        | 你的决定 |
| - | ------------ | ------------------------------------------- | ---- |
| 1 | 引入 shadcn/ui | **强烈推荐** — 美学基线提升巨大，Claude Code 极其熟悉        | ?    |
| 2 | 模型方案最终确认     | **Opus + Sonnet + Haiku**（放弃 MiniMax，原因已详述） | ?    |

确认后我一次性输出**终版全部 4 份文档**，你直接丢进项目目录开始开发。
