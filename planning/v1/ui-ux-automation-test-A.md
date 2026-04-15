# UI/UX 美学最大化 + 自动化测试最佳实践

我来系统回答这两个问题，然后给出需要更新到现有文档里的具体改动。

***

## 一、Claude Code 开发网站的 UI/UX 美学最大化

### 核心问题诊断

Claude Code 写功能代码很强，但 **UI 容易"能用但不好看"**，原因有三：

* 没有视觉参考时，它会生成"安全但平庸"的布局
* Tailwind 类的组合选择缺乏美学判断（间距、圆角、阴影的微妙差异）
* 不会主动考虑动效、空白节奏、视觉层次

### 解决方案：三层防线

**第一层（最关键）：用 shadcn/ui 作为组件基础**

这是 2025-2026 年 Claude Code 开发 Web 项目的**事实标准**，理由：

* **Claude 的训练数据中 shadcn/ui 极其充分** — 生成质量远高于从零写 Tailwind
* **基于 Radix UI 原语** — 无障碍访问（a11y）开箱即用
* **Copy-paste 模式** — 不是 npm 依赖，而是直接复制源码到项目中，完全可定制
* **Tailwind CSS Variables 主题** — 可以用 CSS 变量统一控制全局色调
* **组件质量本身就是"设计师级"** — Button、Dialog、Toast、DatePicker 等开箱即用的视觉品质远超手写

对我们的项目尤其合适：shadcn/ui 的默认风格是**克制、干净、有呼吸感**的，非常匹配"忆锚"需要的温暖而不喧闹的基调。

**具体操作：** 在 T0.1 阶段初始化 shadcn/ui：

```bash
pnpm dlx shadcn@latest init
# 选择：New York style, Zinc base color, CSS variables: yes
```

然后按需添加组件：

```bash
pnpm dlx shadcn@latest add button input textarea select dialog toast avatar badge card tabs dropdown-menu
```

**第二层：在 CLAUDE.md 中写入详细的设计规范**

Claude Code 的 UI 质量**与 CLAUDE.md 中设计指令的精确度正相关**。模糊指令如"做得好看"没用，精确指令如下面这样才有用：

```markdown
## 设计系统

### 色彩 (CSS Variables in globals.css)
--background: 30 20% 98%        /* 暖白，非纯白 */
--foreground: 30 10% 15%        /* 暖黑，非纯黑 */
--muted: 30 15% 94%             /* 浅暖灰 */
--muted-foreground: 30 10% 45%  /* 中灰文字 */
--primary: 25 60% 45%           /* 暖棕/琥珀 - 主操作色 */
--primary-foreground: 30 20% 98%
--accent: 30 30% 90%            /* 淡暖灰 - 悬浮/选中态 */
--destructive: 0 72% 51%        /* 红色 - 仅用于删除 */
--border: 30 15% 88%            /* 边框 */
--ring: 25 60% 45%              /* focus ring 同 primary */

### 间距节奏
- 卡片内边距: p-6 (24px)
- 卡片间距: gap-4 (16px)  
- section 间距: space-y-8 (32px)
- 页面最大宽度: max-w-4xl mx-auto (时间线), max-w-lg mx-auto (表单)

### 圆角
- 卡片: rounded-xl
- 按钮: rounded-lg
- 输入框: rounded-md
- 头像: rounded-full

### 阴影
- 卡片: shadow-sm hover:shadow-md transition-shadow
- 弹窗: shadow-lg
- 不使用 shadow-xl 或 shadow-2xl (太重)

### 排版
- 标题: text-2xl font-semibold tracking-tight
- 副标题: text-lg text-muted-foreground
- 正文: text-base leading-relaxed
- 注释/元信息: text-sm text-muted-foreground
- 行高宽松: leading-relaxed 或 leading-7

### 动效
- 所有过渡: transition-all duration-200 ease-in-out
- 页面切换: 不做动画(instant)
- 素材加载: skeleton 占位 (shadcn Skeleton 组件)
- Toast: 从右上角滑入, 3秒自动消失
- 禁止: bounce, shake, 任何注意力抢夺型动效

### 空白与呼吸感
- 每个页面顶部留 py-8 空白
- 表单字段之间 space-y-4
- 两个 section 之间用 <Separator /> 或 py-8 分隔
- 永远不要让内容挤满屏幕 — 留白是设计的一部分
```

**第三层：使用 Superpowers `/ui-ux-pro-max` skill 做 UI 专项任务**

这个 skill 的作用是在你指定 UI 任务时，激活额外的设计思维流程：

* 分析信息层次（什么最重要→最显眼）
* 考虑视觉节奏（大小、粗细、颜色的对比）
* 检查无障碍（对比度、焦点管理、屏幕阅读器）
* 输出带设计说明的代码

**使用时机：** 不需要每个任务都用。建议在以下任务中显式激活：

* T1.4 基础布局和导航栏
* T2.8 时间线 UI 组件
* T4.5 Landing Page
* T4.7 响应式优化

激活方式：

```
use /ui-ux-pro-max for this task. 
Design context: memorial/grief tech product. 
Tone: warm, quiet, respectful. 
Reference: shadcn/ui default components with warm amber/zinc palette.
```

### 可选增强：视觉参考驱动

如果你有特别喜欢的网站风格，可以**截图给 Claude Code**（它支持图片输入）：

```
看这张截图的设计风格，提取它的间距、色调、卡片样式，
在我们的 shadcn/ui 主题基础上实现类似的视觉感受。
```

这比文字描述有效 10 倍。你可以找 1-2 个风格参考网站截图放入项目 `/docs/design-references/` 目录，在 CLAUDE.md 中引用。

***

## 二、网站自动化测试的 Claude Code 最佳实践

### 测试金字塔（针对我们的项目）

```echarts
{
  "tooltip": { "trigger": "item", "formatter": "{b}: {c}%" },
  "series": [{
    "type": "funnel",
    "left": "15%",
    "top": 20,
    "bottom": 20,
    "width": "70%",
    "min": 0,
    "max": 100,
    "sort": "ascending",
    "gap": 4,
    "label": { "show": true, "position": "inside", "fontSize": 13, "color": "#fff" },
    "itemStyle": { "borderWidth": 0 },
    "data": [
      { "value": 60, "name": "单元测试 (Vitest)\n工具函数 + Server Actions", "itemStyle": { "color": "#3b82f6" } },
      { "value": 30, "name": "集成测试 (Vitest)\n组件渲染 + 数据流", "itemStyle": { "color": "#6366f1" } },
      { "value": 10, "name": "E2E (Playwright)\n核心用户流程", "itemStyle": { "color": "#8b5cf6" } }
    ]
  }]
}
```

### 具体实践

**实践 1：Superpowers `/tdd` 驱动开发**

这是我们 TASKS.md 里每个任务的**默认执行方式**。流程：

```
红 → 先写失败的测试
绿 → 写最少的代码让测试通过
重构 → 清理代码，测试仍然通过
```

在 CLAUDE.md 中加入强制规则：

```markdown
## TDD Rules
- EVERY Server Action must have tests written BEFORE implementation
- EVERY utility function (lib/utils/*) must have tests written BEFORE implementation
- Test file location mirrors source: src/lib/utils/exif.ts → tests/unit/utils/exif.test.ts
- Run `pnpm test` after every task. Do NOT proceed if tests fail.
```

**实践 2：Playwright E2E — 聚焦核心流程，不求覆盖率**

E2E 测试昂贵（慢、脆弱），只覆盖**用户最关键的完整流程**：

```typescript
// tests/e2e/core-flow.spec.ts
test('完整核心流程', async ({ page }) => {
  // 1. 注册
  await page.goto('/register');
  await page.fill('[name=email]', 'test@example.com');
  // ...注册完成

  // 2. 创建档案
  await page.click('text=开始守护第一份记忆');
  await page.fill('[name=name]', '张爷爷');
  // ...创建完成

  // 3. 上传素材
  await page.click('text=上传');
  const fileInput = page.locator('input[type=file]');
  await fileInput.setInputFiles(['tests/fixtures/sample-photo.jpg']);
  // ...上传完成

  // 4. 验证时间线
  await expect(page.locator('[data-testid=memory-card]')).toHaveCount(1);

  // 5. 添加注释
  await page.click('[data-testid=memory-card]');
  await page.fill('[name=annotation]', '这是爷爷在院子里拍的');
  await page.click('text=添加注释');
  await expect(page.locator('text=这是爷爷在院子里拍的')).toBeVisible();
});
```

**实践 3：Playwright 视觉回归测试（推荐但非必须）**

Playwright 内置 screenshot comparison，可以检测 UI 意外变化：

```typescript
test('时间线页面视觉回归', async ({ page }) => {
  // 预先 seed 测试数据
  await page.goto('/profile/test-profile-id');
  await expect(page).toHaveScreenshot('timeline.png', {
    maxDiffPixels: 100  // 允许微小差异
  });
});
```

**首次运行生成基准截图，之后每次运行对比。** 如果 UI 改变了，测试失败，你审查后决定是否更新基准。

**实践 4：无障碍测试集成 axe-core**

这是我们产品的**道德要求** — 丧亲用户可能是年长者、视力不佳者：

```bash
pnpm add -D @axe-core/playwright
```

```typescript
import AxeBuilder from '@axe-core/playwright';

test('时间线页面无障碍', async ({ page }) => {
  await page.goto('/profile/test-profile-id');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

**实践 5：ECC 的 pre-commit hook 强制测试**

ECC 可以配置 git hook，确保每次 commit 前自动运行测试：

```
# .claude/hooks/pre-commit
pnpm test --run
```

如果测试失败，commit 被阻止。这防止 subagent 在测试未通过时提交代码。

### 测试相关的 CLAUDE.md 补充规则

```markdown
## Testing Strategy
- Unit tests: Vitest + @testing-library/react
- E2E tests: Playwright
- Accessibility: @axe-core/playwright on all page-level E2E tests
- Visual regression: Playwright screenshot comparison on key pages (optional)
- Test fixtures: tests/fixtures/ (sample photos, videos, audio, wechat export)
- Test database: Supabase local instance, reset before each E2E run

## Test Execution
- After EVERY task: run `pnpm test` (unit tests)
- After EVERY sprint: run `pnpm test:e2e` (E2E tests)
- Pre-commit hook enforces unit test pass
- Never mock Supabase client in integration tests — use local Supabase
- E2E tests use a dedicated test user, seeded via supabase/seed.sql
```

***

## 三、需要更新到现有文档的具体改动

以下是需要合并到已生成的 4 份文档中的**增量修改**：

### CLAUDE.md 新增内容

| 位置   | 新增                                         |
| ---- | ------------------------------------------ |
| 技术栈  | 增加 `shadcn/ui (New York style)`            |
| 技术栈  | 增加 `@axe-core/playwright`                  |
| 文件结构 | 增加 `src/components/ui/` 说明为 shadcn/ui 组件目录 |
| 新增章节 | **设计系统** — 完整色彩/间距/圆角/阴影/排版/动效规范（上面那段）     |
| 新增章节 | **Testing Strategy** — 上面那段                |
| 编码规范 | 增加：UI 组件优先使用 shadcn/ui，不从零手写               |

### TASKS.md 改动

| 任务                     | 改动                                                                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **T0.1**               | 新增步骤：初始化 shadcn/ui (`pnpm dlx shadcn@latest init`)，添加基础组件（button, input, textarea, card, dialog, toast, avatar, badge, separator, skeleton, tabs, dropdown-menu） |
| **T0.3**               | 新增步骤：安装 `@axe-core/playwright`，配置 pre-commit hook                                                                                                                |
| **T0.1 验证**            | 新增：shadcn/ui 组件可正常渲染                                                                                                                                             |
| T1.4, T2.8, T4.5, T4.7 | 标注 `[使用 /ui-ux-pro-max]`                                                                                                                                         |
| T4.8                   | 新增：每个 E2E 测试包含 axe-core 无障碍检查                                                                                                                                    |
| 新增 T4.8.5              | **视觉回归基准截图生成** — 对 Landing、Dashboard、Timeline、Detail 四个关键页面生成基准截图                                                                                                |

### DESIGN.md 改动

| 位置   | 改动                                                 |
| ---- | -------------------------------------------------- |
| 组件树  | 所有 UI 基础组件（Button, Input, Modal 等）标注 `(shadcn/ui)` |
| 新增章节 | shadcn/ui 组件映射表 — 列出项目中用到的每个 shadcn 组件及其用途         |

### 组件映射表

| 项目组件    | shadcn/ui 基础                  | 定制说明                                            |
| ------- | ----------------------------- | ----------------------------------------------- |
| 所有按钮    | `Button`                      | 使用 variant: default/secondary/ghost/destructive |
| 表单输入    | `Input`, `Textarea`, `Select` | —                                               |
| 档案卡片    | `Card`                        | 加暖色悬浮效果                                         |
| 确认弹窗    | `AlertDialog`                 | 删除操作专用                                          |
| 通知      | `Toast` (Sonner)              | —                                               |
| 头像      | `Avatar`                      | —                                               |
| 标签      | `Badge`                       | 类型标签用不同颜色 variant                               |
| 日期选择    | `Calendar` + `Popover`        | 需扩展农历支持                                         |
| 标签输入    | `Command` + `Badge`           | 自定义组合                                           |
| 加载占位    | `Skeleton`                    | —                                               |
| 分隔线     | `Separator`                   | —                                               |
| 下拉菜单    | `DropdownMenu`                | Navbar 用户菜单                                     |
| 筛选 Tabs | `Tabs`                        | 时间线类型筛选                                         |

***

## 四、最终确认清单

| # | 事项               | 建议                                               | 你的决定 |
| - | ---------------- | ------------------------------------------------ | ---- |
| 1 | UI 框架            | **shadcn/ui** 作为组件基础                             | ?    |
| 2 | 设计规范             | 暖棕/琥珀主色调 + 上述完整规范写入 CLAUDE.md                    | ?    |
| 3 | 模型方案             | **Opus + Sonnet + Haiku**（放弃 MiniMax）            | ?    |
| 4 | 测试方案             | Vitest 单元 + Playwright E2E + axe-core 无障碍 + 视觉回归 | ?    |
| 5 | `/ui-ux-pro-max` | 在 T1.4, T2.8, T4.5, T4.7 四个关键 UI 任务中使用           | ?    |

**全部确认后，我将把上述所有改动合并到 4 份文档的最终版中**，你可以直接复制到项目目录启动 Claude Code 开发。
