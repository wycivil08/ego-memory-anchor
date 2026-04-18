# 工作流核查 + Stitch 完整 Prompt 集

***

## 一、工作流核查结论

Agent 概括的工作流 **基本准确**，但有几处需要修正/补充：

| 步骤                         | Agent 描述      | 核查结论                                                                                              | 修正                     |
| -------------------------- | ------------- | ------------------------------------------------------------------------------------------------- | ---------------------- |
| Step 1: Stitch 出图          | ✅ 正确          | 准确                                                                                                | —                      |
| Step 2: Build in AI Studio | ⚠️ **过于简化**   | Stitch 的 "Build in AI Studio" 按钮实际是将设计上下文传递给 Gemini，但 **不是一键出完美代码**。你仍需在 AI Studio 里追加技术约束 prompt | 补充 AI Studio 追加 prompt |
| Step 3: Claude Code 改造     | ✅ 正确          | 准确                                                                                                | —                      |
| Step 4: Claude Vision QA   | ⚠️ **依赖截图工具** | Claude Vision 需要你提供截图，agent 建议用 Playwright 自动截图是对的，但需确认项目已安装 Playwright                           | 确认工具链                  |
| Step 5: 微交互                | ✅ 正确          | 准确                                                                                                | —                      |
| 简化路径                       | ✅ 正确          | 简单组件跳过 Stitch 直接 Claude Code 是对的                                                                  | —                      |

**一个被遗漏的关键点：**

> **Stitch 对中文的处理能力有限。** 你在 Stitch 中可能需要用英文描述 + 标注实际中文文案，然后在 Claude Code 阶段替换。实际测试中，Stitch 能渲染中文但排版细腻度不如英文。所以 **Stitch 的产出是"布局方向+视觉氛围"，不是最终的中文排版方案**。

***

## 二、Stitch Prompt 总规划

根据项目文档，需要 Stitch 设计的页面/组件共 **10 个主要项**：

```echarts
{
  "tooltip": { "trigger": "item" },
  "series": [{
    "type": "treemap",
    "width": "95%",
    "height": "85%",
    "breadcrumb": { "show": false },
    "label": { "fontSize": 11, "formatter": "{b}" },
    "upperLabel": { "show": true, "height": 30 },
    "data": [
      {
        "name": "页面级 (Stitch 必做)",
        "value": 60,
        "itemStyle": { "color": "#b45309", "borderColor": "#fff", "borderWidth": 2 },
        "children": [
          { "name": "1. Landing Page\n完整页面", "value": 20 },
          { "name": "2. Dashboard\n主工作台", "value": 12 },
          { "name": "3. Timeline\n时间线页", "value": 15 },
          { "name": "4. Auth Pages\n注册/登录", "value": 8 },
          { "name": "5. Settings\n设置+导出", "value": 5 }
        ]
      },
      {
        "name": "组件级 (Stitch 推荐)",
        "value": 30,
        "itemStyle": { "color": "#d97706", "borderColor": "#fff", "borderWidth": 2 },
        "children": [
          { "name": "6. ProfileCard\n档案卡片", "value": 8 },
          { "name": "7. TimelineItem\n时间线条目", "value": 8 },
          { "name": "8. EmptyStates\n空状态", "value": 6 },
          { "name": "9. InviteDialog\n邀请弹窗", "value": 4 },
          { "name": "10. InviteAccept\n接受邀请页", "value": 4 }
        ]
      },
      {
        "name": "跳过 Stitch (直接 Claude Code)",
        "value": 10,
        "itemStyle": { "color": "#a8a29e", "borderColor": "#fff", "borderWidth": 2 },
        "children": [
          { "name": "SourceBadge", "value": 3 },
          { "name": "RoleBadge", "value": 2 },
          { "name": "ExportButton", "value": 2 },
          { "name": "Footer", "value": 3 }
        ]
      }
    ]
  }]
}
```

***

## 三、通用设计上下文（每个 Stitch Prompt 的前缀）

以下这段文字在每个 Prompt 开头使用，**只需粘贴一次**（Stitch 有对话记忆），后续组件可以说 "same brand context as before"：

```
BRAND CONTEXT — "忆锚" (Memory Anchor / yì máo)

WHAT IT IS:
A memorial platform where families preserve REAL memories (photos, videos, 
voice messages, chat logs) of deceased loved ones and pets. 
It is NOT an AI resurrection tool. It does NOT generate fake content. 
It only stores authentic, original records.

TARGET USERS:
Chinese families aged 25-45 who recently lost a parent, grandparent, or pet.
80%+ access via mobile phone. Primary market: Mainland China + overseas Chinese.

BRAND PERSONALITY:
- Warm, dignified, calm, trustworthy
- Like walking into a quiet room filled with old photographs
- Like opening a family album on a rainy afternoon
- Respectful of grief — never performative, never flashy

DESIGN LANGUAGE:
- Visual style: Between Linear.app's clean minimalism and Notion's warmth
- Generous whitespace — let content breathe
- Subtle, not decorative
- Typography-driven hierarchy (not icon-heavy)
- Illustrations: abstract, warm, no real human faces

COLOR SYSTEM (strict):
- Primary accent: amber-700 (#b45309) — used sparingly for CTAs and highlights
- Secondary accent: amber-50 (#fffbeb) — light background for featured sections
- Neutral base: stone palette:
  - Background: stone-50 (#fafaf9) — warm off-white, NOT pure white
  - Card surface: white (#ffffff) with subtle stone-200 (#e7e5e4) borders
  - Primary text: stone-900 (#1c1917)
  - Secondary text: stone-600 (#57534e)
  - Muted text: stone-400 (#a8a29e)
- NEVER use: pure black (#000000), pure white (#ffffff) as background, 
  saturated blue, red, or green
- Dark section: stone-900 (#1c1917) — used only for CTA banner

TYPOGRAPHY:
- Chinese: system-ui (renders as PingFang SC on Apple, Source Han Sans on Android)
- English/Numbers: Inter
- Heading scale: text-4xl (hero) → text-2xl (section) → text-xl (card) → text-base (body)
- Line height: relaxed (1.625) for body, tight (1.25) for headings
- Letter spacing: tracking-tight for headings, normal for body

SPACING SYSTEM:
- Page horizontal padding: 16px mobile / 24px tablet / 32px desktop
- Section vertical spacing: 80px mobile / 96px desktop  
- Card internal padding: 24px
- Card gap: 16px mobile / 24px desktop
- Consistent 4px grid

CORNER RADIUS:
- Cards: 16px (rounded-xl)
- Buttons: 12px (rounded-lg)
- Avatars: full circle
- Input fields: 8px (rounded-md)

SHADOWS:
- Default cards: shadow-sm (subtle)
- Hover state: shadow-md (gentle lift)
- No dramatic drop shadows

MOBILE-FIRST:
- Base design at 375px width
- Show tablet (768px) and desktop (1280px) adaptations
- Touch targets minimum 44x44px
- Bottom-heavy navigation on mobile
```

***

## 四、10 个 Stitch Prompt（可直接复制使用）

***

### Prompt 1/10: Landing Page — 完整页面

```
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
  (text-sm, stone-600)

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
   翻遍了旧手机、微信聊天、云盘、家人的相册。
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
Same brand context as the landing page.

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
       (half overlapping into content area)

2. CONTENT AREA (below cover, p-6, pt-10 to accommodate avatar):
   - Name: "爷爷" (text-lg, font-semibold, stone-900, center)
   - Full name below: "张建国" (text-sm, stone-500, center)
   - Dates: "1945 — 2023" (text-sm, stone-400, center)
   - One-line description: "永远笑眯眯的老爷子" 
     (text-sm, stone-600, italic, center, mt-2)
   
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
    with a subtle dot separator and "享年78岁"
  - Description: "永远笑眯眯的老爷子" (text-base, stone-600, italic)
  - Stats: "327 条记忆 · 4 位家人共同守护" (text-sm, stone-400)
- Right: Action buttons
  - Primary: "上传记忆" (amber-700 button)
  - Secondary: "邀请家人" (outline button, stone-300 border)
  - Tertiary: "···" more menu (icon button → dropdown: edit profile, export, etc.)

Layout (mobile):
- Avatar centered (80px)
- All text centered below
- Action buttons full-width, stacked:
  - "上传记忆" (full-width amber button)
  - "邀请家人 · 编辑档案" (full-width row of text links)

═══════════════════════════════════════════════════════════
TIMELINE STRUCTURE
═══════════════════════════════════════════════════════════

The timeline is a vertical scrolling view.
Most recent dates at TOP, oldest at BOTTOM.
(Users naturally want to see the latest/last memories first)

Visual structure:

LEFT SIDE: A thin vertical line (1px, stone-200) running down the page,
           with small dots (8px circle, stone-300) at each year marker.

RIGHT SIDE (or full-width on mobile): Content grouped by Year → Month

═══════════════════════════════════════════════════════════
YEAR HEADER
═══════════════════════════════════════════════════════════

- Large year number: "2023" (text-3xl, font-bold, stone-200 — watermark style)
  OR "2023年" in a more integrated design
- Positioned along the timeline line
- Feels like a chapter divider in a book

═══════════════════════════════════════════════════════════
MONTH SUBHEADER
═══════════════════════════════════════════════════════════

- "10月" (text-lg, font-semibold, stone-700)
- Optional: number of memories in that month "3 条记忆"
- Subtle horizontal line or just spacing

═══════════════════════════════════════════════════════════
TIMELINE ITEMS — MEMORY CARDS (4 types, design all of them)
═══════════════════════════════════════════════════════════

Each card: white bg, rounded-xl, p-4, shadow-sm, border border-stone-50
On hover: shadow-md, translateY(-1px)

--- TYPE A: PHOTO MEMORY ---
┌─────────────────────────────────────────────┐
│ [Photo thumbnail — rounded-lg, 16:9 ratio]  │
│                                             │
│ 10月1日                    [原始记录] badge  │
│                                             │
│ "国庆节全家最后一次聚餐"                     │
│                                             │
│ [小雨's avatar 24px] 小雨（女儿）添加了注释  │
└─────────────────────────────────────────────┘

- Photo: fills card width, rounded-lg top corners, max-height 240px, object-cover
- Date: text-sm, stone-500
- "原始记录" badge: text-xs, bg-stone-100, text-stone-500, 
  rounded-full, px-2 py-0.5, positioned at top-right of info area
- Annotation text: text-sm, stone-700, in "quotation marks" 
  with slight left border (2px amber-200) or italic
- Annotator: tiny avatar + name + role, text-xs, stone-400

--- TYPE B: VIDEO MEMORY ---
Same layout as photo, but:
- Thumbnail has a centered play button overlay (48px, semi-transparent white circle 
  with triangle)
- Duration badge: "02:34" at bottom-right of thumbnail (bg-black/50, white text, text-xs)
- Label: "📹 视频" next to date (optional, if needed for clarity)

--- TYPE C: AUDIO/VOICE MEMORY ---
┌─────────────────────────────────────────────┐
│ 🎤  ▶  ━━━━━━━━━━━━━━━━━━━━━  00:12        │
│     [waveform visualization bar]             │
│                                             │
│ 10月3日 · 微信聊天记录        [原始记录]      │
│                                             │
│ "这是爸爸最后发给我的语音"                    │
│                                             │
│ [小雨's avatar] 小雨（女儿）                  │
└─────────────────────────────────────────────┘

- Audio player: INLINE, no popup needed
- Waveform: simplified bar visualization (amber-200 bars, amber-600 for played portion)
- Play button: circle, amber-700, white triangle icon
- Duration: text-xs, stone-400
- Source label: "微信聊天记录" — text-xs, stone-400
- This type is the most emotionally charged — design it with care

--- TYPE D: TEXT MEMORY ---
┌─────────────────────────────────────────────┐
│ 📝                                          │
│                                             │
│ "爸爸说他年轻时候最喜欢在河边钓鱼，          │
│  每次钓到大鱼都要拍张照片炫耀。"              │
│                                             │
│ 9月15日                      [原始记录]      │
│                                             │
│ [小明's avatar] 小明（儿子）                  │
└─────────────────────────────────────────────┘

- No media, just text content
- Text displayed in a slightly indented/quoted style
- Stone-50 background or left-border accent to distinguish from photo cards
- Emoji or icon: 📝 or a subtle quote mark

═══════════════════════════════════════════════════════════
"DATE UNKNOWN" GROUP
═══════════════════════════════════════════════════════════

At the very bottom of the timeline:
- Header: "日期未知" (text-lg, stone-400)
- Subtext: "这些记忆没有确切日期" (text-sm, stone-300)
- Cards in this group look the same but without date fields

═══════════════════════════════════════════════════════════
TIMELINE EMPTY STATE (profile exists but no memories uploaded yet)
═══════════════════════════════════════════════════════════

- Centered content below the profile header
- Illustration: gentle timeline line with dotted circles (suggesting future nodes)
- Text: "这里还很安静" (text-lg, stone-500)
- Subtext: "上传第一张照片，开始守护这段记忆" (text-sm, stone-400)
- CTA: "上传记忆 →" (amber-700 button, gentle breathing animation on border)
- Feeling: a quiet invitation, like a blank notebook waiting to be filled

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Desktop (1280px) — full timeline with header + 2023 year group showing 
   all 4 card types + "日期未知" group
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
    (text-2xl, stone-700, centered)
  - Below: a subtle abstract illustration (same style as landing page hero —
    floating photographs, warm gradient)
  - Bottom of panel: "不做AI合成，只保存真实记录" (text-sm, stone-400)

- RIGHT (50%): Form panel
  - white background, px-8 py-12
  - Form content centered, max-width 400px

Mobile: Form only, no left panel
- Top: "忆锚" small logo
- Below: form
- Background: white

═══════════════════════════════════════════════════════════
REGISTER PAGE — form content
═══════════════════════════════════════════════════════════

Title: "创建账号" (text-2xl, font-semibold, stone-900)
Subtitle: "开始守护你珍贵的记忆" (text-sm, stone-500, mt-1)

Form fields (vertical stack, gap-4):

1. "邮箱地址" label → email input (rounded-md, border-stone-200, 
   focus:ring-amber-500)
2. "密码" label → password input (with show/hide toggle icon)
3. "确认密码" label → password input

Privacy consent (mt-6):
- Checkbox + text: 
  "我已阅读并同意《隐私政策》和《用户协议》"
  (text-sm, stone-600, links in amber-700 underline)
  
  ★ IMPORTANT: The checkbox must be clearly visible and unchecked by default.
  The register button is DISABLED (opacity-50) until checkbox is checked.

Trust statement below checkbox:
"你的数据只属于你。我们不做AI合成，不投广告。" 
(text-xs, stone-400, italic)

Register button: "注册" (full-width, amber-700 bg, white text, 
rounded-lg, py-3, mt-4)
- Disabled state: opacity-50, cursor-not-allowed

Divider: "────── 或 ──────" (stone-200 lines, stone-400 text)

OAuth buttons (future, show as grayed placeholders):
- "使用微信登录" (outline button, stone-300 border, stone-500 text)
  with WeChat green icon
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
Every field is asking them to recall and record facts about a person who 
is no longer alive. The form must be gentle, unhurried, and respectful.
It should feel like carefully writing the first page of a memorial book,
NOT like filling out a government form.

═══════════════════════════════════════════════════════════
PAGE LAYOUT
═══════════════════════════════════════════════════════════

Centered form, max-width 560px, py-8 px-4
Background: stone-50

Back button: "← 返回" (text-sm, stone-500, top-left)

Page title: "为 TA 建一个记忆空间" (text-2xl, font-semibold, stone-900, center)
Subtitle: "你可以随时修改这些信息" (text-sm, stone-400, center)

═══════════════════════════════════════════════════════════
FORM FIELDS (top to bottom, generous spacing gap-6)
═══════════════════════════════════════════════════════════

FIELD 1 — Avatar upload (centered)
- 96px circle, dashed border (border-2 border-dashed border-stone-300)
- Center: camera icon (stone-400)
- Below: "上传头像" (text-sm, stone-500)
- Hover: border-amber-400, icon becomes amber-600
- After upload: shows the photo, with a small "更换" overlay on hover
- Optional — not required to proceed

FIELD 2 — Type selector
- Label: "TA 是" (text-sm, font-medium, stone-700)
- Two option cards side by side:
  Card A: 🧑 "亲人/朋友" (selected: amber-700 border, amber-50 bg)
  Card B: 🐾 "宠物" (selected: amber-700 border, amber-50 bg)
- Default: none selected
- Each card: p-4, rounded-lg, border, cursor-pointer, text-center

FIELD 3 — Name
- Label: "TA 的名字" (text-sm, font-medium, stone-700)
- Input placeholder: "如：爷爷 / 张建国 / 小橘" (stone-300)
- Helper text: "可以是称呼、全名或昵称" (text-xs, stone-400)
- Required field indicator: subtle red asterisk or required text

FIELD 4 — Relationship
- Label: "TA 是你的" (text-sm, font-medium, stone-700)
- Input placeholder: "如：爷爷 / 父亲 / 猫咪 / 朋友"
- Helper text: "这将显示在档案中" (text-xs, stone-400)

FIELD 5 — Birth date
- Label: "出生日期" (text-sm, font-medium, stone-700)
- Date input OR three dropdowns (year/month/day)
- Helper text: "不确定也没关系，可以只填年份" (text-xs, stone-400)
  ★ This helper text is important — it lowers friction for users who 
    don't know exact dates for grandparents/pets
- Optional field

FIELD 6 — Death date
- Label: "离开日期" (text-sm, font-medium, stone-700)
- Same format as birth date
- Helper text: "可以只填年份" (text-xs, stone-400)
- Optional field

FIELD 7 — One-line description
- Label: "用一句话记住 TA" (text-sm, font-medium, stone-700)
- Textarea (2 rows, expandable): 
  placeholder: "如：永远笑眯眯的老爷子 / 最爱晒太阳的小胖橘"
- Character count: "0/50" (text-xs, stone-300, right-aligned)
- Optional field

═══════════════════════════════════════════════════════════
SUBMIT AREA
═══════════════════════════════════════════════════════════

- Submit button: "创建记忆空间" (amber-700, full-width, py-3, rounded-lg)
  ★ Not just "提交" or "确认" — the label itself has meaning
- Below button: "创建后你可以开始上传照片、视频和语音" (text-xs, stone-400, center)

═══════════════════════════════════════════════════════════

DESIGN NOTES:
- Between fields, use generous spacing (gap-6 or gap-8)
- Group related fields with subtle visual cues (e.g., dates side by side)
- No field should feel "required" even if it is — use gentle validation
- Error messages should be warm: "请填写名字，让我们知道这段记忆属于谁" 
  instead of "此字段必填"
- The overall form should feel calm and unhurried

DELIVERABLES:
1. Desktop (centered, 560px form)
2. Mobile (full-width)
3. Show filled-in state with sample data for "爷爷 · 张建国"
4. Show the type selector in both states (human selected, pet selected)
```

***

### Prompt 6/10: ProfileCard — 独立组件精细化

```
Same brand context.

Design a PROFILE CARD component in higher detail than the dashboard overview.
This card appears on the Dashboard grid. It represents a deceased person's 
memorial space. 

CRITICAL DESIGN PRINCIPLE:
"It should look like a PERSON, not a FOLDER."
When the user sees this card, they should feel they're looking at someone 
they love — not at a storage container.

═══════════════════════════════════════════════════════════
CARD VARIANTS — design all 3
═══════════════════════════════════════════════════════════

VARIANT A — Full card with cover photo:
Dimensions: responsive column width, min-height ~280px
┌─────────────────────────────────┐
│                                 │  ← Cover photo area (blurred, dimmed to 60%)
│     [cover photo, 40% height]   │     gradient overlay: linear from transparent 
│                                 │     to white at bottom
│         ┌──────┐                │
│         │avatar│ ← 72px circle, │
│         │ 72px │   border-4     │
│         └──────┘   white        │
│                                 │
│    爷爷 · 张建国                │  ← text-lg font-semibold stone-900, center
│    1945 — 2023                  │  ← text-sm stone-400, center
│    "永远笑眯眯的老爷子"          │  ← text-sm stone-600 italic, center
│                                 │
│  ─────────────────────────────  │  ← border-t border-stone-50
│  📷210  🎬12  🎤50    👨‍👩‍👧 4位  │  ← text-xs stone-400, flex justify-between
└─────────────────────────────────┘

VARIANT B — Card without cover photo (avatar only):
Same structure but top 40% is a gentle gradient (stone-100 to stone-50)
instead of a photo. Avatar is more prominent.

VARIANT C — Pet card:
Same structure as Variant B, but:
- Name: "小橘" (no surname)
- Dates: "2016 — 2024"
- Description: "最爱晒太阳的小胖橘"
- Pet icon or paw print next to name instead of dot separator
- Stats: "📷 65  🎬 8  🎤 3    👤 2位"

═══════════════════════════════════════════════════════════
HOVER STATE
═══════════════════════════════════════════════════════════
- transform: translateY(-2px)
- box-shadow: elevated from shadow-sm to shadow-md
- transition: 200ms ease-out
- Subtle scale on avatar (1.0 → 1.02)
- No color change

═══════════════════════════════════════════════════════════
MOBILE ADAPTATION
═══════════════════════════════════════════════════════════
On mobile (single column):
- Card becomes full-width but maintains same vertical layout
- Minimum height can be shorter (~240px)
- Touch target: entire card is tappable

DELIVERABLES:
Show all 3 variants side by side (desktop), 
and variant A on mobile (375px).
```

***

### Prompt 7/10: Timeline Memory Item — 四种类型

```
Same brand context.

Design the TIMELINE ITEM CARDS in detail — these are individual memory entries 
that appear in the vertical timeline.

CONTEXT:
Each card represents one real memory of the deceased — a photo they appeared in,
a voice message they sent, a video taken of them, or a text note about them.
These cards must convey AUTHENTICITY and PRECIOUSNESS.

The "原始记录" (Original Record) badge is critical — it is a small, permanent 
mark that says "this content is real, unmodified, exactly as it was."
It must be visible but NOT loud — think of a museum label, quiet but authoritative.

CARD BASE STYLES (shared):
- Background: white
- Border: 1px stone-100
- Border-radius: 16px (rounded-xl)
- Padding: 16px
- Shadow: shadow-sm default, shadow-md on hover
- Transition: 200ms ease-out

═══════════════════════════════════════════════════════════
TYPE 1: PHOTO MEMORY
═══════════════════════════════════════════════════════════

Width: 100% of timeline column (~600px desktop, full-width mobile)

┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │           [Photo]                         │  │
│  │           rounded-lg                      │  │
│  │           max-height: 320px               │  │
│  │           object-fit: cover               │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  10月1日 · 📷 照片              ┌──────────┐   │
│                                 │ 原始记录  │   │
│                                 └──────────┘   │
│                                                 │
│  ┃ "国庆节全家最后一次聚餐"                      │
│  ┃                                              │
│  ← 2px left border, amber-200                   │
│                                                 │
│  [👤 24px avatar] 小雨（女儿）· 2024年1月添加    │
│                                                 │
└─────────────────────────────────────────────────┘

Photo area: 
- rounded-lg with 8px radius
- Contains the actual photo, responsive height
- Clicking opens a lightbox (not part of this design, just make it look clickable)

"原始记录" badge:
- Position: right-aligned, same line as date
- Style: bg-stone-100 text-stone-500 text-xs px-2 py-0.5 rounded-full
- NEVER bold, NEVER colored — it's quiet confidence
- Think: museum accession number

Annotation area:
- Left border: 2px solid amber-200 (or amber-100)
- Padding-left: 12px
- Text: text-sm stone-700, in Chinese quotation marks "「...」"
- This is a family member's personal note about this memory

Annotator line:
- Tiny avatar (24px), name, role in parentheses, date of annotation
- text-xs stone-400
- "小雨（女儿）· 2024年1月添加"

═══════════════════════════════════════════════════════════
TYPE 2: VIDEO MEMORY
═══════════════════════════════════════════════════════════

Same as photo, but thumbnail has:
- Semi-transparent play button overlay (centered)
  - Circle: 56px, bg-white/80, backdrop-blur
  - Triangle icon: stone-700
- Duration badge at bottom-right of thumbnail:
  - "02:34" — bg-stone-900/60 text-white text-xs px-2 py-0.5 rounded

Date line: "8月15日 · 📹 视频"

═══════════════════════════════════════════════════════════
TYPE 3: AUDIO / VOICE MESSAGE (most emotionally significant)
═══════════════════════════════════════════════════════════

This is often "the last voice message from dad." Design with extra care.

┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │  ▶   ━━━━━━━●━━━━━━━━━━━━━━━   00:12     │  │
│  │      [simplified waveform bars]            │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  10月3日 · 🎤 微信语音           ┌──────────┐  │
│                                  │ 原始记录  │  │
│                                  └──────────┘  │
│                                                 │
│  ┃ "这是爸爸最后发给我的语音"                    │
│                                                 │
│  [👤] 小雨（女儿）                               │
│                                                 │
└─────────────────────────────────────────────────┘

Audio player area:
- Background: stone-50 rounded-lg p-4
- Play button: 40px circle, amber-700 bg, white triangle
  - Playing state: amber-700 bg, white pause icon
- Waveform: 
  - Simplified bar visualization (NOT real waveform data)
  - ~30 vertical bars of varying height
  - Unplayed: stone-200
  - Played: amber-500
  - Current position: small circle indicator on the progress line
- Duration: text-sm stone-400, right side
- Time elapsed: text-sm stone-500, left side (when playing)

═══════════════════════════════════════════════════════════
TYPE 4: TEXT NOTE
═══════════════════════════════════════════════════════════

┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌───────────────────────────────────────────┐  │
│  │                                           │  │
│  │  「爸爸说他年轻时候最喜欢在河边钓鱼，      │  │
│  │    每次钓到大鱼都要拍张照片炫耀。          │  │
│  │    那时候还是胶卷相机。」                  │  │
│  │                                           │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  9月15日 · 📝 文字               ┌──────────┐  │
│                                  │ 原始记录  │  │
│                                  └──────────┘  │
│                                                 │
│  [👤] 小明（儿子）                               │
│                                                 │
└─────────────────────────────────────────────────┘

Text content area:
- Background: stone-50 rounded-lg p-5
- Text: text-base stone-700 leading-relaxed
- Chinese quotation marks 「」
- Font style: slightly more literary feeling — 
  consider serif for the quote text if available
  (or just rely on larger line-height and generous padding)

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. All 4 types at desktop width (~600px content area)
2. All 4 types at mobile width (375px, full bleed with 16px padding)
3. Show them stacked vertically as they would appear in a timeline,
   with the timeline line on the left connecting them
```

***

### Prompt 8/10: Empty States — 三种场景

```
Same brand context.

Design 3 EMPTY STATE screens for 忆锚.
Empty states are critical in this product because they're the first thing 
new users see. A cold "no data" message would feel devastating in a grief context.
Each empty state must feel like a warm invitation, not an error.

═══════════════════════════════════════════════════════════
EMPTY STATE A — No profiles yet (Dashboard)
═══════════════════════════════════════════════════════════

Context: User just registered, has no memorial profiles yet.

Layout: Centered, max-width 400px, generous vertical centering

- Illustration: 
  A simple, warm line drawing of an empty picture frame on a shelf,
  or a blank timeline with gentle dotted circles where nodes would be.
  Style: single stroke weight, stone-300 color, minimal detail.
  Size: ~160px wide.

- Heading: "为你想守护的人" (text-xl, stone-700, font-medium)
- Subheading: "建一个记忆空间" (text-xl, stone-500, font-medium)
  ★ These two lines together form one sentence, split for visual rhythm

- Description (mt-4): 
  "把散落各处的照片、视频、语音消息收集到一起，
   编织成一条永不丢失的时间线。"
  (text-sm, stone-400, text-center, max-w-sm, leading-relaxed)

- CTA (mt-6): "创建第一个记忆空间" (amber-700 button, rounded-lg, px-6 py-3)
  ★ Button should have a very subtle breathing animation:
    border glow that pulses between amber-200 and transparent, 
    cycle 3 seconds, very subtle

═══════════════════════════════════════════════════════════
EMPTY STATE B — No memories yet (Timeline page)
═══════════════════════════════════════════════════════════

Context: User created a profile for "爷爷" but hasn't uploaded anything yet.
The profile header is visible above (not part of this design), 
this empty state appears below it.

Layout: Centered in the timeline area, max-width 360px

- Illustration:
  A gentle vertical line (the timeline) with 3 dotted circles along it,
  suggesting where memories will go. The line fades at both ends.
  Color: stone-200 for line, stone-300 for circles.
  One of the circles has a tiny "+" inside it.

- Heading: "这里还很安静" (text-lg, stone-500)

- Description:
  "上传第一张照片或一段语音，
   开始守护关于爷爷的记忆。"
  (text-sm, stone-400, text-center)
  ★ Note: "爷爷" is dynamically inserted — use the profile's name

- CTA: "上传记忆 →" (amber-700 button)

- Helper text below CTA:
  "支持照片、视频、语音、文字和扫描件"
  (text-xs, stone-300)

═══════════════════════════════════════════════════════════
EMPTY STATE C — No family members yet (Timeline header area)
═══════════════════════════════════════════════════════════

Context: Shown as a small inline prompt in the timeline page header,
when no other family members have joined.

Layout: Compact card, max-width 320px, appears near "邀请家人" button

- Style: amber-50 bg, rounded-lg, p-4, border border-amber-100
- Icon: 👨‍👩‍👧 or people outline icon (amber-600, 24px)
- Text: "邀请家人一起守护这段记忆" (text-sm, stone-700)
- Subtext: "每个人的回忆视角都是珍贵的拼图" (text-xs, stone-400)
- CTA: "邀请 →" (text-sm, amber-700, font-medium)

This is NOT a full-page empty state, it's a small inline card/prompt.

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Empty State A — desktop and mobile
2. Empty State B — desktop and mobile
3. Empty State C — just one size (it's inline, ~320px)
4. Show them on their respective page backgrounds 
   (A on stone-50, B on white, C on stone-50)
```

***

### Prompt 9/10: Invite Dialog — 邀请家人弹窗

```
Same brand context.

Design the INVITE FAMILY DIALOG — a modal/dialog that appears when the user 
clicks "邀请家人" on the timeline page.

CONTEXT:
Family collaboration is the core growth engine. When User A invites their 
siblings to join "爷爷's memorial space," those siblings become new users.
The invitation flow must be:
1. Extremely low friction (no email input — Chinese users share via WeChat)
2. Emotionally motivated ("一起守护" not "share access")
3. Include a ready-to-copy message for WeChat

═══════════════════════════════════════════════════════════
DIALOG DESIGN
═══════════════════════════════════════════════════════════

Trigger: "邀请家人" button on timeline page
Dialog: centered modal, max-width 480px, rounded-xl, p-6
Overlay: bg-black/40, backdrop-blur-sm
Animation: fade-in + slide-up from bottom (200ms)

HEADER:
- Title: "邀请家人一起守护" (text-xl, font-semibold, stone-900)
- Subtitle: "为「爷爷」的记忆空间邀请家人加入"
  (text-sm, stone-500)
  ★ "爷爷" is dynamic — it uses the profile name

STEP 1 — SELECT ROLE:
- Label: "选择权限" (text-sm, font-medium, stone-700)
- Two cards side by side:

  Card A (default selected):
  ┌────────────────────┐
  │ ✏️ 可编辑           │
  │                    │
  │ 可以上传记忆、     │
  │ 添加注释           │
  │                    │
  │ ● selected         │
  └────────────────────┘

  Card B:
  ┌────────────────────┐
  │ 👁️ 仅查看          │
  │                    │
  │ 可以浏览记忆、     │
  │ 不可修改           │
  │                    │
  └────────────────────┘

  - Selected card: amber-700 border, amber-50 bg
  - Unselected: stone-200 border, white bg
  - Each card: p-3, rounded-lg, cursor-pointer

STEP 2 — COPY INVITE LINK:
After selecting role:

- Generated link display:
  ┌──────────────────────────────────────────┐
  │ https://yimao.app/invite/abc123    [复制] │
  └──────────────────────────────────────────┘
  - Input-like display: bg-stone-50, border border-stone-200, rounded-lg, p-3
  - Link text: text-sm, stone-600, truncated if too long
  - Copy button: right side, "复制" text button, amber-700

STEP 3 — COPY SHARE MESSAGE (WeChat optimization):
Below the link, a pre-written share message:

  ┌──────────────────────────────────────────┐
  │ "我在整理爷爷的照片和录音，              │
  │  邀请你一起来补充记忆。                  │
  │  点击链接加入：                          │
  │  https://yimao.app/invite/abc123"        │
  │                                [复制全部] │
  └──────────────────────────────────────────┘
  - Background: amber-50, border border-amber-100, rounded-lg, p-4
  - Label above: "发送给家人的消息（可直接粘贴到微信）" 
    (text-xs, stone-400)
  - "复制全部" button: amber-700, includes the message + link

BOTTOM:
- "完成" button: stone-200 bg text button, text-sm
  (or just clicking outside closes the dialog)
- Helper text: "家人点击链接后注册即可加入" (text-xs, stone-400, center)

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Dialog on desktop (centered in screen, with overlay)
2. Dialog on mobile (bottom sheet style, slides up from bottom, full-width)
3. Show the "复制全部" success state (button briefly shows "✓ 已复制")
```

***

### Prompt 10/10: Invite Accept Page — 接受邀请

```
Same brand context.

Design the INVITE ACCEPTANCE PAGE — what a family member sees when they 
click the invite link shared via WeChat.

CONTEXT:
The family member (e.g., "弟弟") received a WeChat message from their sister:
"我在整理爷爷的照片和录音，邀请你一起来补充记忆。
 点击链接加入：https://yimao.app/invite/abc123"

They tap the link and see this page. They may or may not have a 忆锚 account.
This page must:
1. Immediately show who they're being invited to remember (emotional connection)
2. Clearly state who invited them
3. Make joining effortless

═══════════════════════════════════════════════════════════
PAGE LAYOUT
═══════════════════════════════════════════════════════════

Background: stone-50
Centered card: max-width 440px, white bg, rounded-2xl, shadow-md, p-8
Vertical centering on viewport (or near-center with brand at top)

Top of viewport (above card):
- "忆锚" small logo (text-lg, stone-900)

═══════════════════════════════════════════════════════════
CARD CONTENT
═══════════════════════════════════════════════════════════

1. AVATAR OF DECEASED (centered):
   - 80px circle, border-4 border-stone-100
   - If no avatar: stone-100 bg with initials or generic person icon

2. DECEASED NAME:
   "爷爷 · 张建国" (text-xl, font-semibold, stone-900, center)

3. DATES:
   "1945 — 2023" (text-sm, stone-400, center)

4. ONE-LINE DESCRIPTION:
   "永远笑眯眯的老爷子" (text-sm, stone-600, italic, center, mt-1)

5. INVITATION MESSAGE (mt-6):
   Card/highlighted area: amber-50 bg, rounded-lg, p-4
   "小雨 邀请你一起守护这段记忆" 
   (text-base, stone-700, center)
   "你将可以：查看所有记忆，上传照片和录音，添加注释"
   (text-sm, stone-500, center, mt-1)

   ★ "查看" / "上传" / "添加" based on the role (editor shows all, 
   viewer shows only "查看所有记忆")

6. CTA AREA (mt-6):
   
   IF user is already logged in:
   - "加入记忆空间" (amber-700 button, full-width, py-3)
   
   IF user is NOT logged in:
   - "注册并加入" (amber-700 button, full-width, py-3)
   - "已有账号？登录 →" (text-sm, amber-700, center, mt-3)

7. TRUST LINE (mt-4):
   "忆锚只保存真实记录，不做AI合成，你的数据只属于你"
   (text-xs, stone-400, center)

═══════════════════════════════════════════════════════════
MOBILE OPTIMIZATION
═══════════════════════════════════════════════════════════

This page WILL be opened in WeChat's in-app browser most of the time.
WeChat browser quirks:
- Viewport is ~375px but with WeChat's navigation bar at top (~44px lost)
- Back button is WeChat's, not the page's
- Important: the card should not require scrolling on iPhone SE (375x667)

Mobile layout:
- Remove the card shadow and border — make it full-bleed white on stone-50
- Reduce padding to p-6
- Everything still centered vertically in available space

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Desktop — centered card on stone-50 background
2. Mobile — optimized for WeChat in-app browser viewport
3. Show both states: logged-in user, not-logged-in user
```

***

### Prompt 补充: Settings Page — 设置与导出

```
Same brand context.

Design the SETTINGS PAGE for 忆锚.

This page has two purposes:
1. Account management (profile, password, logout)
2. DATA EXPORT — this must be the MOST PROMINENT element on the page.
   "Export" is a trust promise. It must feel like a guarantee, not an afterthought.

═══════════════════════════════════════════════════════════
PAGE LAYOUT
═══════════════════════════════════════════════════════════

Centered content, max-width 640px, py-8 px-4
Background: stone-50

Page title: "设置" (text-2xl, font-semibold, stone-900)

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
  (text-sm, stone-600)

- Export options (mt-4):
  For each profile the user owns, show a row:
  
  ┌─────────────────────────────────────────────┐
  │ [avatar 32px] 爷爷 · 327条记忆    [导出 ↓]  │
  ├─────────────────────────────────────────────┤
  │ [avatar 32px] 小橘 · 89条记忆     [导出 ↓]  │
  ├─────────────────────────────────────────────┤
  │                          [导出全部数据 ↓]    │
  └─────────────────────────────────────────────┘
  
  - Each row: py-3, border-b border-stone-50
  - "导出" button: outline style, amber-700 text, rounded-lg
  - "导出全部数据": amber-700 solid button, right-aligned

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

Card: white bg, rounded-xl, p-6, border border-red-100 (subtle)

- Title: "删除账号" (text-base, font-medium, red-700)
- Description: "删除后 30 天内可恢复，之后将永久删除所有数据。
  建议先导出数据。" (text-sm, stone-500)
- Button: "删除我的账号" (outline, red-600 border, red-600 text, rounded-lg)

═══════════════════════════════════════════════════════════

DELIVERABLES:
1. Desktop and mobile
2. Show an "exporting" state (button shows spinner + "正在打包...")
3. Show the "export complete" state (button shows "✓ 下载完成")
```

***

## 五、AI Studio 追加 Prompt（Stitch → AI Studio 时使用）

当你在 Stitch 中选完方案，点击 **"Build in AI Studio"** 后，在 AI Studio 中追加这段 prompt：

````
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
  but as separate functions

DO NOT:
- Use any UI library other than plain HTML + Tailwind
  (I will convert to shadcn/ui myself later)
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
````

````

---

## 六、执行顺序建议

```echarts
{
  "tooltip": { "trigger": "item" },
  "xAxis": { "type": "category", "data": ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"], "axisLabel": { "fontSize": 11 } },
  "yAxis": { "type": "value", "show": false },
  "series": [
    {
      "name": "Stitch 设计",
      "type": "bar",
      "stack": "total",
      "data": [3, 2, 1, 0, 0],
      "itemStyle": { "color": "#b45309" },
      "label": { "show": true, "position": "inside", "formatter": "{c}个", "fontSize": 10 }
    },
    {
      "name": "AI Studio 出码",
      "type": "bar",
      "stack": "total",
      "data": [0, 2, 2, 1, 0],
      "itemStyle": { "color": "#d97706" },
      "label": { "show": true, "position": "inside", "formatter": "{c}个", "fontSize": 10 }
    },
    {
      "name": "Claude Code 集成",
      "type": "bar",
      "stack": "total",
      "data": [0, 0, 2, 3, 2],
      "itemStyle": { "color": "#3b82f6" },
      "label": { "show": true, "position": "inside", "formatter": "{c}个", "fontSize": 10 }
    }
  ],
  "legend": { "data": ["Stitch 设计", "AI Studio 出码", "Claude Code 集成"], "top": 0 },
  "grid": { "top": "15%", "bottom": "5%" }
}
````

| 顺序    | Stitch Prompt                        | 理由            |
| ----- | ------------------------------------ | ------------- |
| **1** | Landing Page (Prompt 1)              | 第一印象，设定整体视觉基调 |
| **2** | Dashboard + ProfileCard (Prompt 2+6) | 登录后主界面        |
| **3** | Timeline + TimelineItem (Prompt 3+7) | 核心产品体验        |
| **4** | Auth Pages (Prompt 4)                | 注册/登录         |
| **5** | Profile Create Form (Prompt 5)       | 创建流程          |
| **6** | Empty States (Prompt 8)              | 新用户首见         |
| **7** | Invite Dialog + Accept (Prompt 9+10) | 增长引擎          |
| **8** | Settings (补充 Prompt)                 | 信任保障          |

**关键提醒：**

* **Prompt 1 (Landing Page) 是视觉锚定**——Stitch 在这里确定的色彩/排版/氛围将成为后续所有页面的参考
* 每个 Prompt 都已包含 **实际中文文案**，Stitch 应能直接渲染
* 选完 Stitch 方案后，**截图保存**，作为后续 Claude Vision QA 的对比基准
