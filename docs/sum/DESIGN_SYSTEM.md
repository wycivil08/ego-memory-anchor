# DESIGN_SYSTEM — ego-memory-anchor (忆锚)

> Color palette, typography, spacing, component specifications, accessibility.

---

## 1. Design Principles

| Principle | Description |
|-----------|-------------|
| **Warm & Restrained** | Generous whitespace. Reference Linear.app's simplicity + Notion's warmth |
| **Emotional Tone** | Quiet companionship, not tech coolness. This is a memorial space, not a tool dashboard |
| **Component Library** | All UI components use shadcn/ui, never hand-written from scratch |

### 1.1 Forbidden Colors
- **No pure black** `#000000`
- **No pure white** `#FFFFFF`

---

## 2. Color Palette (CSS Variables)

### 2.1 Core Palette (in `globals.css`)

```css
--background: 30 20% 98%;        /* Warm white - stone-50 */
--foreground: 30 10% 15%;         /* Warm black - stone-900 */
--muted: 30 15% 94%;             /* Light warm gray - stone-100 */
--muted-foreground: 30 10% 45%;   /* Medium gray - stone-500 */
--primary: 25 60% 45%;           /* Warm brown/amber - amber-700 */
--primary-foreground: 30 20% 98%;
--accent: 30 15% 92%;            /* stone-100 equivalent */
--accent-foreground: 30 10% 20%;
--destructive: 0 72% 51%;         /* Red - only for delete actions */
--border: 30 15% 88%;
--ring: 25 60% 45%;
```

### 2.2 Semantic Colors

| Token | Usage | Hex Approx |
|-------|-------|------------|
| `background` | Page background | `#FAFAF8` |
| `foreground` | Primary text | `#27251F` |
| `muted` | Secondary backgrounds | `#F2F1EE` |
| `muted-foreground` | Secondary text | `#78716C` |
| `primary` | Buttons, links, accents | `#B45309` (amber-700) |
| `accent` | Hover states, highlights | `#F5F4F1` |
| `destructive` | Delete buttons only | `#DC2626` |
| `border` | Dividers, card borders | `#E7E5E4` |

### 2.3 Accessibility Compliance

| Text Color | Contrast Ratio | WCAG Level |
|------------|----------------|------------|
| `text-stone-500` (muted-foreground) | 4.5:1 | **AA** ✓ |
| `text-stone-400` | 2.47:1 | **Fail** ✗ |
| `text-amber-800` (primary) | 5.2:1 | **AA** ✓ |

> **Critical:** Use `text-stone-500` or darker for body text. Never use `text-stone-400` for readable content.

---

## 3. Typography

### 3.1 Font Stack

| Language | Font | Notes |
|----------|------|-------|
| Chinese | `system-ui` | PingFang SC (iOS) / Source Han Sans (Android) |
| English/Numbers | `Inter` | Via `next/font` |
| Headings | `text-2xl font-semibold tracking-tight` | |
| Body | `text-base leading-relaxed` | |
| Secondary | `text-sm text-muted-foreground` | |

### 3.2 Type Scale

| Size | Class | Usage |
|------|-------|-------|
| Page title | `text-3xl font-bold tracking-tight` | Landing page headers |
| Section heading | `text-2xl font-semibold tracking-tight` | Page section titles |
| Card title | `text-lg font-semibold` | Profile names, card headers |
| Body | `text-base leading-relaxed` | Paragraphs, descriptions |
| Secondary | `text-sm` | Captions, metadata |
| Small | `text-xs` | Badges, timestamps |

---

## 4. Spacing Rhythm

| Scenario | Spacing |
|---------|---------|
| Page padding | `px-4 sm:px-6 lg:px-8` |
| Card padding | `p-6` |
| Card gap | `gap-4 sm:gap-6` |
| Section gap | `space-y-8` |
| Form field gap | `space-y-4` |
| Page max width | `max-w-4xl mx-auto` (timeline), `max-w-lg mx-auto` (forms) |

---

## 5. Border Radius

| Element | Radius |
|---------|--------|
| Cards | `rounded-xl` |
| Buttons | `rounded-lg` |
| Inputs | `rounded-md` |
| Avatars | `rounded-full` |

---

## 6. Shadows

| Element | Shadow |
|---------|--------|
| Cards (default) | `shadow-sm` |
| Cards (hover) | `hover:shadow-md transition-shadow` |
| Modals | `shadow-xl` |
| **Forbidden** | `shadow-2xl` and larger |

---

## 7. Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| All transitions | `transition-all duration-200 ease-in-out` | — | Default for interactive elements |
| List item load | Stagger fade-in (50ms delay per item) | — | Timeline loading |
| Toast | Slide in from top-right, 3s auto-dismiss | — | Notifications |
| Candle light | `opacity 0→1 + subtle sway (CSS keyframe, infinite)` | — | CeremonyBanner |

### 7.1 Forbidden Animations
- `bounce`
- `shake`
- `spin`
- `scale-bounce`

---

## 8. SourceBadge Specification

### 8.1 Appearance

```css
/* Badge */
background: stone-100
text: stone-500
border: stone-200
shape: rounded-full

/* Text */
content: "原始记录" (hardcoded, not configurable)
```

### 8.2 Placement
- Inside `TimelineItem` card, next to date
- On `MemoryDetail` page, near metadata

### 8.3 Behavior
- **Not clickable**
- **Not editable**
- **Hover shows tooltip:** "此内容为用户上传的原始真实记录，未经任何修改"

### 8.4 SourceBadge Full Info Format

```
原始记录 · {uploader_name} · {date}
```

Example: `原始记录 · 王小明 · 2023年10月1日`

---

## 9. CeremonyBanner Specification

### 9.1 Appearance

| Element | Style |
|---------|-------|
| Background | `bg-amber-50` |
| Left icon | Candle icon (amber-700) |
| Text | `text-amber-900` |
| Layout | Left: candle icon, Center: text + memory thumbnail, Right: "点亮蜡烛" button |

### 9.2 Trigger Conditions
- `reminder_date` within ±3 days of today
- Session has not dismissed banner

### 9.3 Candle Animation

```css
@keyframes candle-flicker {
  0%, 100% { opacity: 1; transform: scale(1); }
  25% { opacity: 0.95; transform: scale(1.02); }
  50% { opacity: 1; transform: scale(0.98); }
  75% { opacity: 0.97; transform: scale(1.01); }
}

.candle-lit {
  animation: candle-flicker 2s ease-in-out infinite;
}
```

### 9.4 Dismiss Behavior
- X button on right side
- Stores dismissal in session (not persisted)
- Reappears on next relevant date

---

## 10. Input Specifications

### 10.1 Text Input

```tsx
<input
  className="w-full bg-stone-100 border-none rounded-lg py-3 px-4
             focus:ring-0 focus:bg-white border-b-2 border-transparent
             focus:border-amber-700 transition-all text-sm outline-none"
/>
```

### 10.2 Select Input

```tsx
<select
  className="w-full bg-stone-100 border-none rounded-lg py-3 px-4
             focus:ring-0 focus:bg-white border-b-2 border-transparent
             focus:border-amber-700 transition-all text-sm outline-none
             appearance-none cursor-pointer"
/>
```

### 10.3 Date Input

```tsx
<input
  type="date"
  className="... cursor-pointer [color-scheme:light]"
/>
```

### 10.4 Form Label

```tsx
<label className="text-[11px] uppercase tracking-widest font-semibold
                  text-stone-500 block px-1">
  Label Text <span className="text-amber-600">*</span>
</label>
```

---

## 11. Button Specifications

### 11.1 Primary Button

```tsx
<button className="w-full bg-amber-800 text-white font-bold py-4 rounded-lg
                  shadow-lg shadow-amber-800/20
                  hover:bg-amber-900 transition-all active:scale-[0.98]
                  flex items-center justify-center gap-2">
  {icon && <Icon className="w-5 h-5" />}
  Button Text
</button>
```

### 11.2 Secondary Button

```tsx
<button className="w-full sm:w-1/3 bg-stone-100 text-stone-600 font-bold py-4
                  rounded-lg hover:bg-stone-200 transition-all
                  flex items-center justify-center">
  Button Text
</button>
```

### 11.3 Ghost Button

```tsx
<button className="text-stone-500 hover:text-stone-700 transition-colors">
  Text
</button>
```

### 11.4 Destructive Button

```tsx
<button className="bg-red-600 text-white hover:bg-red-700 ...">
  Delete
</button>
```

---

## 12. Card Specifications

### 12.1 Profile Card (Dashboard)

```tsx
<div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow
                border border-stone-100">
  {/* Avatar */}
  {/* Name + relationship */}
  {/* Memory count stats */}
  {/* Family count */}
  {/* Description */}
</div>
```

### 12.2 Timeline Item Card

```tsx
<div className="bg-white rounded-xl overflow-hidden shadow-sm
                border border-stone-100 hover:shadow-md transition-shadow">
  {/* Media thumbnail / inline player */}
  {/* Date + SourceBadge */}
  {/* Annotation preview */}
  {/* Contributor avatar */}
</div>
```

---

## 13. Avatar Specifications

| Size | Class | Usage |
|------|-------|-------|
| Small | `w-8 h-8` | User menu, contributor |
| Medium | `w-12 h-12` | Family member list |
| Large | `w-24 h-24` | Profile avatar, cover |

### 13.1 Avatar Shape
- Always `rounded-full` (circular)

### 13.2 Fallback
- First character of name
- `bg-amber-100 text-amber-800`

---

## 14. Empty States

### 14.1 Warm Invitation Copy

```tsx
// Timeline empty
<p className="text-stone-500">这里还没有记忆，你可以随时添加</p>

// Dashboard empty
<p className="text-stone-500">为你想守护的人，建一个记忆空间</p>

// Memory empty
<p className="text-stone-400">还没有任何内容</p>
```

---

## 15. Accessibility

### 15.1 Color Contrast
- All text must meet **WCAG AA** (4.5:1 ratio)
- Use `text-stone-500` minimum for body text

### 15.2 Heading Hierarchy
- Page titles: `h1`
- Section titles: `h2`
- Card titles: `h3`
- Never skip levels

### 15.3 Focus States
- All interactive elements must have visible focus indicator
- Use `focus:ring-2 focus:ring-amber-700 focus:ring-offset-2`

### 15.4 ARIA Labels
- Icon-only buttons must have `aria-label`
- Form inputs must have associated `<label>`

### 15.5 Lighthouse Targets
| Metric | Target |
|--------|--------|
| Accessibility | > 90 |
| SEO | > 90 |

---

## 16. Responsive Breakpoints

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Mobile | `< 768px` | Single column, bottom nav |
| Tablet | `768px - 1024px` | Sidebar collapsed |
| Desktop | `> 1024px` | Full sidebar + content |

---

## 17. Component Checklist

Before shipping any component:
- [ ] Renders in mobile viewport (375px)
- [ ] Renders in desktop viewport (1280px)
- [ ] Hover states for all interactive elements
- [ ] Focus states for keyboard navigation
- [ ] Loading state (skeleton or spinner)
- [ ] Empty state (warm, inviting copy)
- [ ] Error state (clear, actionable message)
- [ ] Color contrast meets WCAG AA
- [ ] No hardcoded strings (use i18n if multilingual)
