# Stitch 完整 Prompt 手册 — 忆锚专用

> 本文档合并自 `stitch-A.md` 和 `stitch-B.md`，以 B 为基础，补充 A 的 Design System，新增4个缺失页面 Prompt。
>
> **工具链**: Stitch (设计) → AI Studio Gemini (代码) → Claude Code (集成) → Claude Vision (QA)

---

## 一、工作流核查结论

| 步骤 | 描述 | 核查结论 | 修正 |
|------|------|----------|------|
| Stitch 出图 | 3个方案供选择 | ✅ 正确 | — |
| Build in AI Studio | 一键导出 | ⚠️ 需补充技术约束prompt | 见"五、AI Studio 追加Prompt" |
| Claude Code 改造 | shadcn/ui适配 | ✅ 正确 | — |
| Claude Vision QA | 截图对比 | ✅ 正确 | 需Playwright截图脚本配合 |
| 微交互 | CSS ≤300ms | ✅ 正确 | — |
| 简化路径 | 简单组件跳过 | ✅ 正确 | SourceBadge等直接Claude Code |

**关键补充：**
- Stitch 对中文处理能力有限，产出是"**布局方向+视觉氛围**，非最终中文排版"
- **Phase 0 必须先建立 Design System**，这是后续所有页面的视觉锚点
- 实际人工参与约 **20%**，非"大部分由AI完成"

---

## 二、设计系统（Phase 0）

> 每个 Stitch Prompt 的视觉基准线，后续所有页面引用此结果保持一致

### Prompt #0：Design System

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
  Sample icons: Camera, Video, Mic, FileText, Calendar,
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

---

## 三、10个核心 Stitch Prompt

### Prompt 1/10: Landing Page — 完整页面

```
Same brand context.

Design a complete landing page for "忆锚" (Memory Anchor).

This is the first page potential users see. They are likely grieving and
searching for "how to save deceased parent's photos" or "how to preserve
WeChat voice messages before they expire." They need to feel:
"This is safe. These people understand. I can trust them."

PAGE STRUCTURE (6 sections, scrolling top to bottom):

═══════════════════════════════════════════════════════════
SECTION 1 — HERO (full viewport height)
═══════════════════════════════════════════════════════════

Desktop layout: 60% text left, 40% illustration right
Mobile layout: illustration top (shorter), text below

LEFT CONTENT:
- Badge/pill above headline: "不做AI合成 · 只保存真实记忆"
  (small, stone-200 bg, stone-600 text, rounded-full)
- Headline (text-4xl to text-6xl, stone-900, font-bold):
  "永不丢失
   关于 TA 的真实记忆"
  (Line break after 永不丢失)
- Subheadline (text-lg, stone-600, max-width 540px):
  "把散落在手机、微信、云盘里的照片、视频、语音消息收集到一起，
   为逝去的亲人或宠物编织一条生命时间线"
- CTA button: "开始守护记忆 →"
  (amber-700 bg, white text, rounded-lg, px-8 py-3, text-lg)
- Trust line below CTA (text-sm, stone-400):
  "免费使用 · 数据随时可导出 · 零广告零追踪"

RIGHT ILLUSTRATION:
- Abstract, warm-toned illustration suggesting:
  - Floating/gently arranged photographs
  - A timeline flowing vertically
  - Warm amber/stone gradient
  - NO real human faces, NO specific photographs
  - Style: soft geometric or watercolor-like, muted warm tones
  - Think: scattered polaroid-shaped frames connected by a gentle line

Background: stone-50 base with a very subtle radial gradient of amber-50
emanating from the illustration area

═══════════════════════════════════════════════════════════
SECTION 2 — VALUE PROPOSITIONS (3 cards)
═══════════════════════════════════════════════════════════

Background: white
Layout: 3 cards in a row (desktop), stacked vertically (mobile)
Each card: white bg, rounded-xl, p-8, text-center, subtle border stone-100

Card 1:
- Icon: A simple camera/photo icon (line style, amber-600, 48px)
- Title: "汇集" (text-xl, font-semibold, stone-900)
- Description: "把散落在手机、微信、云盘里的照片和录音，收集到一个安全的地方"

Card 2:
- Icon: A timeline/calendar icon (line style, amber-600, 48px)
- Title: "时间线"
- Description: "自动按日期排列，编织成一条从出生到告别的生命故事"

Card 3:
- Icon: A family/people icon (line style, amber-600, 48px)
- Title: "家人共建"
- Description: "邀请家人一起补充记忆，每个人的视角都珍贵"

═══════════════════════════════════════════════════════════
SECTION 3 — HOW IT WORKS (3 steps)
═══════════════════════════════════════════════════════════

Background: stone-50
Section title: "三步开始" (text-2xl, center, stone-900)

Layout: 3 steps horizontal (desktop) with dotted connecting line between them
Mobile: vertical stack

Each step:
- Step number in circle: 48px, amber-100 bg, amber-800 number, rounded-full
- Title below number
- Short description below title
- Small illustrative sketch below (abstract, warm)

Step 1: "上传记忆"
"拖拽照片、视频、语音到忆锚。支持批量上传，自动读取拍摄日期"
(Sketch: hand dropping photos into a container)

Step 2: "自动生成时间线"
"系统按年→月→日排列，编织成完整的生命时间线"
(Sketch: vertical timeline with nodes)

Step 3: "家人一起守护"
"分享链接给家人，每个人都可以补充记忆和注释"
(Sketch: multiple avatars around a shared timeline)

═══════════════════════════════════════════════════════════
SECTION 4 — FOUNDER STORY
═══════════════════════════════════════════════════════════

Background: white
Layout:
- Desktop: circular avatar (80px) on left, text on right
- Mobile: avatar centered above, text below

Content:
- Section label: "为什么做忆锚" (text-sm, stone-400, uppercase tracking)
- Avatar: placeholder circular photo with soft border (border-2 stone-200)
- Name: "创始人名字" (text-base, font-semibold)

Quote text (text-lg, stone-700, italic, leading-relaxed):
"三年前我失去了____。
几个月后我发现了一件更可怕的事：
关于 TA 的记忆正在消散。"

Expandable section (collapsed by default):
- Trigger: "阅读完整故事 ↓" (text-amber-700, cursor-pointer)
- Expanded text (text-base, stone-600):
  "换了手机后，很多照片找不到了。微信里那条语音消息，因为太久没点开，
   已经无法播放了……

   我开始把所有能找到的照片、视频、语音消息收集到一起。
   翻遍了旧手机、微信聊天、云盘，家人的相册。
   这个过程很痛苦，但每找到一条记录，我都觉得——
   '还好，这段记忆还在。'

   忆锚不"复活"任何人，不生成AI对话，不合成任何内容。
   我们只做一件事：守护你已有的真实记录，让它们永远不丢失。"

Style note: This section should feel intimate, like reading a personal letter.
Slightly narrower max-width (640px) to create a "letter" reading column.

═══════════════════════════════════════════════════════════
SECTION 5 — PRIVACY PLEDGE (2×2 grid)
═══════════════════════════════════════════════════════════

Background: amber-50 (#fffbeb)
Section title: "你的记忆，只属于你" (text-2xl, center, stone-900)

Layout: 2×2 grid of cards (desktop), stacked (mobile)
Each card: white bg, rounded-xl, p-6, border border-amber-100

Card 1 (top-left):
- Icon: 🔒 lock (amber-700, 32px)
- Title: "零合成" (text-base, font-semibold)
- Text: "不生成AI对话，不合成任何内容，只保存你上传的真实记录" (text-sm, stone-600)

Card 2 (top-right):
- Icon: 📦 package (amber-700, 32px)
- Title: "一键导出"
- Text: "随时下载你的全部数据，ZIP格式，不依赖任何平台"

Card 3 (bottom-left):
- Icon: 🗑️ trash (amber-700, 32px)
- Title: "一键删除"
- Text: "随时删除账号和全部数据，30天内永久清除"

Card 4 (bottom-right):
- Icon: 🚫 ban (amber-700, 32px)
- Title: "零广告零追踪"
- Text: "不做数据分析，不投广告，不把你的数据分享给任何人"

Below cards: "阅读完整隐私政策 →" (text-amber-700, text-sm)

═══════════════════════════════════════════════════════════
SECTION 6 — BOTTOM CTA BANNER
═══════════════════════════════════════════════════════════

Background: stone-900 (dark, creating contrast)
Layout: centered text

- Title: "守护关于 TA 的真实记忆" (text-2xl sm:text-3xl, white, font-bold)
- Subtitle: "从今天开始" (text-lg, stone-300)
- CTA: "免费开始使用 →" (amber-500 bg, stone-900 text, rounded-lg, px-8 py-3)
- Trust line: "无需信用卡 · 数据随时可导出 · 永久免费基础功能" (text-sm, stone-400)

═══════════════════════════════════════════════════════════
NAVBAR (sticky top)
═══════════════════════════════════════════════════════════

- Left: "忆锚" text logo (text-xl, font-semibold, stone-900)
  with a tiny amber-700 dot or anchor icon
- Right: "登录" (text button, stone-600) + "注册" (amber-700 bg button, white text)
- Background: white/stone-50 with backdrop-blur on scroll
- Height: 64px
- Mobile: same but buttons may be smaller

═══════════════════════════════════════════════════════════
FOOTER
═══════════════════════════════════════════════════════════

Background: stone-100
- Brand: "忆锚 · 守护真实记忆" (text-sm, stone-500)
- Links row: 隐私政策 · 用户协议 · 联系我们 (text-sm, stone-600)
- Bottom: "© 2026 忆锚 · [ICP备案号]" (text-xs, stone-400)
- Padding: py-12

═══════════════════════════════════════════════════════════

OVERALL PAGE RHYTHM:
- stone-50 (Hero) → white (Value Props) → stone-50 (How It Works) →
  white (Founder) → amber-50 (Privacy) → stone-900 (CTA) → stone-100 (Footer)
- This alternation creates visual breathing and section separation

DELIVERABLES:
Please show both desktop (1280px) and mobile (375px) versions.
```

***

### Prompt 2/10: Dashboard — 主工作台

```
Same brand context.

Design the main DASHBOARD page — this is what users see after logging in.
It displays all memorial profiles (deceased loved ones) the user has created or joined.

EMOTIONAL CONTEXT:
This is the user's personal memorial space. It should feel like
opening a door to a quiet, warm room — not like opening a productivity tool.
The heading says "我守护的记忆" (Memories I Protect).

═══════════════════════════════════════════════════════════
TOP BAR
═══════════════════════════════════════════════════════════

- Left: "忆锚" logo
- Right: User avatar (32px circle) + dropdown indicator
- Background: white, border-b border-stone-100
- Height: 64px

═══════════════════════════════════════════════════════════
REMINDER BANNER (conditional — shown when a memorial date is approaching)
═══════════════════════════════════════════════════════════

- Position: below top bar, full width
- Background: subtle gradient from amber-50 to transparent (left to right)
- Left: 🕯️ emoji with gentle opacity pulse animation
- Text: "后天是爷爷的生日（农历二月初三）" (stone-800)
- Subtext: "「永远记得他笑着说'来来来，吃饺子'」" (stone-500, italic)
- Right: "查看 →" link (amber-700)
- Dismissible with × button
- Height: ~60px, rounded-none, py-3 px-6

═══════════════════════════════════════════════════════════
MAIN CONTENT AREA
═══════════════════════════════════════════════════════════

Page title: "我守护的记忆" (text-2xl, font-semibold, stone-900)
Padding: px-4 sm:px-6 lg:px-8, py-8

PROFILE CARDS GRID:
- Desktop: 3 columns, gap-6
- Tablet: 2 columns, gap-4
- Mobile: 1 column, gap-4

═══════════════════════════════════════════════════════════
PROFILE CARD (the core element — design this in detail)
═══════════════════════════════════════════════════════════

Card dimensions: fill column width, aspect ratio ~4:5 (portrait)
Card style: white bg, rounded-xl, overflow-hidden, shadow-sm,
            hover: shadow-md + translateY(-2px), transition 200ms

Structure from top to bottom:

1. COVER AREA (top 40% of card):
   - If cover photo exists: blurred/dimmed cover photo as background
   - If no cover: soft gradient (stone-100 to stone-50)
   - AVATAR overlapping the cover/content boundary:
     - 72px circle, border-4 border-white, shadow-sm
     - Positioned: centered horizontally, bottom of cover area

2. CONTENT AREA (below cover, p-6, pt-10 to accommodate avatar):
   - Name: "爷爷" (text-lg, font-semibold, stone-900, center)
   - Full name below: "张建国" (text-sm, stone-500, center)
   - Dates: "1945 — 2023" (text-sm, stone-400, center)
   - One-line description: "永远笑眯眯的老爷子"

3. STATS BAR (bottom of card, border-t border-stone-50, px-4 py-3):
   - Left side: media counts with tiny icons
     "📷 210  🎬 12  🎤 50" (text-xs, stone-400)
   - Right side: family count
     "👨‍👩‍👧 4位家人" (text-xs, stone-400)

SHOW TWO EXAMPLE CARDS:
Card A — "爷爷 · 张建国" (1945-2023, human, "永远笑眯眯的老爷子", 327条记忆, 4位家人)
Card B — "小橘" (2016-2024, pet cat, "最爱晒太阳的小胖橘", 89条记忆, 2位家人)

═══════════════════════════════════════════════════════════
CREATE NEW CARD (the "+" card)
═══════════════════════════════════════════════════════════

Same dimensions as profile cards, but:
- Dashed border (border-2 border-dashed border-stone-200)
- No shadow
- Center content:
  - Large + icon (48px, stone-300)
  - Text: "为 TA 建一个" (text-base, stone-400)
  - Subtext: "记忆空间" (text-sm, stone-300)
- Hover: border-stone-300, + icon becomes amber-600,
  bg changes to stone-50

═══════════════════════════════════════════════════════════
EMPTY STATE (when user has NO profiles yet)
═══════════════════════════════════════════════════════════

Show an alternate version of the page when there are zero profiles:
- Centered content, max-width 480px
- Illustration: A simple line drawing of an empty picture frame
  or a gentle timeline with no nodes
- Heading: "为你想守护的人" (text-xl, stone-700)
- Subheading: "建一个记忆空间" (text-lg, stone-500)
- Description: "把散落各处的照片、视频、语音消息收集到一起，
  编织成一条永不丢失的时间线。" (text-sm, stone-400, max-w-sm)
- CTA: "创建第一个记忆空间 →" (amber-700 button)
- Feeling: warm invitation, NOT "no data found" error

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Desktop (1280px) with 3 profile cards + 1 create card + reminder banner
2. Mobile (375px) with same content stacked
3. Empty state variant (both desktop and mobile)
```

***

### Prompt 3/10: Timeline Page — 核心产品体验

```
Same brand context.

Design the TIMELINE PAGE — this is the heart of the product.
When a user clicks a profile card on the Dashboard, they enter this page.
It is a vertical life timeline of the deceased, showing all uploaded memories
arranged by date. This page should feel like "walking into a room dedicated
to this person's life" — NOT like browsing a file manager.

EMOTIONAL CONTEXT:
"这是一个人的生命故事" (This is a person's life story)
The entry into this page should feel like a gentle, reverent moment.

═══════════════════════════════════════════════════════════
PAGE HEADER — MEMORIAL PROFILE HEADER
═══════════════════════════════════════════════════════════

Full-width section at top, stone-50 bg, py-8 px-4

Layout (desktop):
- Left: Large avatar (96px circle, border-4 border-white, shadow-md)
- Center-left:
  - Name: "爷爷 · 张建国" (text-2xl, font-semibold, stone-900)
  - Dates: "1945年3月12日 — 2023年11月8日" (text-sm, stone-500)
  - Description: "永远笑眯眯的老爷子" (text-base, stone-600, italic)
  - Stats: "327 条记忆 · 4 位家人共同守护" (text-sm, stone-400)
- Right: Action buttons
  - Primary: "上传记忆" (amber-700 button)
  - Secondary: "邀请家人" (outline button, stone-300 border)
  - Tertiary: "···" more menu (icon button → dropdown: edit profile, export, etc.)

Layout (mobile):
- Avatar centered (80px)
- All text centered below
- Action buttons full-width, stacked

═══════════════════════════════════════════════════════════
TIMELINE STRUCTURE
═══════════════════════════════════════════════════════════

The timeline is a vertical scrolling view.
Most recent dates at TOP, oldest at BOTTOM.

Visual structure:
LEFT SIDE: A thin vertical line (1px, stone-200) running down the page,
           with small dots (8px circle, stone-300) at each year marker.
RIGHT SIDE (or full-width on mobile): Content grouped by Year → Month

═══════════════════════════════════════════════════════════
TIMELINE ITEMS — MEMORY CARDS (4 types, design all of them)
═══════════════════════════════════════════════════════════

Each card: white bg, rounded-xl, p-4, shadow-sm, border border-stone-50
On hover: shadow-md, translateY(-1px)

--- TYPE A: PHOTO MEMORY ---
- Photo: rounded-lg, max-height 240px mobile / 320px desktop
- Date: text-sm, stone-500
- "原始记录" badge: text-xs, bg-stone-100, text-stone-500, rounded-full
- Annotation text: text-sm, stone-700, with left border amber-200
- Annotator: tiny avatar + name + role, text-xs, stone-400

--- TYPE B: VIDEO MEMORY ---
Same as photo, but:
- Thumbnail has centered play button overlay (48px, semi-transparent white circle)
- Duration badge: "02:34" at bottom-right of thumbnail (bg-black/50, white text, text-xs)

--- TYPE C: AUDIO/VOICE MEMORY ---
- Inline audio player (no popup)
- Waveform: simplified bar visualization (amber-200 bars, amber-600 for played portion)
- Play button: circle, amber-700, white triangle icon
- This type is the most emotionally charged — design with extra care

--- TYPE D: TEXT MEMORY ---
- No media, just text content
- Text displayed in a slightly indented/quoted style
- Stone-50 background or left-border accent to distinguish

═══════════════════════════════════════════════════════════
TIMELINE EMPTY STATE
═══════════════════════════════════════════════════════════

- Centered content below the profile header
- Illustration: gentle timeline line with dotted circles
- Text: "这里还很安静" (text-lg, stone-500)
- Subtext: "上传第一张照片，开始守护这段记忆" (text-sm, stone-400)
- CTA: "上传记忆 →" (amber-700 button)

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Desktop (1280px) — full timeline with header + year groups showing all 4 card types
2. Mobile (375px) — same content, cards full-width
3. Empty state variant
```

***

### Prompt 4/10: Auth Pages — 注册/登录

```
Same brand context.

Design the REGISTER and LOGIN pages for 忆锚.

EMOTIONAL CONTEXT:
This may be the user's first interaction after deciding they want to preserve
memories. They're likely in a vulnerable emotional state. The registration
should feel welcoming and safe, NOT like a corporate onboarding flow.

═══════════════════════════════════════════════════════════
PAGE LAYOUT (shared between register and login)
═══════════════════════════════════════════════════════════

Desktop: Two-column layout
- LEFT (50%): Warm brand panel
  - stone-50 or subtle amber-50 gradient background
  - "忆锚" logo centered or top-left
  - Large emotional text: "守护关于 TA 的真实记忆"
  - Below: subtle abstract illustration
  - Bottom of panel: "不做AI合成，只保存真实记录" (text-sm, stone-400)

- RIGHT (50%): Form panel
  - white background, px-8 py-12
  - Form content centered, max-width 400px

Mobile: Form only, no left panel

═══════════════════════════════════════════════════════════
REGISTER PAGE — form content
═══════════════════════════════════════════════════════════

Title: "创建账号" (text-2xl, font-semibold, stone-900)
Subtitle: "开始守护你珍贵的记忆" (text-sm, stone-500, mt-1)

Form fields:
1. "邮箱地址" → email input
2. "密码" → password input (with show/hide toggle)
3. "确认密码" → password input

Privacy consent (mt-6):
- Checkbox + text: "我已阅读并同意《隐私政策》和《用户协议》"
- ★ IMPORTANT: The checkbox must be clearly visible and unchecked by default.
  The register button is DISABLED until checkbox is checked.

Trust statement: "你的数据只属于你。我们不做AI合成，不投广告。"

Register button: "注册" (full-width, amber-700 bg, white text)
- Disabled state: opacity-50, cursor-not-allowed

Divider: "────── 或 ──────"

OAuth buttons (future):
- "使用微信登录" (outline button, grayed)
- "使用 Google 登录" (outline button)

Bottom: "已有账号？登录 →" (text-sm, amber-700)

═══════════════════════════════════════════════════════════
LOGIN PAGE — form content
═══════════════════════════════════════════════════════════

Title: "欢迎回来" (text-2xl, font-semibold, stone-900)
Subtitle: "你守护的记忆在等着你" (text-sm, stone-500)

Form fields:
1. "邮箱地址" → email input
2. "密码" → password input

"忘记密码？" link (text-sm, amber-700, right-aligned)
Login button: "登录" (full-width, amber-700)

Bottom: "还没有账号？注册 →" (text-sm, amber-700)

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Register page — desktop (two-column) and mobile
2. Login page — desktop (two-column) and mobile
3. Show the disabled button state when checkbox unchecked
```

***

### Prompt 5/10: Profile Create/Edit Form

```
Same brand context.

Design the PROFILE CREATION FORM — where users set up a memorial profile
for a deceased loved one.

EMOTIONAL CONTEXT:
This is potentially the most emotionally charged moment in the product.
The user is formally creating a digital memorial space for someone they lost.
The form must be gentle, unhurried, and respectful.

═══════════════════════════════════════════════════════════
PAGE LAYOUT
═══════════════════════════════════════════════════════════

Centered form, max-width 560px, py-8 px-4
Background: stone-50

Page title: "为 TA 建一个记忆空间" (text-2xl, font-semibold, stone-900, center)
Subtitle: "你可以随时修改这些信息" (text-sm, stone-400, center)

═══════════════════════════════════════════════════════════
FORM FIELDS (generous spacing, gap-6)
═══════════════════════════════════════════════════════════

FIELD 1 — Avatar upload (centered)
- 96px circle, dashed border
- Camera icon center
- "上传头像" below
- After upload: shows photo with "更换" overlay on hover

FIELD 2 — Type selector
- Label: "TA 是"
- Two option cards:
  Card A: 🧑 "亲人/朋友"
  Card B: 🐾 "宠物"
- Default: none selected
- Selected: amber-700 border, amber-50 bg

FIELD 3 — Name
- Label: "TA 的名字"
- Input placeholder: "如：爷爷 / 张建国 / 小橘"
- Helper text: "可以是称呼、全名或昵称"

FIELD 4 — Relationship
- Label: "TA 是你的"
- Input placeholder: "如：爷爷 / 父亲 / 猫咪 / 朋友"

FIELD 5 — Birth date
- Label: "出生日期"
- Date input OR three dropdowns (year/month/day)
- Helper text: "不确定也没关系，可以只填年份" ★

FIELD 6 — Death date
- Label: "离开日期"
- Same format as birth date
- Helper text: "可以只填年份"

FIELD 7 — One-line description
- Label: "用一句话记住 TA"
- Textarea placeholder: "如：永远笑眯眯的老爷子 / 最爱晒太阳的小胖橘"
- Character count: "0/50"

═══════════════════════════════════════════════════════════
SUBMIT AREA
═══════════════════════════════════════════════════════════

Submit button: "创建记忆空间" (amber-700, full-width)
Below: "创建后你可以开始上传照片、视频和语音"

DESIGN NOTES:
- Error messages should be warm: "请填写名字，让我们知道这段记忆属于谁"
- The overall form should feel calm and unhurried

DELIVERABLES:
1. Desktop (centered, 560px form)
2. Mobile (full-width)
3. Show filled-in state with sample data for "爷爷 · 张建国"
4. Show type selector in both states
```

***

### Prompt 6/10: ProfileCard — 独立组件精细化

```
Same brand context.

Design a PROFILE CARD component in higher detail than the dashboard overview.

CRITICAL DESIGN PRINCIPLE:
"It should look like a PERSON, not a FOLDER."

═══════════════════════════════════════════════════════════
CARD VARIANTS — design all 3
═══════════════════════════════════════════════════════════

VARIANT A — Full card with cover photo:
Dimensions: responsive column width, min-height ~280px
- Cover photo area (blurred, dimmed to 60%)
- Avatar overlapping: 72px circle, border-4 border-white
- Name: "爷爷 · 张建国"
- Dates: "1945 — 2023"
- Description: "永远笑眯眯的老爷子"
- Stats bar: "📷210  🎬12  🎤50    👨‍👩‍👧 4位"

VARIANT B — Card without cover photo:
Same structure but top 40% is gentle gradient instead of photo.

VARIANT C — Pet card:
- Name: "小橘" (no surname)
- Dates: "2016 — 2024"
- Description: "最爱晒太阳的小胖橘"
- Pet icon/paw next to name

═══════════════════════════════════════════════════════════
HOVER STATE
═══════════════════════════════════════════════════════════

- transform: translateY(-2px)
- box-shadow: elevated from shadow-sm to shadow-md
- transition: 200ms ease-out
- Subtle scale on avatar (1.0 → 1.02)

═══════════════════════════════════════════════════════════

DELIVERABLES:
Show all 3 variants side by side (desktop),
and variant A on mobile (375px).
```

***

### Prompt 7/10: Timeline Memory Item — 四种类型

```
Same brand context.

Design the TIMELINE ITEM CARDS in detail — individual memory entries
in the vertical timeline.

CONTEXT:
Each card represents one real memory. The "原始记录" badge is critical —
it must be visible but NOT loud.

═══════════════════════════════════════════════════════════
CARD BASE STYLES (shared)
═══════════════════════════════════════════════════════════

- Background: white
- Border: 1px stone-100
- Border-radius: 16px (rounded-xl)
- Padding: 16px
- Shadow: shadow-sm default, shadow-md on hover
- Transition: 200ms ease-out

═══════════════════════════════════════════════════════════
TYPE 1: PHOTO MEMORY
═══════════════════════════════════════════════════════════

- Photo: rounded-lg, max-height 320px, object-cover
- Date + badge on same line
- "原始记录" badge: right-aligned, bg-stone-100 text-stone-500 text-xs
- Annotation: left border 2px amber-200, text in 「」
- Annotator: 24px avatar + name + role + date

═══════════════════════════════════════════════════════════
TYPE 2: VIDEO MEMORY
═══════════════════════════════════════════════════════════

Same as photo, but:
- Semi-transparent play button overlay (centered, 56px)
- Duration badge: "02:34" bottom-right (bg-stone-900/60, white text)

═══════════════════════════════════════════════════════════
TYPE 3: AUDIO / VOICE MEMORY
═══════════════════════════════════════════════════════════

This is often "the last voice message from dad." Design with extra care.

- Background: stone-50 rounded-lg p-4
- Play button: 40px circle, amber-700 bg, white triangle
- Waveform: ~30 bars, stone-200 (unplayed), amber-500 (played)
- Duration: text-sm stone-400, right side

═══════════════════════════════════════════════════════════
TYPE 4: TEXT NOTE
═══════════════════════════════════════════════════════════

- Background: stone-50 rounded-lg p-5
- Text: text-base stone-700 leading-relaxed
- Chinese quotation marks 「」
- Slightly more literary feeling

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. All 4 types at desktop width (~600px)
2. All 4 types at mobile width (375px, full bleed)
3. Show them stacked vertically with timeline line on left
```

***

### Prompt 8/10: Empty States — 三种场景

```
Same brand context.

Design 3 EMPTY STATE screens for 忆锚.
Empty states are critical because they're often the first thing new users see.
A cold "no data" message would feel devastating. Each must feel like a warm invitation.

═══════════════════════════════════════════════════════════
EMPTY STATE A — No profiles yet (Dashboard)
═══════════════════════════════════════════════════════════

Layout: Centered, max-width 400px

- Illustration: empty picture frame on shelf, warm line drawing, stone-300
- Heading: "为你想守护的人" (text-xl, stone-700)
- Subheading: "建一个记忆空间" (text-xl, stone-500)
- Description: "把散落各处的照片、视频、语音消息收集到一起，
  编织成一条永不丢失的时间线。" (text-sm, stone-400)
- CTA: "创建第一个记忆空间" (amber-700 button)
- Button animation: subtle breathing glow, cycle 3s

═══════════════════════════════════════════════════════════
EMPTY STATE B — No memories yet (Timeline)
═══════════════════════════════════════════════════════════

Context: Profile exists but nothing uploaded yet.

Layout: Centered in timeline area, max-width 360px

- Illustration: vertical timeline with 3 dotted circles, one has tiny "+"
- Heading: "这里还很安静" (text-lg, stone-500)
- Description: "上传第一张照片或一段语音，
  开始守护关于爷爷的记忆。" (text-sm, stone-400)
- CTA: "上传记忆 →" (amber-700 button)
- Note: "爷爷" is dynamically inserted

═══════════════════════════════════════════════════════════
EMPTY STATE C — No family members yet
═══════════════════════════════════════════════════════════

Context: Inline prompt in timeline page header (~320px)

- Style: amber-50 bg, rounded-lg, p-4, border border-amber-100
- Icon: 👨‍👩‍👧 or people outline icon (amber-600, 24px)
- Text: "邀请家人一起守护这段记忆" (text-sm, stone-700)
- Subtext: "每个人的回忆视角都是珍贵的拼图" (text-xs, stone-400)
- CTA: "邀请 →" (text-sm, amber-700, font-medium)

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Empty State A — desktop and mobile
2. Empty State B — desktop and mobile
3. Empty State C — ~320px inline
```

***

### Prompt 9/10: Invite Dialog — 邀请家人弹窗

```
Same brand context.

Design the INVITE FAMILY DIALOG — modal when clicking "邀请家人" on timeline.

CONTEXT:
Family collaboration is the core growth engine.
The invitation flow must be: low friction, emotionally motivated,
include ready-to-copy WeChat message.

═══════════════════════════════════════════════════════════
DIALOG DESIGN
═══════════════════════════════════════════════════════════

Trigger: "邀请家人" button
Dialog: centered modal, max-width 480px, rounded-xl, p-6
Overlay: bg-black/40, backdrop-blur-sm
Animation: fade-in + slide-up from bottom (200ms)

HEADER:
- Title: "邀请家人一起守护" (text-xl, font-semibold, stone-900)
- Subtitle: "为「爷爷」的记忆空间邀请家人加入"
  ★ "爷爷" is dynamic — uses the profile name

STEP 1 — SELECT ROLE:
- Label: "选择权限"
- Two cards side by side:

  Card A (default selected): "✏️ 可编辑"
  Card B: "👁️ 仅查看"

  Selected: amber-700 border, amber-50 bg
  Unselected: stone-200 border, white bg

STEP 2 — COPY INVITE LINK:
- Generated link display with copy button
- Input-like style: bg-stone-50, border border-stone-200

STEP 3 — COPY SHARE MESSAGE (WeChat optimization):
- Pre-written message in amber-50 box
- "发送给家人的消息（可直接粘贴到微信）"
- "复制全部" button

BOTTOM:
- "完成" button (stone-200 bg text button)
- Helper text: "家人点击链接后注册即可加入"

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Dialog on desktop (centered, with overlay)
2. Dialog on mobile (bottom sheet style, slides up from bottom)
3. Show "复制全部" success state (button shows "✓ 已复制")
```

***

### Prompt 10/10: Invite Accept Page — 接受邀请

```
Same brand context.

Design the INVITE ACCEPTANCE PAGE — what family member sees when clicking
the invite link shared via WeChat.

CONTEXT:
They may or may not have a 忆锚 account.
This page must: immediately show who they're invited to remember,
clearly state who invited them, make joining effortless.

═══════════════════════════════════════════════════════════
PAGE LAYOUT
═══════════════════════════════════════════════════════════

Background: stone-50
Centered card: max-width 440px, white bg, rounded-2xl, shadow-md, p-8
Vertical centering on viewport

Top: "忆锚" small logo (text-lg, stone-900)

═══════════════════════════════════════════════════════════
CARD CONTENT
═══════════════════════════════════════════════════════════

1. AVATAR OF DECEASED (centered): 80px circle, border-4 border-stone-100
2. DECEASED NAME: "爷爷 · 张建国" (text-xl, font-semibold, stone-900)
3. DATES: "1945 — 2023" (text-sm, stone-400)
4. ONE-LINE DESCRIPTION: "永远笑眯眯的老爷子" (text-sm, stone-600, italic)

5. INVITATION MESSAGE (amber-50 bg, rounded-lg, p-4):
   "小雨 邀请你一起守护这段记忆"
   "你将可以：查看所有记忆，上传照片和录音，添加注释"
   ★ Based on role (editor shows all, viewer shows only "查看")

6. CTA AREA:
   IF logged in: "加入记忆空间" (amber-700 button, full-width)
   IF not logged in: "注册并加入" + "已有账号？登录 →"

7. TRUST LINE: "忆锚只保存真实记录，不做AI合成，你的数据只属于你"

═══════════════════════════════════════════════════════════
MOBILE OPTIMIZATION
═══════════════════════════════════════════════════════════

This page WILL be opened in WeChat's in-app browser most of the time.
WeChat browser quirks:
- Viewport ~375px but ~44px lost to navigation bar
- Card should not require scrolling on iPhone SE (375x667)
- Remove card shadow and border — full-bleed white on stone-50

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Desktop — centered card on stone-50
2. Mobile — optimized for WeChat in-app browser
3. Both states: logged-in user, not-logged-in user
```

***

### Prompt 补充: Settings Page — 设置与导出

```
Same brand context.

Design the SETTINGS PAGE for 忆锚.

This page has two purposes:
1. Account management
2. DATA EXPORT — this must be the MOST PROMINENT element.
   "Export" is a trust promise. It must feel like a guarantee, not an afterthought.

═══════════════════════════════════════════════════════════
SECTION 1 — DATA EXPORT (TOP, most prominent)
═══════════════════════════════════════════════════════════

★ This is intentionally the FIRST section, before account settings.

Card: white bg, rounded-xl, p-6, border-2 border-amber-200
(The amber border makes it stand out — this is the trust anchor)

- Icon: 📦 or download icon (amber-700, 32px)
- Title: "你的数据，随时带走" (text-lg, font-semibold, stone-900)
- Description: "一键下载你的全部数据——照片、视频、语音、注释，
  打包成 ZIP 文件。标准格式，不依赖任何平台。"

- Export options:
  For each profile:
  [avatar] 爷爷 · 327条记忆    [导出 ↓]
  [avatar] 小橘 · 89条记忆     [导出 ↓]
                            [导出全部数据 ↓]

- "导出" button: outline style, amber-700 text
- "导出全部数据": amber-700 solid button

═══════════════════════════════════════════════════════════
SECTION 2 — ACCOUNT SETTINGS
═══════════════════════════════════════════════════════════

Card: white bg, rounded-xl, p-6

Subsections:
A) 邮箱: [user@email.com] — read only, with "更改" link
B) 密码: ●●●●●●●● — with "更改密码" link
C) 通知设置: 纪念日提醒 [toggle on/off]

═══════════════════════════════════════════════════════════
SECTION 3 — DANGER ZONE (bottom)
═══════════════════════════════════════════════════════════

Card: white bg, rounded-xl, p-6, border border-red-100

- Title: "删除账号" (text-base, font-medium, red-700)
- Description: "删除后 30 天内可恢复，之后将永久删除所有数据。
  建议先导出数据。"
- Button: "删除我的账号" (outline, red-600 border, red-600 text)

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Desktop and mobile
2. Show "exporting" state (spinner + "正在打包...")
3. Show "export complete" state ("✓ 下载完成")
```

---

## 四、新增Prompt（补充缺失页面）

### Prompt 11/14: Reminders 纪念日提醒页

```
Same brand context.

Design the REMINDERS PAGE — where users manage memorial dates (birthdays, anniversaries)
and conduct memorial ceremonies (lighting candles, viewing "memories of this day").

═══════════════════════════════════════════════════════════
PAGE LAYOUT
═══════════════════════════════════════════════════════════

Background: stone-50
Centered content, max-width 800px, py-8 px-4

Page title: "纪念日" (text-2xl, font-semibold, stone-900)
Subtitle: "重要的日子，永恒的守护" (text-sm, stone-500)

═══════════════════════════════════════════════════════════
UPCOMING CEREMONIES BANNER
═══════════════════════════════════════════════════════════

If memorial date is approaching (within 7 days), show a prominent banner:

┌─────────────────────────────────────────────────────────┐
│ 🕯️ 后天是爷爷的生日（农历二月初三）                        │
│                                                         │
│ "永远记得他笑着说'来来来，吃饺子'"                         │
│                                                         │
│  [点亮蜡烛]  [查看这天的记忆]                             │
└─────────────────────────────────────────────────────────┘

Style: amber-50 bg, rounded-xl, border amber-100, p-6
Candle emoji: subtle glow animation (CSS keyframe, infinite loop, opacity 0.7→1)

"点亮蜡烛" button: ghost variant → clicking:
- Button changes to "🕯️ 蜡烛已点亮" (amber-700 text)
- Confetti or gentle warm particles animation (subtle)
- Session remembers this state

═══════════════════════════════════════════════════════════
CEREMONY EXPERIENCE (after clicking "点亮蜡烛")
═══════════════════════════════════════════════════════════

Full-screen overlay (or large modal):
- Dark background (stone-900/95) with backdrop-blur
- Center: Large candle illustration with animated flame (CSS keyframe)
- Below candle: "爷爷 · 张建国" (text-xl, stone-50)
- Below name: "1945 — 2023 · 生日" (text-sm, stone-400)
- Below that: "永远笑眯眯的老爷子" (text-base, stone-300, italic)
- Bottom: "这天留下的记忆" with thumbnail grid of memories from this date
- Close button: X (stone-400, top-right)

Candle animation:
- Flame: warm gradient (amber-500 to amber-300)
- Gentle sway: transform rotate(-2deg → 2deg), 3s infinite ease-in-out
- Glow: box-shadow pulse, amber-500/30 to amber-500/60

═══════════════════════════════════════════════════════════
REMINDER LIST
═══════════════════════════════════════════════════════════

Cards for each memorial date, sorted by upcoming date first:

Card A — Upcoming:
- Left: Date badge "后天" or "3月16日" (amber-100 bg, amber-700 text, rounded-full)
- Center:
  - Name: "爷爷的生日" (text-base, font-semibold, stone-900)
  - Type: "农历 · 二月初三" (text-sm, stone-500)
  - Description: "永远记得他笑着说'来来来，吃饺子'" (text-sm, stone-600, italic)
- Right:
  - Toggle: "提醒我" (enabled/disabled)
  - Edit icon button (ghost)

Card B — Past:
- Same layout but muted colors
- "已过" label instead of countdown

Card C — Add new:
- Dashed border card, centered "+ 添加纪念日"
- Opens form with fields:
  - Name: "如：爷爷的生日" / "爸爸妈妈的结婚纪念日"
  - Date type: 阳历 / 农历 toggle
  - Date picker
  - Description: optional note

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Desktop — full page with banner + list
2. Mobile — same, stacked layout
3. Ceremony overlay — candle animation + memories
4. Add/edit reminder form states
```

***

### Prompt 12/14: Family 家庭管理页

```
Same brand context.

Design the FAMILY MANAGEMENT PAGE — where users manage family members
who have joined the memorial space, their roles, and permissions.

═══════════════════════════════════════════════════════════
PAGE LAYOUT
═══════════════════════════════════════════════════════════

Background: stone-50
Centered content, max-width 800px, py-8 px-4

Page title: "家人" (text-2xl, font-semibold, stone-900)
Subtitle: "共同守护这段记忆" (text-sm, stone-500)

═══════════════════════════════════════════════════════════
FAMILY MEMBER LIST
═══════════════════════════════════════════════════════════

Section: "已加入的家人" (text-sm, stone-500, uppercase tracking)

Each member card:

┌─────────────────────────────────────────────────────────┐
│ [Avatar 48px]  小雨（女儿）                              │
│                                                         │
│ 角色: ✏️ 可编辑                                         │
│                                                         │
│ 加入时间: 2024年1月15日                                 │
│                                                         │
│ [更改权限 ▼]  [移除]                                    │
└─────────────────────────────────────────────────────────┘

Card style: white bg, rounded-xl, p-5, border stone-100
Hover: shadow-sm, border-stone-200

ROLE BADGE:
- "owner": bg-amber-50, text-amber-700, rounded-md
- "editor": bg-emerald-50, text-emerald-700, rounded-md
- "viewer": bg-stone-100, text-stone-500, rounded-md

ROLE CHANGE DROPDOWN:
Options:
- "可编辑" (current: editor)
- "仅查看" (viewer)
- Separator
- "移除此成员" (red-600 text)

═══════════════════════════════════════════════════════════
PENDING INVITATIONS
═══════════════════════════════════════════════════════════

If there are pending invitations (invite sent but not accepted):

Section: "等待中" (text-sm, stone-500, uppercase tracking)

Card:
┌─────────────────────────────────────────────────────────┐
│ 📧 已发送至: sister@example.com                          │
│ 角色: ✏️ 可编辑                                         │
│ 状态: 等待接受                                          │
│                                                         │
│ [重新发送]  [取消邀请]                                   │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════
INVITE NEW MEMBER BUTTON
═══════════════════════════════════════════════════════════

Primary button: "邀请家人" (amber-700)
Clicking opens the Invite Dialog (from Prompt 9/10)

═══════════════════════════════════════════════════════════
JOIN REQUESTS (if enabled for viewer invites)
═══════════════════════════════════════════════════════════

If someone requested to join (for private spaces):
- Show request card with avatar, name, message
- Approve / Reject buttons

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Desktop — list layout with role badges
2. Mobile — same, full-width cards
3. Role change dropdown states
4. Invite dialog trigger
```

***

### Prompt 13/14: Memory Detail 记忆详情页

```
Same brand context.

Design the MEMORY DETAIL PAGE — full-screen view of a single memory,
with annotation editing and family contributions.

═══════════════════════════════════════════════════════════
PHOTO/VIDEO FULL-SCREEN VIEW
═══════════════════════════════════════════════════════════

Background: stone-900 (dark, for focus on media)
Full viewport, centered content

CLOSE BUTTON:
- Top-left or top-right: "✕" (white, 24px, ghost button)
- On mobile: also show back arrow "←"

MEDIA DISPLAY:
For photos:
- Image centered, max-height 80vh, max-width 90vw
- Object-fit: contain (to see full image)
- Click/tap to toggle zoom (future feature)

For videos:
- Video player with custom controls
- Play/pause, timeline scrubber, volume, fullscreen
- Autoplay on load (muted initially)

═══════════════════════════════════════════════════════════
MEMORY INFO PANEL
═══════════════════════════════════════════════════════════

Position: bottom of screen, slides up from bottom
Background: white/95 with backdrop-blur
Max-height: 40vh, scrollable
Padding: p-6

CONTENT:
┌─────────────────────────────────────────────────────────┐
│ 10月1日 · 📷 照片 · [原始记录]                           │
│                                                         │
│ "国庆节全家最后一次聚餐"                                 │
│                                                         │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ [小雨 avatar 32px] 小雨（女儿）· 2024年1月15日         │
│                                                         │
│ [添加注释...]                                            │
└─────────────────────────────────────────────────────────┘

ANNOTATION AREA:
- Show all annotations in chronological order
- Each annotation:
  - Avatar + name + role badge
  - Annotation text in 「」 quotes
  - Timestamp
  - Edit/Delete buttons (only for own annotations)

ADD ANNOTATION INPUT:
- Textarea: "写下你的回忆..." (stone-300 placeholder)
- Character count (if limit exists)
- Submit button: amber-700, "添加注释"
- Cancel: ghost button

═══════════════════════════════════════════════════════════
METADATA (expandable section)
═══════════════════════════════════════════════════════════

"详细信息 ▼" expandable toggle

When expanded:
- 文件名: IMG_2847.jpg
- 上传时间: 2024年1月15日 14:32
- 文件大小: 2.4 MB
- 拍摄时间: 2023年10月1日 12:30
- 拍摄设备: iPhone 15 Pro

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Photo memory — full-screen with info panel
2. Video memory — with custom player
3. Annotation display and add states
4. Metadata expandable section
5. Mobile: bottom sheet style for info panel
```

***

### Prompt 14/14: Upload 上传页

```
Same brand context.

Design the UPLOAD PAGE — for uploading photos, videos, voice messages,
and importing from WeChat.

═══════════════════════════════════════════════════════════
PAGE LAYOUT
═══════════════════════════════════════════════════════════

Background: stone-50
Centered content, max-width 800px, py-8 px-4

Page title: "上传记忆" (text-2xl, font-semibold, stone-900)
Subtitle: "为「爷爷」添加新的记忆" (text-sm, stone-500)

═══════════════════════════════════════════════════════════
UPLOAD ZONE (drag & drop area)
═══════════════════════════════════════════════════════════

Large dashed border area (min-height 300px):
- Center: Upload icon (CloudUpload, amber-600, 64px)
- Text: "拖拽照片、视频或语音到这里" (text-lg, stone-600)
- Subtext: "或点击选择文件" (text-sm, stone-400)

Supported formats:
"支持：JPG、PNG、HEIC、视频（MP4）、音频（M4A、WAV）"
(text-xs, stone-400, mt-4)

BROWSE FILES BUTTON:
"选择文件" (amber-700 outline button)

DRAG ACTIVE STATE:
When dragging files over:
- Border: dashed amber-400
- Background: amber-50/30
- Icon: animated bounce

═══════════════════════════════════════════════════════════
UPLOAD SOURCE OPTIONS
═══════════════════════════════════════════════════════════

Below the main upload zone, show source options:

┌─────────────────────────────────────────────────────────┐
│ 其他上传方式                                            │
├─────────────────────────────────────────────────────────┤
│ �薇 💬 微信聊天记录导入    →                            │
│ 📱 从手机相册选择        →                            │
│ ☁️  从云盘导入          →                            │
└─────────────────────────────────────────────────────────┘

Style: white bg, rounded-xl, border stone-200, p-4

WeChat Import:
- Opens WeChatExporter flow (future feature)
- For now: show "即将推出" badge

═══════════════════════════════════════════════════════════
BATCH UPLOAD LIST
═══════════════════════════════════════════════════════════

After selecting files, show upload list:

File card:
┌─────────────────────────────────────────────────────────┐
│ [Thumbnail 64px]  photo.jpg                           │
│                                                         │
│ 2.4 MB · JPG                                          │
│                                                         │
│ ✓ 已选择                                               │
└─────────────────────────────────────────────────────────┘

Multiple files shown in a scrollable list (max-height 400px)

EACH FILE HAS:
- Checkbox (selected by default)
- Thumbnail preview
- Filename (truncated if long)
- File size + type
- Remove button (X, top-right)

BOTTOM ACTIONS:
- "全选" / "取消全选"
- Selected count: "已选择 12 项"
- "上传全部" (amber-700 button, full-width)
  - Disabled if no files selected

═══════════════════════════════════════════════════════════
DATE ASSIGNMENT
═══════════════════════════════════════════════════════════

After selecting files, before upload:

DATE ASSIGNMENT PANEL:
┌─────────────────────────────────────────────────────────┐
│ 为这些记忆选择日期                                       │
│                                                         │
│ 选项1: 自动读取EXIF日期  ✓                            │
│  （从照片/视频中提取）                                  │
│                                                         │
│ 选项2: 手动指定日期                                     │
│  [日期选择器]                                          │
│                                                         │
│ 选项3: 设为"日期未知"                                  │
│                                                         │
│ [取消]          [确认上传]                              │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════
UPLOAD PROGRESS
═══════════════════════════════════════════════════════════

During upload:

File card with progress:
┌─────────────────────────────────────────────────────────┐
│ [Thumbnail]  photo.jpg                                  │
│                                                         │
│ ████████████░░░░░░░░░░░░░  45%                        │
│                                                         │
│ 上传中...                                               │
└─────────────────────────────────────────────────────────┘

Complete state:
┌─────────────────────────────────────────────────────────┐
│ [Thumbnail]  photo.jpg                                  │
│                                                         │
│ ✓ 已上传                                               │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════
UPLOAD COMPLETE
═══════════════════════════════════════════════════════════

After all uploads complete:

Success banner:
┌─────────────────────────────────────────────────────────┐
│ ✓ 已成功上传 12 项记忆                                  │
│                                                         │
│ [查看时间线]  [继续上传]                                │
└─────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Desktop — drag & drop zone + file list
2. Mobile — same, full-width
3. Upload progress states
4. Date assignment panel
5. Upload complete confirmation
```

---

## 五、AI Studio 追加Prompt

当在 Stitch 中选完方案后，在 AI Studio 中追加这段 prompt：

```
Convert this design to production-ready React component code.

STRICT TECHNICAL REQUIREMENTS:
1. TypeScript with explicit prop interfaces
2. Tailwind CSS utility classes (no custom CSS unless absolutely necessary)
3. Mobile-first: base styles for 375px, use sm:, md:, lg: for larger screens
4. Use CSS custom properties for colors where possible:
   --color-primary: #b45309 (amber-700)
   --color-background: #fafaf9 (stone-50)
   --color-foreground: #1c1917 (stone-900)
   --color-muted: #57534e (stone-600)
5. All interactive elements must have hover and focus states
6. Include ARIA labels for accessibility
7. Use Lucide React icons (import from 'lucide-react')
8. Font: font-sans for everything (resolves to Inter/system-ui)
9. NO inline styles, NO styled-components, NO CSS modules
10. Export as a named export, NOT default export

COMPONENT STRUCTURE:
- One component per code block
- Props interface at the top
- Component function below
- If there are sub-components, keep them in the same file

DO NOT:
- Use any UI library other than plain HTML + Tailwind
- Add any state management or data fetching logic
- Use any animation library (I'll add CSS transitions later)
- Import any external images (use placeholder div with bg color)

OUTPUT FORMAT:
```tsx
// ComponentName.tsx
interface ComponentNameProps {
  // ...
}

export function ComponentName({ ... }: ComponentNameProps) {
  return (
    // JSX
  )
}
```
```

---

## 六、执行顺序

| 顺序 | Stitch Prompt | 理由 |
|------|-------------|------|
| **1** | Prompt #0 Design System | 视觉锚定，后续所有页面的基准 |
| **2** | Landing Page (Prompt 1) | 第一印象，设定整体视觉基调 |
| **3** | Dashboard + ProfileCard (Prompt 2+6) | 登录后主界面 |
| **4** | Timeline + TimelineItem (Prompt 3+7) | 核心产品体验 |
| **5** | Auth Pages (Prompt 4) | 注册/登录 |
| **6** | Profile Create Form (Prompt 5) | 创建流程 |
| **7** | Empty States (Prompt 8) | 新用户首见 |
| **8** | Invite Dialog + Accept (Prompt 9+10) | 增长引擎 |
| **9** | Settings (补充 Prompt) | 信任保障 |
| **10** | Reminders (Prompt 11) | 纪念仪式 |
| **11** | Family (Prompt 12) | 家庭管理 |
| **12** | Memory Detail (Prompt 13) | 记忆详情 |
| **13** | Upload (Prompt 14) | 上传功能 |

---

## 七、与现有代码冲突说明

| 组件 | Stitch Prompt | 现有实现 | 状态 |
|------|--------------|----------|------|
| **HeroSection** | "永不丢失关于 TA 的真实记忆" | "永不丢失" (更短) | ⚠️ 需对齐文案 |
| **ValueProps** | Lucide Icons (line style) | 现有组件用 SVG icons | ⚠️ 需确认 |
| **ProfileCard** | 有完整的3种变体设计 | 已实现 | ✅ 一致 |
| **TimelineItem** | 4种类型(photo/video/audio/text) | 已实现 | ✅ 一致 |
| **SourceBadge** | "原始记录" badge | 已实现 | ✅ 一致 |

**处理建议：**
- 在进行相关组件重构时，按 Stitch Prompt 规范对齐
- 新开发页面严格遵循本手册的 Design System

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| 1.0 | 2026-04-15 | 初版，基于 stitch-A + stitch-B 合并 |
