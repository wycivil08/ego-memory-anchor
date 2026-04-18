# 工作流核查 + Stitch 完整 Prompt 手册

***

## 一、工作流核查结论

Agent 描述的工作流**基本正确**，但有几处需要修正和补充：

| 描述                         | 核查结果        | 修正                                                                                                    |
| -------------------------- | ----------- | ----------------------------------------------------------------------------------------------------- |
| Stitch 出 3 个方案供选择          | ✅ 正确        | Stitch 支持多方案生成                                                                                        |
| 点击 "Build in AI Studio" 按钮 | ⚠️ **需要确认** | Stitch 与 AI Studio 的集成路径可能是导出截图 → 手动上传到 AI Studio，不一定有一键按钮。**备选方案：Stitch 截图 → AI Studio 贴图 + prompt** |
| 简单组件跳过 Stitch              | ✅ 正确        | SourceBadge、RoleBadge 等直接 Claude Code + shadcn/ui                                                     |
| Claude Vision 做 QA         | ✅ 正确        | 但需要 Playwright 截图脚本配合                                                                                 |
| 微交互用 CSS ≤300ms            | ✅ 正确        | 与设计文档一致                                                                                               |
| "大部分工作由 AI 完成"             | ⚠️ **过度乐观** | 你仍需在 Stitch 选方案、偶尔微调 prompt、验收最终效果。**实际人工参与约 20%，非 5%**                                               |

**补充一个关键遗漏：** 在进入任何单页面设计之前，应该先用 Stitch 建立一个 **Design System 页面**（色板、字体层次、间距规范、按钮样式、卡片样式），让后续所有页面基于同一视觉语言。这是工作流的 **Phase 0**。

***

## 二、Stitch Prompt 完整手册

### 📐 使用说明

* **每个 prompt 可直接复制粘贴到 Stitch**
* 如果 Stitch 不支持中文 prompt，我附带了英文版本
* 标注 `[可选输入]` 的地方表示你可以附带截图/草图进一步锚定方向
* **建议执行顺序**：先 Prompt #0 建立设计系统 → 再按页面优先级逐个生成

***

### Prompt #0：Design System（全局视觉系统）

> **目的**：建立忆锚的视觉基准线，后续所有页面引用此结果保持一致

```
Design a UI style guide / design system page for "忆锚" (Memory Anchor),
a Chinese-language memorial platform that helps families preserve real
memories (photos, videos, voice messages) of deceased loved ones and pets.

THIS IS NOT A PRODUCT PAGE — it is a reference sheet showing all visual
building blocks.

━━━━━━━━━━━━━━━━━━━━
BRAND PERSONALITY
━━━━━━━━━━━━━━━━━━━━
- Warm, dignified, calm, trustworthy
- Like walking into a quiet sunlit room filled with old family photographs
- NOT: clinical, corporate, flashy, dark/gloomy, techy, gamified
- Closest analogies: the warmth of Notion + the simplicity of Linear + 
  the quietness of a museum exhibit

━━━━━━━━━━━━━━━━━━━━
SHOW THESE SECTIONS ON THE PAGE
━━━━━━━━━━━━━━━━━━━━

SECTION 1 — Color Palette (show swatches with hex values):
  Primary accent: amber-700 (#b45309)
  Secondary accent: amber-500 (#f59e0b)
  Highlight background: amber-50 (#fffbeb)
  
  Neutrals (main palette):
    stone-50  (#fafaf9) — page background
    stone-100 (#f5f5f4) — card background / footer
    stone-200 (#e7e5e4) — borders, dividers
    stone-300 (#d6d3d1) — disabled states
    stone-500 (#78716c) — secondary text
    stone-600 (#57534e) — body text
    stone-700 (#44403c) — strong body text
    stone-900 (#1c1917) — headings

  Semantic:
    Success: emerald-600 (#059669)
    Warning: amber-600 (#d97706)
    Error: red-600 (#dc2626)
    Info: blue-600 (#2563eb)

  Rules:
    - NEVER use pure black (#000000) or pure white (#ffffff)
    - Page bg is always stone-50, not white
    - Dark sections use stone-900 bg with stone-50 text

SECTION 2 — Typography Scale (show each level with sample Chinese text):
  Display:    36px / semibold / tracking-tight / "永不丢失关于 TA 的真实记忆"
  H1:         30px / semibold / tracking-tight / "爷爷的记忆空间"
  H2:         24px / semibold / "2023年"
  H3:         20px / medium  / "十月"
  Body:       16px / regular / line-height 1.625 / "国庆节全家最后一次聚餐，爸爸做了红烧肉"
  Small:      14px / regular / line-height 1.5 / "10月1日 · 原始记录"
  Caption:    12px / regular / text-stone-500 / "—— 注释者：小雨（女儿）"

  Font stack:
    Chinese: system-ui, "PingFang SC", "Microsoft YaHei", sans-serif
    English/Numbers: "Inter", system-ui, sans-serif

SECTION 3 — Spacing System (show visual blocks):
  4px (space-1)   — icon-to-text gap
  8px (space-2)   — tight elements
  12px (space-3)  — related items
  16px (space-4)  — card internal padding on mobile
  24px (space-6)  — card internal padding on desktop
  32px (space-8)  — between sections on mobile
  48px (space-12) — between sections on desktop
  64px (space-16) — major section breaks

SECTION 4 — Buttons (show all variants):
  Primary:   amber-700 bg, white text, rounded-lg, px-6 py-2.5, 
             hover: amber-800, shadow-sm → shadow-md on hover
             Sample: "开始守护记忆"
  Secondary: stone-100 bg, stone-700 text, rounded-lg, border stone-200
             hover: stone-200 bg
             Sample: "邀请家人"
  Ghost:     transparent bg, stone-600 text, rounded-lg
             hover: stone-100 bg
             Sample: "取消"
  Danger:    red-50 bg, red-700 text, rounded-lg
             hover: red-100 bg
             Sample: "删除档案"
  Link:      amber-700 text, no bg, underline on hover
             Sample: "阅读完整故事 →"
  
  All buttons: font-medium, transition 200ms ease-out
  Disabled state: opacity 0.5, cursor-not-allowed

SECTION 5 — Cards (show 3 variants):
  Default card:  bg-white, rounded-xl, border stone-200, p-6, shadow-sm
                 hover: shadow-md + translateY(-2px), transition 200ms
  Highlighted:   bg-amber-50, rounded-xl, border amber-100, p-6
  Dark card:     bg-stone-900, rounded-xl, p-6, text stone-50

SECTION 6 — Badges (show inline):
  "原始记录":  bg-stone-100, text-stone-500, rounded-md, px-2 py-0.5, text-xs
  "AI 增强":   bg-blue-50, text-blue-600, rounded-md, px-2 py-0.5, text-xs
  "owner":     bg-amber-50, text-amber-700, rounded-md, px-2 py-0.5, text-xs
  "编辑者":    bg-emerald-50, text-emerald-700, rounded-md, px-2 py-0.5, text-xs
  "查看者":    bg-stone-100, text-stone-500, rounded-md, px-2 py-0.5, text-xs

SECTION 7 — Form Elements (show):
  Input: h-10, rounded-lg, border stone-200, focus: ring-2 ring-amber-500/20 border-amber-500
  Textarea: same as input but taller
  Select/Dropdown: same border style
  Checkbox: rounded-sm, checked: amber-700 bg
  Label: text-sm font-medium text-stone-700, mb-1.5

SECTION 8 — Icons (show sample row):
  Style: Lucide Icons, 20px default, stroke-width 1.5
  Color: stone-500 default, amber-700 for active/accent
  Sample icons: Camera, Video, Mic, FileText, ScanLine, Calendar, 
                Users, Download, Trash2, Plus, ChevronRight, X

SECTION 9 — Avatar (show 3 sizes):
  Small:  32px circle, border-2 border-white, shadow-sm
  Medium: 48px circle, border-2 border-stone-200
  Large:  80px circle, border-2 border-stone-200, shadow-md
  Fallback: stone-200 bg with stone-500 initials

SECTION 10 — Shadow Scale:
  shadow-sm:  0 1px 2px rgba(28,25,23,0.05)
  shadow-md:  0 4px 6px rgba(28,25,23,0.07)
  shadow-lg:  0 10px 15px rgba(28,25,23,0.1)

Layout: Arrange all sections on a single tall page, clean grid, 
generous whitespace. This is a reference document, make it scannable.
```

***

### Prompt #1：Landing Page — Hero Section

```
Design the hero section (first screen) of the landing page for "忆锚" 
(Memory Anchor), a Chinese memorial platform.

━━━━━━━━━━━━━━━━━━━━
EXACT TEXT CONTENT (Chinese — must appear as-is)
━━━━━━━━━━━━━━━━━━━━
Navigation bar:
  Left: Logo text "忆锚" (no logo image, just text in stone-900, font-semibold)
  Right: Two text links — "登录" and a primary button "注册"

Main headline (Display size, stone-900):
  "永不丢失关于 TA 的真实记忆"

Sub-headline (Body size, stone-600, max-width ~560px):
  "一站式聚合照片、视频、语音、聊天记录，为逝去的亲人或宠物编织一条生命时间线"

CTA button (Primary style):
  "开始守护记忆 →"

Below CTA, small text (Caption, stone-400):
  "免费使用 · 数据随时可导出"

━━━━━━━━━━━━━━━━━━━━
LAYOUT
━━━━━━━━━━━━━━━━━━━━
Desktop (≥1024px):
  - Left 55%: headline + sub-headline + CTA, vertically centered
  - Right 45%: Abstract illustration (see below)
  - Full viewport height (100vh), but content centered in upper 60%
  - Background: stone-50 with a very subtle warm gradient 
    (amber-50 at 10% opacity radiating from the right side)

Mobile (<640px):
  - Vertical stack: illustration on top (40vh, smaller), 
    then headline + sub + CTA below
  - CTA button full width
  - py-12 top and bottom padding

━━━━━━━━━━━━━━━━━━━━
ILLUSTRATION (RIGHT SIDE)
━━━━━━━━━━━━━━━━━━━━
An abstract, warm-toned illustration that evokes:
  - Floating photograph frames (slightly tilted, overlapping)
  - Soft amber/warm-brown tones
  - A subtle timeline/thread connecting the frames
  - Maybe a small candle or warm light source
  
  DO NOT include:
  - Real human faces or photorealistic people
  - Dark/gloomy imagery
  - Tech/circuit/digital aesthetics
  - Hearts or overly sentimental symbols

  Style reference: editorial illustration, watercolor-meets-geometric,
  similar to Apple's human-centric marketing illustrations but warmer

━━━━━━━━━━━━━━━━━━━━
VISUAL RULES
━━━━━━━━━━━━━━━━━━━━
- Color palette: stone-50 bg, stone-900 headline, stone-600 body, 
  amber-700 button, amber-50 gradient accent
- Typography: Chinese text, system font feel, generous line-height
- Generous whitespace — content should feel like it's floating in space
- Navigation: simple, not sticky, blends with background
- No stock photos. No gradients on text. No decorative borders.
- Rounded corners on buttons: rounded-lg (8px)
```

**\[可选输入]** 如果你有任何纪念/相册类网站的截图作为情绪参考，附上会更好。

***

### Prompt #2：Landing Page — Value Props + How It Works

```
Design two consecutive sections for the "忆锚" landing page:
Section A: Three value proposition cards
Section B: Three-step "How it works" flow

Both sections scroll below the hero. They should feel like one continuous story.

━━━━━━━━━━━━━━━━━━━━
SECTION A — VALUE PROPOSITIONS
━━━━━━━━━━━━━━━━━━━━
Section title (H2, centered): 
  "为什么选择忆锚"

Three cards in a row (single column on mobile):

Card 1:
  Icon: 📸 or a camera icon (amber-600, 48px)
  Title: "汇集"
  Description: "把散落在手机、微信、云盘里的照片和录音，收集到一个安全的地方"

Card 2:
  Icon: 📅 or a timeline icon (amber-600, 48px)
  Title: "时间线"
  Description: "自动按日期排列，编织成一条从出生到告别的生命故事"

Card 3:
  Icon: 👨‍👩‍👧‍👦 or a people/family icon (amber-600, 48px)
  Title: "家人共建"
  Description: "邀请家人一起补充记忆，每个人的视角都珍贵"

Card style: bg-white, rounded-xl, border stone-200, p-8, text-center
Hover: subtle lift (translateY -2px) + shadow-md

Layout:
  Desktop: 3 columns, gap-6
  Mobile: 1 column, gap-4, full width cards

Section background: white (to contrast with stone-50 hero above)
Section padding: py-20 desktop, py-12 mobile

━━━━━━━━━━━━━━━━━━━━
SECTION B — HOW IT WORKS
━━━━━━━━━━━━━━━━━━━━
Section title (H2, centered):
  "三步开始"

Three steps horizontally (vertical on mobile):

Step 1:
  Number: "①" in a 48px circle (amber-100 bg, amber-800 text)
  Title: "上传记忆"
  Description: "拖拽照片、视频、语音到忆锚，支持批量上传和微信聊天记录"

Step 2:
  Number: "②" in a 48px circle
  Title: "自动生成时间线"
  Description: "系统读取拍摄日期，自动按年→月→日排列，编织成生命故事"

Step 3:
  Number: "③" in a 48px circle
  Title: "邀请家人守护"
  Description: "分享链接到微信，家人可以补充照片、添加注释、共同回忆"

Between the three steps on desktop: 
  A horizontal dashed line connecting the circles (stone-300 color)
  
On mobile: 
  Vertical layout, dashed line goes vertical between steps

Section background: stone-50
Section padding: py-20 desktop, py-12 mobile

━━━━━━━━━━━━━━━━━━━━
VISUAL CONTINUITY
━━━━━━━━━━━━━━━━━━━━
- Both sections share the same color system (stone + amber)
- Alternating backgrounds create rhythm: Hero(stone-50) → Values(white) → HowItWorks(stone-50)
- Icons/illustrations style must match the hero illustration style
- No stock photos anywhere
```

***

### Prompt #3：Landing Page — Founder Story + Privacy Pledge

```
Design two consecutive sections for the "忆锚" landing page:
Section A: Founder's personal story
Section B: Privacy pledge / trust commitments

━━━━━━━━━━━━━━━━━━━━
SECTION A — FOUNDER STORY
━━━━━━━━━━━━━━━━━━━━
Section title (H2):
  "为什么做忆锚"

Layout — Desktop:
  Left: Circular founder avatar (80px, with soft stone-200 border, shadow-md)
         Below avatar: Founder name (placeholder "创始人" in small text)
  Right: Story text, max-width 640px

Layout — Mobile:
  Avatar centered on top, text below

Story text (displayed directly, not in a card):

  Paragraph 1 (larger, italic, stone-700):
  "三年前我失去了____。
   几个月后我发现了一件更可怕的事：
   关于 TA 的记忆正在消散。"

  [阅读更多 ▼] — a clickable text link (amber-700) that expands:

  Expanded content (regular body text, stone-600):
  "换了手机后，很多照片找不到了。微信里那条语音消息，因为太久没点开，已经无法播放了。记忆不是一次性消失的——它是一点一点地溜走。

   我开始把所有能找到的照片、视频、语音消息收集到一起。翻遍了旧手机、微信聊天、云盘、家人的相册……这个过程很痛苦，但每找到一条记录，我都觉得——'还好，这段记忆还在。'

   忆锚不"复活"任何人，不生成 AI 对话，不合成任何内容。我们只做一件事：守护你已有的真实记录，让它们永远不丢失。"

Background: white
Padding: py-20 desktop, py-12 mobile
Feel: Intimate, personal — like reading a handwritten letter, not a press release

━━━━━━━━━━━━━━━━━━━━
SECTION B — PRIVACY PLEDGE
━━━━━━━━━━━━━━━━━━━━
Section title (H2, centered):
  "你的记忆，只属于你"

Four commitment cards in a 2×2 grid (single column on mobile):

Card 1:
  Icon: Lock (amber-700, 32px)
  Title: "零合成"
  Text: "不生成 AI 对话，不合成任何内容，只保存你上传的真实记录"

Card 2:
  Icon: Package/Download (amber-700, 32px)
  Title: "一键导出"
  Text: "随时下载你的全部数据，ZIP 格式，不依赖任何平台"

Card 3:
  Icon: Trash2 (amber-700, 32px)
  Title: "一键删除"
  Text: "随时删除账号和全部数据，30 天内永久清除"

Card 4:
  Icon: ShieldOff / Ban (amber-700, 32px)
  Title: "零广告零追踪"
  Text: "不做数据分析，不投广告，不把你的数据分享给任何人"

Below grid, centered:
  "阅读完整隐私政策 →" (link style, amber-700)

Card style: bg-white, rounded-xl, border amber-100, p-6
Grid: 2 columns desktop, 1 column mobile, gap-4
Section background: amber-50 (very light warm tint)
Section padding: py-20 desktop, py-12 mobile
```

***

### Prompt #4：Landing Page — CTA Banner + Footer

```
Design the final two sections of the "忆锚" landing page:
Section A: A dark call-to-action banner
Section B: Minimal footer

━━━━━━━━━━━━━━━━━━━━
SECTION A — CTA BANNER
━━━━━━━━━━━━━━━━━━━━
Background: stone-900 (dark)
Layout: Everything centered

Title (H2, white, semibold):
  "守护关于 TA 的真实记忆"

Subtitle (Body, stone-400):
  "从今天开始"

CTA button:
  Text: "免费开始使用 →"
  Style: amber-500 background, stone-900 text, rounded-lg, px-8 py-3
  Hover: amber-400 background

Below button (Caption, stone-500):
  "无需信用卡 · 数据随时可导出 · 永久免费基础功能"

Padding: py-24 desktop, py-16 mobile
Feel: Calm confidence — the dark background provides contrast 
and visual closure to the page, but the amber button keeps it warm.
NOT aggressive or salesy.

━━━━━━━━━━━━━━━━━━━━
SECTION B — FOOTER
━━━━━━━━━━━━━━━━━━━━
Background: stone-100
Layout: Simple, single row centered (or two rows on mobile)

Row 1: 
  "忆锚 · 守护真实记忆" (stone-600, text-sm)

Row 2:
  Links separated by " · ":
  "隐私政策 · 用户协议 · 联系我们" (stone-500, hover stone-900)

Row 3:
  "© 2026 忆锚 · [ICP备案号预留]" (stone-400, text-xs)

Padding: py-12
Total height: minimal — this is a quiet ending, not a mega-footer

━━━━━━━━━━━━━━━━━━━━
FULL PAGE RHYTHM REMINDER
━━━━━━━━━━━━━━━━━━━━
The full landing page section background rhythm is:
  stone-50 (Hero) → white (Values) → stone-50 (HowItWorks) → 
  white (FounderStory) → amber-50 (Privacy) → stone-900 (CTA) → stone-100 (Footer)

This alternation creates visual breathing. Each section has clear boundaries.
```

***

### Prompt #5：Dashboard 页面

```
Design the main dashboard page for "忆锚" (Memory Anchor).
This is the first page users see after logging in. It shows all the
memorial profiles they have created or joined.

━━━━━━━━━━━━━━━━━━━━
PAGE STRUCTURE
━━━━━━━━━━━━━━━━━━━━

TOP BAR:
  Left: "忆锚 · 我守护的记忆" (H3, stone-900)
  Right: User avatar (32px circle) + dropdown chevron

MAIN CONTENT AREA:

State 1 — USER HAS PROFILES (show this as the main design):

A grid of profile cards + one "create new" card:

  Desktop: 3 columns, gap-6
  Tablet: 2 columns
  Mobile: 1 column, full width

Each PROFILE CARD contains:
  ┌─────────────────────────────────────┐
  │ [Optional cover photo as card       │  ← subtle overlay gradient at bottom
  │  top background, height ~120px]     │     if no cover photo, use stone-100 bg
  │                                     │
  │    [Avatar, 64px circle,            │  ← positioned overlapping the cover/bg
  │     centered horizontally,          │     area, half above half below
  │     border-2 white, shadow-sm]      │
  │                                     │
  │  爷爷 · 张建国                       │  ← H3, stone-900, centered
  │  1945 — 2023                        │  ← Small, stone-500, centered
  │  "永远笑眯眯的老爷子"                │  ← Small italic, stone-600, centered
  │                                     │
  │  📷 210   🎬 12   🎤 50             │  ← Caption, stone-500, centered
  │  👨‍👩‍👧‍👦 4 位家人共同守护               │  ← Caption, amber-700, centered
  └─────────────────────────────────────┘

Card style: bg-white, rounded-xl, border stone-200, overflow-hidden
Hover: translateY(-2px) + shadow-md, transition 200ms
The entire card is clickable

"CREATE NEW" CARD:
  ┌─────────────────────────────────────┐
  │                                     │
  │           + (Plus icon, 40px,       │
  │              stone-400)             │
  │                                     │
  │     "为 TA 建一个记忆空间"           │  ← Body, stone-500
  │                                     │
  └─────────────────────────────────────┘
  
  Style: bg-stone-50, rounded-xl, border-2 border-dashed border-stone-300
  Hover: border-amber-400, bg-amber-50/30, + icon turns amber-600

REMINDER BANNER (above the grid, full width):
  If a memorial date is approaching, show:
  ┌─────────────────────────────────────────────────────┐
  │ 🕯️ 后天是爷爷的生日（农历二月初三）                   │
  │    "永远记得他笑着说'来来来，吃饺子'"                 │
  │                                             [查看 →] │
  └─────────────────────────────────────────────────────┘
  
  Style: bg-amber-50, rounded-xl, border amber-100, p-4
  Candle emoji has subtle glow/pulse feel
  If no upcoming dates: hide this banner entirely

State 2 — EMPTY STATE (new user, no profiles):

  Center of page, vertically and horizontally:
  
  [A gentle line-drawing illustration of an empty photo frame 
   or an open album with blank pages — warm, inviting, not sad]

  "这里还很安静"                          ← H2, stone-700
  "为你想守护的人，建一个记忆空间"         ← Body, stone-500
  
  [为 TA 创建 →]                          ← Primary button

━━━━━━━━━━━━━━━━━━━━
VISUAL RULES
━━━━━━━━━━━━━━━━━━━━
- Page background: stone-50
- Cards feel like "people", not "folders" — the avatar is the visual anchor
- The grid should feel like a family altar or a mantelpiece with framed photos
- Generous padding around the grid (px-6 mobile, px-12 desktop)
- Max content width: 1200px, centered

━━━━━━━━━━━━━━━━━━━━
RESPONSIVE
━━━━━━━━━━━━━━━━━━━━
Mobile: 1 column, cards take full width, avatar 48px
Tablet: 2 columns
Desktop: 3 columns, max-width container centered
```

***

### Prompt #6：档案详情页（时间线页面）

> **这是忆锚最核心的页面——用户在这里浏览逝者的生命故事**

```
Design the memorial profile detail page for "忆锚". This is the most
important page in the entire product. When a user clicks on a profile
card from the dashboard, they enter THIS page.

It is NOT a file browser. It is a LIFE TIMELINE — a chronological
narrative of a person's life told through real photos, videos, 
voice messages, and family annotations.

━━━━━━━━━━━━━━━━━━━━
PAGE HEADER (sticky on scroll, compact version)
━━━━━━━━━━━━━━━━━━━━
Before scroll:
  ┌────────────────────────────────────────────────┐
  │ ← 返回                                         │
  │                                                │
  │        [Avatar, 80px circle, shadow-md]        │
  │        爷爷 · 张建国                             │  ← H1, stone-900
  │        1945年3月12日 — 2023年11月8日              │  ← Small, stone-500
  │        "永远笑眯眯的老爷子"                      │  ← Body italic, stone-600
  │                                                │
  │   327 条记忆 · 4 位家人共同守护                   │  ← Caption, stone-500
  │                                                │
  │   [上传记忆]  [邀请家人]  [编辑档案]              │  ← 3 buttons in a row
  │    (Primary)   (Secondary)  (Ghost)             │
  └────────────────────────────────────────────────┘

After scrolling down ~200px, header compresses to:
  ┌────────────────────────────────────────────────┐
  │ ← [Avatar 32px] 爷爷 · 张建国  ··· [上传记忆]  │
  └────────────────────────────────────────────────┘
  (Sticky, bg-white/90 backdrop-blur, shadow-sm, h-14)

━━━━━━━━━━━━━━━━━━━━
TIMELINE BODY
━━━━━━━━━━━━━━━━━━━━

The timeline flows vertically, organized by Year → Month → Day.
A thin vertical line (stone-200, 2px) runs along the left side 
connecting all entries.

YEAR HEADER:
  ● 2023年                                ← Large dot (8px, amber-700) on the 
                                            timeline line + H2 text

MONTH HEADER:
  ├── 10月                               ← Smaller dot (6px, stone-400) + H3

TIMELINE ITEM — PHOTO TYPE:
  │   ┌────────────────────────────────┐
  │   │ [Photo thumbnail, rounded-lg,  │  ← Aspect ratio preserved
  │   │  max-height 240px on mobile,   │     Click to expand full-screen
  │   │  max-height 320px on desktop]  │
  │   │                                │
  │   │ 10月1日 · [原始记录]             │  ← Date + source badge inline
  │   │                                │     Badge: bg-stone-100 text-stone-500
  │   │ "国庆节全家最后一次聚餐"         │  ← Annotation text, stone-700
  │   │                                │
  │   │ 📸 [小雨 avatar 20px] 小雨（女儿）│ ← Contributor info, Caption, stone-500
  │   └────────────────────────────────┘
  │
  Card style: bg-white, rounded-xl, border stone-200, p-4, ml-8 (offset from line)
  On mobile: cards take full width minus timeline line indent

TIMELINE ITEM — VIDEO TYPE:
  │   ┌────────────────────────────────┐
  │   │ [Video thumbnail with play     │  ← Triangle play button overlay
  │   │  button overlay, duration      │     (centered, 48px, semi-transparent white circle)
  │   │  badge "02:34" bottom-right]   │     Duration: bottom-right, bg-black/60, text-white, text-xs
  │   │                                │
  │   │ 8月15日 · [原始记录]             │
  │   │ "爸爸在教孙子下象棋"             │
  │   │ 📹 [小明 avatar] 小明（儿子）     │
  │   └────────────────────────────────┘

TIMELINE ITEM — AUDIO/VOICE TYPE (critical — most emotional):
  │   ┌────────────────────────────────┐
  │   │ 🎤  ▶  ━━━━━━━━━━━●━━━  00:12 │  ← Inline audio player
  │   │                                │     Play button: 32px circle, amber-700
  │   │     [Audio waveform             │     Waveform: amber-200 bars, amber-600 played portion
  │   │      visualization bars]        │     Fits in a single line, h-8
  │   │                                │
  │   │ 10月3日 · 微信聊天记录 · [原始记录] │  ← Additional label "微信聊天记录"
  │   │ "这是爸爸最后发给我的语音"        │
  │   │ 🎤 [小雨 avatar] 小雨（女儿）     │
  │   └────────────────────────────────┘
  
  The audio player should feel SPECIAL — this is often the most precious item.
  Subtle amber-50 background tint to distinguish it from other types.

TIMELINE ITEM — TEXT TYPE:
  │   ┌────────────────────────────────┐
  │   │ 📝                             │
  │   │                                │
  │   │ "今天帮爸爸整理书柜，翻到一封    │  ← Body text, stone-700
  │   │  他年轻时写给妈妈的信。          │     Displayed directly, no thumbnail
  │   │  字迹很工整，每个字都认真。"     │     Max 4 lines, then "展开" link
  │   │                                │
  │   │ 9月20日 · [原始记录]             │
  │   │ [小雨 avatar] 小雨（女儿）        │
  │   └────────────────────────────────┘

TIMELINE ITEM — DOCUMENT/SCAN TYPE:
  │   ┌────────────────────────────────┐
  │   │ [Document thumbnail or         │  ← Smaller thumbnail (120px height)
  │   │  generic document icon if      
```

​
