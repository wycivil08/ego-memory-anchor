```markdown
# Design System Specification: The Warm Editorial Standard

## 1. Overview & Creative North Star
**Creative North Star: "The Resonant Archive"**
This design system rejects the cold, sterile nature of modern SaaS interfaces in favor of a "Warm Editorial" aesthetic. It is inspired by high-end archival journals and premium lifestyle boutiques. The goal is to create a digital environment that feels **dignified, calm, and grounded.** 

We move beyond the "template" look by embracing **Tonal Layering** and **Intentional Breathing Room**. Instead of using rigid lines to box content, we use the natural weight of typography and subtle shifts in surface luminosity to guide the eye. This is not just an interface; it is a curated experience that feels established and trustworthy.

---

## 2. Colors: The Amber & Stone Palette
The color strategy avoids the harshness of pure blacks and whites. We utilize a sophisticated range of "Stone" neutrals and a glowing "Amber" to create a sense of sun-drenched permanence.

### Core Tones
*   **Primary (#903f00 / #b45309):** Used sparingly for intentional focus. It represents the "Signature" of the brand.
*   **Background (#f9f9f8):** A soft, "eggshell" foundation that reduces eye strain compared to pure white.
*   **On-Surface (#1a1c1c):** A deep charcoal-stone, providing high legibility without the jarring contrast of #000000.

### The "No-Line" Rule
**Designers are prohibited from using 1px solid borders for sectioning.** 
Structural boundaries must be defined solely through background color shifts. To separate a header from a body, or a sidebar from a feed, transition from `surface` to `surface-container-low`. The interface should feel like a single, cohesive piece of fine paper with varying elevations, not a series of disconnected boxes.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following hierarchy for depth:
1.  **Base Layer:** `surface` (#f9f9f8)
2.  **Sectioning:** `surface-container-low` (#f3f4f3)
3.  **Content Cards:** `surface-container-lowest` (#ffffff - restricted to card interiors only)
4.  **Interactive Elements:** `surface-container-high` (#e8e8e7)

### Signature Textures (The Glass & Gradient Rule)
To add "soul," use a soft radial gradient on hero sections or primary CTAs:
*   *From:* `primary` (#903f00) *To:* `primary_container` (#b45309).
*   **Glassmorphism:** For floating navigation or modals, use `surface` at 80% opacity with a `backdrop-blur-md` (12px-16px). This integrates the element into the environment rather than "pasting" it on top.

---

## 3. Typography: Editorial Authority
The type system pairs the utilitarian precision of **Inter** (for English/Numbers) with the sophisticated legibility of **System-UI/PingFang SC** (for Chinese).

*   **Display (3.5rem - 2.25rem):** Use `display-lg` and `display-md` for hero statements. Tighten letter-spacing (-0.02em) to give it a "printed" feel.
*   **Headlines (2rem - 1.5rem):** Use these for major section starts. Headlines should always be `on_surface`.
*   **Body (1rem - 0.75rem):** Use `body-lg` for primary reading. Ensure a line-height of 1.6 for maximum breathability and a "calm" reading experience.
*   **Labels (0.75rem - 0.6875rem):** Always uppercase with increased letter-spacing (+0.05em) when used for metadata or category tags to ensure they don't get lost.

---

## 4. Elevation & Depth: Tonal Layering
Traditional shadows and borders are "visual noise." We achieve depth through atmospheric light.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container` background. The slight shift in luminosity creates a "soft lift" that feels natural and premium.
*   **Ambient Shadows:** If an element must float (e.g., a dropdown), use a shadow with a 20px-40px blur and only 4-6% opacity. The shadow color should be tinted with `primary` (e.g., `rgba(144, 63, 0, 0.06)`).
*   **The "Ghost Border" Fallback:** If a border is required for accessibility, use `outline_variant` at 20% opacity. Never use 100% opaque borders.

---

## 5. Components: Tactile & Refined

### Buttons
*   **Primary:** `rounded-lg` (1rem). Background `primary`, text `on_primary`. Use a subtle inner-shadow (top-down) to give a pressed-ink feel.
*   **Secondary:** `surface-container-high`. No border. This provides a tactile, "button-like" feel without the aggression of a primary color.
*   **Tertiary:** Ghost style. `on_surface_variant` text. High-contrast hover state using `surface-container-low`.

### Cards & Lists
*   **Cards:** `rounded-xl` (1.5rem). **Prohibit dividers.** Separate content items within a card using 24px-32px of vertical white space (the "Breathable Gap").
*   **Selection Chips:** `rounded-full`. When active, use `primary_fixed` (#ffdbca) with `on_primary_fixed` (#331200) text.

### Input Fields
*   **Style:** Minimalist. Use `surface-container-low` as the background. On focus, the background transitions to `surface_bright` with a 2px "Signature" underline in `primary`.

### Navigation (The Signature Floating Bar)
Avoid a top-to-bottom header. Use a floating navigation bar centered at the top or bottom with a `surface` glassmorphism effect and a `rounded-full` shape.

---

## 6. Do's and Don'ts

### Do:
*   **Do** use asymmetrical layouts. A text block on the left balanced by white space on the right feels more "Editorial" than a centered box.
*   **Do** use `stone-100` and `stone-200` equivalent tokens for subtle background variations.
*   **Do** ensure all interactive states (hover/active) use a luminosity shift rather than a color change to maintain calmness.

### Don't:
*   **Don't** use pure #000000 or #FFFFFF. It breaks the "Warm" promise.
*   **Don't** use standard 1px borders. They feel "clinical" and "bootstrap."
*   **Don't** use "Flashy" animations. All transitions should be `ease-in-out` with a duration between 200ms and 400ms—mimicking the deliberate turning of a page.
*   **Don't** crowd the interface. If you are unsure, add 16px of extra padding. Space is a luxury; use it.```