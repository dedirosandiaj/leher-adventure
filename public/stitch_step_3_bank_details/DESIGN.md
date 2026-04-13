# Editorial Fintech: Design System Specification

## 1. Overview & Creative North Star
The Creative North Star for this design system is **"The Translucent Authority."** 

In the world of merchant management and fintech, "trust" is often misinterpreted as "rigidity." This system challenges that by blending the authoritative weight of editorial typography with the fluid, transparent nature of the modern digital landscape. We move away from the "boxed-in" feeling of traditional B2B dashboards. Instead, we embrace a layout that feels curated and expansive, using the vibrant energy of the brand's pink-to-red gradients to guide the merchant through the onboarding journey with clinical precision and high-end elegance.

The experience is defined by intentional asymmetry—using large, staggered typography and overlapping surface layers that mimic physical sheets of fine stationery and frosted glass.

---

## 2. Colors
Our palette is rooted in a high-chroma primary core, balanced by sophisticated, cool-toned neutrals that ensure a professional B2B atmosphere.

### The Palette (Material Convention)
- **Primary High-Action:** `primary` (#b90040) and `primary_container` (#e70052). Use these for high-intent actions.
- **Surface Neutrals:** `surface` (#f8f9fb), `surface_container_low` (#f2f4f6), and `surface_container_highest` (#e0e3e5).
- **Functional Tones:** `error` (#ba1a1a) for critical alerts; `secondary` (#546067) for utilitarian metadata.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections or containers. Visual boundaries must be established through background color shifts. For example, a card using `surface_container_lowest` (#ffffff) should sit on a section background of `surface_container_low` (#f2f4f6). This creates a "soft edge" that feels integrated and premium rather than boxed.

### The "Glass & Gradient" Rule
To echo the brand's visual identity, high-impact components (like the Progress Stepper or Scoring Indicators) should utilize the **Signature Texture**: a linear gradient from `primary` (#b90040) to `primary_container` (#e70052). For floating navigational elements, apply Glassmorphism: use `surface_container_lowest` at 80% opacity with a `20px` backdrop blur.

---

## 3. Typography
We use a dual-typeface system to achieve an editorial feel. **Manrope** provides a geometric, modern authority for high-level information, while **Inter** ensures maximum legibility for dense merchant data.

*   **Display & Headlines (Manrope):** Use `display-lg` (3.5rem) and `headline-lg` (2rem) for onboarding welcome screens and major section headers. The wide tracking and geometric forms convey a sense of modern fintech stability.
*   **Titles & Body (Inter):** Use `title-md` (1.125rem) for form labels and `body-md` (0.875rem) for instructional text. 
*   **The Editorial Scale:** Create high contrast between titles and body text. Use `on_surface_variant` (#5e3f3e) for subheaders to create a tonal hierarchy that guides the eye without relying on bold weights.

---

## 4. Elevation & Depth
In this system, depth is a functional tool, not a decorative one.

### The Layering Principle
Hierarchy is achieved by "stacking" surface tiers. 
- **Base Level:** `surface` (#f8f9fb)
- **Content Sections:** `surface_container_low` (#f2f4f6)
- **Interactive Cards:** `surface_container_lowest` (#ffffff)

### Ambient Shadows
Shadows must be invisible but felt. When a merchant interacts with a form card, apply a shadow with a `32px` blur, `0%` spread, and `4%` opacity using a tint of `on_surface` (#191c1e). It should feel like a soft glow of light, not a drop shadow.

### The "Ghost Border" Fallback
If accessibility requirements demand a border (e.g., in high-contrast modes), use a **Ghost Border**: `outline_variant` (#e8bcbb) at **15% opacity**. Never use 100% opaque borders.

---

## 5. Components

### Progress Steppers
- **Style:** Use a horizontal "Bar" approach rather than circles.
- **Active State:** A gradient fill (`primary` to `primary_container`) with a `full` (9999px) roundedness.
- **Inactive State:** `surface_container_highest` (#e0e3e5).
- **Labeling:** Use `label-md` in `on_surface_variant` for upcoming steps.

### Form Cards
- **Structure:** Use `surface_container_lowest` (#ffffff) with `xl` (0.75rem) corner radius.
- **Spacing:** Use `spacing-8` (2rem) for internal padding to provide "breathing room" typical of high-end B2B apps.
- **Separation:** Forbid dividers. Use `spacing-6` (1.5rem) of vertical white space to separate form groups.

### Scoring Indicators (Risk/Verification Score)
- **Visual:** A semi-circular gauge using a thick stroke (8px). 
- **Coloring:** Use the `primary` gradient for high scores. For lower scores, use `secondary_container` (#d7e4ec) to maintain a professional, non-alarmist tone.
- **Typography:** Center the score using `headline-lg` in `on_primary_fixed_variant` (#910030).

### Buttons
- **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` (#ffffff) text, `md` (0.375rem) roundedness.
- **Secondary:** `surface_container_high` (#e6e8ea) background with `primary` text. No border.
- **Tertiary:** Pure text using `label-md` with `primary` coloring and an underline on hover only.

### Input Fields
- **Default:** `surface_container_lowest` background with a `Ghost Border` (15% opacity `outline_variant`). 
- **Focus State:** Increase border opacity to 40% and add a subtle `2px` outer glow using `primary_fixed` (#ffd9dc).
- **Error State:** Border becomes `error` (#ba1a1a) at 50% opacity.

---

## 6. Do's and Don'ts

### Do
- **Do** use `spacing-12` and `spacing-16` for page margins to create an "Editorial" wide-margin look.
- **Do** overlap elements slightly (e.g., a header text overlapping a background gradient shape) to break the "grid" feel.
- **Do** use `surface_bright` for tooltips to make them pop against darker container backgrounds.

### Don't
- **Don't** use pure black (#000000) for text. Always use `on_surface` (#191c1e) to maintain a softer, high-end feel.
- **Don't** use standard `1px` dividers. If a visual break is needed, use a `1px` height `surface_container_highest` (#e0e3e5) bar that only spans 80% of the container width.
- **Don't** use "Alert Red" for everything. Reserve `error` for blocking issues; use `tertiary` (#9b3d37) for warnings to keep the interface feeling calm and trustworthy.