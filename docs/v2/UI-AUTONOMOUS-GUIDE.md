# UI/UX Agent 自主开发准则 — 忆锚专用

> 本文档是 `CLAUDE.md` 的补充，定义 UI/UX 开发的标准工作流。Agent 执行 UI/UX 开发任务时自动遵循。
> 核心原则：**Stitch 多模态出图 → AI Studio Gemini 出代码 → Claude Code 适配集成 → Claude Vision QA**

---

## 1. 工具链与分工

### 1.1 工具职责矩阵

| 工具 | 职责 | 输入 | 输出 | 费用 |
|------|------|------|------|------|
| **Google Stitch** | 多模态 UI 设计 | 文字描述 / 截图 / 草图 / Figma | 可交互原型 + 设计稿 | 免费（350次/月）或 Google AI Pro 已包含 |
| **Google AI Studio** | Gemini 代码生成 | Stitch 设计稿 / 自然语言需求 | React / HTML / CSS / Tailwind 代码 | 免费（速率限制）或 Google AI Pro 更高配额 |
| **Claude Code** | 核心开发集成 | AI Studio 输出的代码 + 项目上下文 | 适配 shadcn/ui 的生产代码 | 免费 |
| **Claude Vision** | 视觉 QA 对比 | 实际页面截图 vs 设计稿 | 差异清单 + 修复代码 | 免费（Claude subscription） |
| **Vercel Preview** | 多设备验证 | 部署 URL | 跨设备截图 | 免费 |

### 1.2 工具能力边界

```
Stitch 优势：多模态（文字/截图/草图/Figma → 设计稿）
Stitch 劣势：代码非 shadcn/ui 适配，需要二次加工

AI Studio (Gemini) 优势：基于 Stitch 上下文直接生成代码，支持 React 输出
AI Studio 劣势：生成的代码需要适配项目技术栈

Claude Code 优势：理解完整项目上下文，shadcn/ui 专家，RLS/Auth 集成
Claude Code 劣势：纯文字 prompt 视觉细节不如 Stitch 多模态输出
```

---

## 2. 工作流：5 Phase 完整流程

```
┌──────────────────────────────────────────────────────────────────┐
│  Phase 1: 设计锚定（Stitch 多模态 + AI Studio Gemini）           │
│  文字描述 / 截图 / 草图 → Stitch → 设计稿 × 3 → AI Studio → 代码 │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Phase 2: Claude Code 适配（shadcn/ui 转换）                     │
│  AI Studio 输出 → shadcn/ui 组件替换 → TypeScript 类型添加       │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Phase 3: 集成与业务逻辑                                          │
│  Supabase 数据层 / RLS / Auth / 路由 / 状态管理                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Phase 4: 视觉 QA（Claude Vision 对比）                          │
│  实际页面截图 vs 设计稿 → 差异清单 → Claude Code 修复             │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│  Phase 5: 微交互与情感层                                          │
│  CSS transitions 优先（克制、轻量）→ Framer Motion 按需          │
└──────────────────────────────────────────────────────────────────┘
```

---

## 3. Phase 1：设计锚定 — Stitch + AI Studio

### 3.1 Stitch 使用策略

**什么时候用 Stitch：**
- 新页面 / 新组件完全没有视觉参考 → 文字描述生成
- 有手绘草图 / 线框图 → 拍照 / 截图输入 Stitch
- 有现有设计稿想改版 → Figma 导入或截图输入
- Landing Page、Hero、ProfileCard 等情感化组件

**Stitch Prompt 模板（忆锚专用）：**

```
Design a [页面/组件名称] for "忆锚" (Memory Anchor),
a memorial platform for preserving real memories of deceased loved ones.

EMOTION: Warm, dignified, calm — like walking into a quiet room
filled with old photographs. NOT cold, NOT corporate, NOT dark.

COLOR PALETTE:
- Primary: amber-700 (#b45309) for accents
- Neutrals: stone palette (stone-50 to stone-900)
- Background: warm off-white (stone-50)
- Highlight: amber-50 for featured sections
- NO pure black (#000) or pure white (#fff)

TYPOGRAPHY:
- Chinese: system-ui (苹方/思源黑体)
- English/Numbers: Inter
- Headings: text-2xl font-semibold tracking-tight
- Body: text-base leading-relaxed

SPACING:
- Page padding: px-4 sm:px-6 lg:px-8
- Card padding: p-6
- Gap between cards: gap-4 sm:gap-6
- Section spacing: space-y-8

MOBILE-FIRST: 80%+ users on mobile (China market)

COMPONENT SPECIFIC:
[在这里填写组件的详细功能描述]

STYLE REFERENCES:
- Linear.app simplicity + Notion warmth
- Generous whitespace — let content breathe
- Subtle shadows: shadow-sm default, shadow-md on hover
- Rounded corners: cards rounded-xl, buttons rounded-lg
```

### 3.2 AI Studio Gemini 代码生成

**从 Stitch 发送到 AI Studio 的方法：**

1. 在 Stitch 中选择最接近的设计稿
2. 点击 "Build in AI Studio" 按钮
3. 在 AI Studio 中添加功能需求：
   ```
   Generate React + Tailwind CSS code for this design.
   Requirements:
   - Must use TypeScript
   - Mobile-first responsive (375px base)
   - Include hover/focus states
   - Accessible (ARIA labels, keyboard nav)
   - Use Inter font for English, system-ui for Chinese
   ```

**AI Studio 输出后的处理：**
- 提取关键组件代码
- 发送到 Claude Code 进行 shadcn/ui 适配
- 不要直接用 AI Studio 输出覆盖项目文件

---

## 4. Phase 2：Claude Code 适配

### 4.1 适配工作检查清单

当收到 AI Studio 的代码时，Claude Code 执行以下适配：

- [ ] 将 AI Studio 的 Tailwind 类替换为 shadcn/ui 组件
- [ ] 将硬编码颜色替换为 design tokens（CSS 变量）
- [ ] 添加 TypeScript 类型定义
- [ ] 确保响应式断点与项目一致（sm:768px, lg:1024px, xl:1280px）
- [ ] 替换非 shadcn 的图标为 Lucide Icons
- [ ] 验证 ARIA 标签和键盘导航
- [ ] 添加 loading / error / empty 状态

### 4.2 shadcn/ui 组件替换速查

| AI Studio 输出 | 替换为 shadcn/ui |
|---------------|-----------------|
| `<div className="bg-white rounded-lg shadow">` | `<Card>` |
| `<button className="bg-amber-700 text-white">` | `<Button className="bg-amber-700">` |
| `<input className="border rounded-md">` | `<Input>` |
| `<div className="flex gap-4">` | `<div className="flex gap-4">` (保留) |
| 自定义图标 | `import { IconName } from 'lucide-react'` |

### 4.3 Design Token 映射

```css
/* AI Studio 的 Tailwind 类 */
bg-amber-700 → bg-primary (--primary: 25 60% 45%)
bg-stone-50 → bg-background (--background: 30 20% 98%)
text-stone-900 → text-foreground (--foreground: 30 10% 15%)
```

---

## 5. Phase 3：集成与业务逻辑

### 5.1 Claude Code 集成标准 Prompt

```
## 任务：集成 [组件名称] 到忆锚项目

### 上下文
- 项目技术栈：Next.js 15 + shadcn/ui + Tailwind CSS 4 + Supabase
- Design tokens：参见 app/globals.css
- 色彩系统：stone-50~900 暖色调 + amber-700 主色
- 动效原则：≤300ms ease-out，禁弹跳

### 设计参考
- [Stitch 设计稿截图路径或描述]
- [AI Studio 生成的组件代码]

### 组件规格
- Props 接口：[列出]
- 数据来源：[Supabase 表名]
- 交互状态：[列出所有状态]

### 执行步骤
1. 将组件放入 components/[类别]/[组件名].tsx
2. 接入 Supabase 数据层
3. 添加 TypeScript 类型
4. 处理 loading/error/empty 状态
5. 添加 CSS 微交互（≤300ms）
6. 运行 vitest --changed 验证
7. 部署到 Vercel Preview
```

---

## 6. Phase 4：视觉 QA

### 6.1 Claude Vision 对比流程

**触发时机：** 每个页面 / 组件完成集成后

**步骤：**

1. **Agent 截图实际页面**
   ```bash
   npx playwright screenshot http://localhost:3000/[页面路径] \
     --full-page --output screenshots/[页面名]-actual.png
   ```

2. **Agent 使用 Claude Vision 对比**
   ```
   请对比两张图：
   1. [设计稿/参考图]
   2. [实际实现截图]

   逐项列出视觉差异：
   - 间距差异（具体 px 值）
   - 字号/字重差异
   - 颜色差异（具体色值）
   - 圆角差异
   - 对齐问题
   - 缺失的阴影/边框
   - 响应式问题

   对每个差异，给出具体的 Tailwind CSS 修复代码。
   ```

3. **Claude Code 执行修复**
   - 按优先级逐一修复
   - 每修复一个，重新截图验证

### 6.2 Vercel Preview 多设备验证

**标准断点截图：**

| 设备 | 宽度 | 验证内容 |
|------|------|---------|
| Mobile (iPhone 14) | 375px | 触控区域、间距、内容溢出 |
| Tablet (iPad) | 768px | 两栏布局、间距 |
| Desktop | 1280px | 完整布局、hover 状态 |

```bash
# 批量截图脚本
npx playwright screenshot \
  https://[preview-url].vercel.app/[页面] \
  --full-page \
  --device="iPhone 14" \
  screenshots/mobile-[页面].png

npx playwright screenshot \
  https://[preview-url].vercel.app/[页面] \
  --full-page \
  --device="Desktop Chrome" \
  screenshots/desktop-[页面].png
```

---

## 7. Phase 5：微交互与情感层

### 7.1 微交互优先级

忆锚的微交互必须**克制、温暖、不花哨**。

| 优先级 | 场景 | 动效类型 | 时长 |
|--------|------|---------|------|
| P0 | 页面过渡 | fade-in + slide-up | 200-300ms |
| P0 | 卡片 hover | translateY(-2px) + shadow-md | 200ms |
| P1 | 空状态出现 | fade-in | 300ms |
| P1 | 纪念日横幅滑入 | slide-down | 400ms |
| P1 | 音频播放波形 | CSS animation | 持续 |
| P2 | 照片展开 | scale + fade | 300ms |
| P2 | 上传完成飘入 | fade-in + scale bounce | 400ms |

### 7.2 CSS 微交互模板（优先用 CSS，慎用 Framer Motion）

**卡片 Hover：**
```css
.card-hover {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

**页面进入：**
```css
.page-enter {
  animation: fadeSlideUp 300ms ease-out forwards;
}
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**蜡烛脉冲（纪念日横幅）：**
```css
.candle-pulse {
  animation: candleGlow 2s ease-in-out infinite;
}
@keyframes candleGlow {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
```

### 7.3 禁用动效

- 禁止 scale bounce（1.0 → 1.05 → 1.0）
- 禁止 rotate / skew
- 禁止 shake
- 禁止纯色块闪烁（用 opacity 动画）
- 禁止持续旋转

---

## 8. 忆锚 UI 开发核心 Prompt 模板

### 8.1 通用前缀（每次调用 AI 工具时附带）

```
你正在为"忆锚"生成 UI。忆锚是一个帮助用户保存逝去亲人/宠物真实记忆的纪念产品。

设计原则（必须遵守）：
1. 温暖克制 — stone-50~900 + amber-700，禁纯黑/纯白
2. 安静有温度 — 大量留白，文案温暖
3. 动效克制 — ≤300ms ease-out，禁弹跳/放大
4. 原始记录徽章 — 永远安静存在，不抢注意力
5. 移动优先 — 80%用户用手机
6. 情感基调 — 像走进一间放满老照片的安静房间

技术约束：
- 框架：Next.js 15 + shadcn/ui + Tailwind CSS 4
- 字体：中文 system-ui，英文 Inter
- 图标：Lucide Icons（线条风格）
- 阴影：shadow-sm 默认，hover 时 shadow-md
- 圆角：卡片 rounded-xl，按钮 rounded-lg
```

### 8.2 Stitch Prompt 示例

**HeroSection（忆锚 Landing Page）：**
```
Design a hero section for "忆锚" (Memory Anchor), a memorial platform.

HEADLINE: "永不丢失关于 TA 的真实记忆"
SUBHEADLINE: "一站式聚合照片、视频、语音、文字，为逝去的亲人或宠物编织一条生命时间线"
CTA: "开始守护记忆" (amber button)

RIGHT SIDE: Abstract warm illustration of floating photographs
—no real human faces

FEEL: Like opening an old family album, warm and dignified

MOBILE: Stack vertically, CTA full width
```

**ProfileCard（档案卡片）：**
```
Design a memorial profile card for a deceased person.

LEFT: Circular avatar photo
CENTER TOP: Name "爷爷 · 张建国"
CENTER MIDDLE: Dates "1945 — 2023 · 78岁"
CENTER BOTTOM: One-line description "永远笑眯眯的老爷子"
RIGHT TOP: Memory count "📷 210  🎬 12  🎤 50"
RIGHT BOTTOM: Family count "4 位家人共同守护"

STYLE: Warm stone palette, amber accents
HOVER: Subtle lift (translateY -2px) + shadow

FEEL: Like a person, not a file folder
```

### 8.3 AI Studio Prompt 模板

```
Generate production-ready React + Tailwind CSS code for this design.

Technical requirements:
- TypeScript with explicit types
- Mobile-first responsive (375px base)
- Use CSS custom properties (CSS variables) for colors
- Include hover, focus, active states
- Accessible: ARIA labels, keyboard navigation
- Animation: CSS transitions ≤300ms ease-out

Chinese font: system-ui
No pure black or pure white colors
Warm stone palette with amber accents
```

---

## 9. 文件结构

```
components/
├── ui/                    # shadcn/ui 基础组件
├── landing/              # Landing Page 组件
│   ├── HeroSection.tsx
│   ├── ValueProps.tsx
│   ├── HowItWorks.tsx
│   ├── FounderStory.tsx
│   ├── PrivacyPledge.tsx
│   ├── CTABanner.tsx
│   └── Footer.tsx
├── profile/              # 档案相关组件
│   ├── ProfileCard.tsx
│   ├── ProfileForm.tsx
│   ├── ProfileSummary.tsx
│   └── CoverPhotoSelector.tsx
├── timeline/             # 时间线组件
│   ├── Timeline.tsx
│   ├── TimelineItem.tsx
│   └── TimelineFilters.tsx
└── memory/              # 记忆详情组件
    ├── MemoryCard.tsx
    ├── PhotoViewer.tsx
    └── AudioPlayer.tsx

app/globals.css          # Design tokens（CSS 变量）
```

---

## 10. QA 验收标准

### 10.1 每个组件完成时的检查清单

- [ ] Stitch 设计稿已生成（Phase 1）
- [ ] AI Studio 代码已提取（Phase 1）
- [ ] Claude Code 已适配 shadcn/ui（Phase 2）
- [ ] 接入 Supabase 数据层（Phase 3）
- [ ] Claude Vision 对比通过（Phase 4）
- [ ] Vercel Preview 多设备截图验证（Phase 4）
- [ ] CSS 微交互已添加，动效 ≤300ms（Phase 5）
- [ ] `vitest --changed` 通过
- [ ] `pnpm build` 成功

### 10.2 Sprint 末尾的检查清单

- [ ] `pnpm test --run` 全部通过
- [ ] `pnpm build` 成功
- [ ] Playwright E2E 核心流程通过
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] 移动端全流程手动走查

---

## 11. 常见问题

### Q1: Stitch 生成的设计不满意怎么办？
**A:** 使用多轮对话 refinement："这个颜色太冷了，调暖一些"、"间距太大了，收窄"。

### Q2: AI Studio 输出的代码有错误怎么办？
**A:** 把错误信息贴给 Claude Code，让它修复同时保持视觉一致。

### Q3: 没有设计稿，直接用文字描述够吗？
**A:** 够，但效果打折扣。建议用文字描述 + 参考图（其他网站的截图）一起输入 Stitch。

### Q4: 什么组件不需要 Stitch？
**A:** 太简单的通用组件（SourceBadge、RoleBadge）— 直接 Claude Code + shadcn/ui 实现。

### Q5: 动效用 CSS 还是 Framer Motion？
**A:** 优先 CSS transitions。Framer Motion 只在复杂布局动画（shared element transition）时使用。

---

## 12. 参考资料

- [Google Stitch](https://stitch.withgoogle.com/)
- [Google AI Studio](https://aistudio.google.com/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [Framer Motion](https://www.framer.com/motion/)（按需）

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-15 | 初版，基于 research + Plan A/B 对比 |
