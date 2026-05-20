Here's the updated `DesignSystem.md` file with Framer Motion integrated throughout:

```markdown
# FitMart — Design System Reference

Use this file as context whenever designing or building any UI component, page, or screen for FitMart.

---

## Core Philosophy

**Luxury refined minimalism.** Clean, editorial, spacious. No colorful accents, no gradients, no decorative clutter. Every element earns its place. Think Arc'teryx or Apple meets fitness retail.

---

## Color Palette (Tailwind `stone-*` only)

| Role | Class | Hex | Usage |
|---|---|---|---|
| Primary / Dark BG | `stone-900` | `#1c1917` | Buttons, navbars, dark sections, hero banners, card backgrounds |
| Secondary Text | `stone-700` | `#44403c` | Subheadings, slightly muted body text |
| Muted Text | `stone-500` | `#78716c` | Labels, captions, descriptions, placeholder context |
| Borders | `stone-200` | `#e7e5e3` | Card borders, dividers, input outlines |
| Subtle Background | `stone-100` | `#f5f5f4` | Page backgrounds, tag backgrounds, hover states |
| Near-White BG | `stone-50` | `#fafaf9` | Main page background, section alternates |
| Pure White | `white` | `#ffffff` | Cards, inputs, modals, navbar (on scroll) |

### On Dark (`stone-900`) Backgrounds
| Role | Class | Usage |
|---|---|---|
| Primary text | `white` | Headings, CTAs |
| Secondary text | `stone-300` | Body copy on dark |
| Muted text | `stone-400` | Labels, captions on dark |
| Subtle elements | `stone-800` | Inner cards, dividers on dark |
| Borders on dark | `stone-700` | Borders, outlines on dark |

### Error State
| Role | Class |
|---|---|
| Error text | `text-red-600` |
| Error background | `bg-red-50` |
| Error border | `border-red-100` |

### NEVER USE
- Any color outside the `stone-*` family (no blue, green, purple, indigo, etc.)
- Gradient backgrounds
- Colored buttons (other than `stone-900` filled or `stone-*` outlined)
- `gray-*` or `neutral-*` (use `stone-*` exclusively)

---

## Typography

### Font Families
```css
/* In every file — import via style tag or index.css */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap');
```

| Role | Family | Tailwind Class |
|---|---|---|
| Display / Headings | DM Serif Display | `font-['DM_Serif_Display']` |
| Body / UI | DM Sans | `font-['DM_Sans',sans-serif]` (set on root) |

### Type Scale

| Use Case | Classes |
|---|---|
| Hero heading | `font-['DM_Serif_Display'] text-5xl md:text-7xl lg:text-8xl text-stone-900 leading-[1.05] tracking-tight` |
| Section heading | `font-['DM_Serif_Display'] text-3xl md:text-4xl text-stone-900` |
| Card heading | `font-['DM_Serif_Display'] text-xl md:text-2xl text-stone-900` |
| Body text | `text-sm text-stone-500 leading-relaxed` |
| Caption / Label | `text-xs text-stone-400` |
| Eyebrow tag | `text-xs tracking-[0.2em] uppercase text-stone-400` |
| Price display | `font-['DM_Serif_Display'] text-3xl text-stone-900` |
| Brand name | `text-[10px] tracking-[0.15em] uppercase text-stone-400` |

### Rules
- Headings always use `DM Serif Display`
- UI text, labels, buttons, inputs always use `DM Sans`
- Eyebrow labels: `text-xs tracking-[0.2em] uppercase text-stone-400` — always before section headings
- Italic in headings: use `<em className="not-italic text-stone-400">` for tonal contrast, never actual italic

---

## Spacing & Layout

| Element | Value |
|---|---|
| Max content width | `max-w-7xl mx-auto` |
| Section horizontal padding | `px-5 lg:px-10` |
| Section vertical padding | `py-16` to `py-24` |
| Large section vertical padding | `py-24` to `py-32` |
| Card internal padding | `p-6` to `p-10` |
| Gap between grid cards | `gap-4 md:gap-5` |

### Grid Layouts
- 2-col: `grid grid-cols-2 gap-4`
- 3-col: `grid md:grid-cols-3 gap-5`
- 4-col (products): `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5`

---

## Component Patterns

### Buttons

```jsx
/* Primary — filled dark */
<button className="bg-stone-900 text-white text-sm px-8 py-3 rounded-full hover:bg-stone-700 transition-colors">
  Label
</button>

/* Secondary — outlined */
<button className="border border-stone-300 text-stone-700 text-sm px-8 py-3 rounded-full hover:bg-stone-100 transition-colors">
  Label
</button>

/* Ghost — on dark background */
<button className="border border-stone-700 text-stone-300 text-sm px-6 py-2.5 rounded-full hover:bg-stone-800 transition-colors">
  Label
</button>

/* Inverted — white on dark section */
<button className="bg-white text-stone-900 text-sm px-8 py-3 rounded-full hover:bg-stone-100 transition-colors">
  Label
</button>

/* Small — inline / card action */
<button className="text-xs border border-stone-300 text-stone-700 px-4 py-2 rounded-full hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all">
  Label
</button>
```

- All buttons: `rounded-full` (pill shape)
- All buttons: `text-sm` or `text-xs`
- All buttons: `transition-colors` or `transition-all`
- NEVER use colored backgrounds on buttons

### Cards

```jsx
/* Light card */
<div className="bg-white border border-stone-200 rounded-2xl p-7 hover:border-stone-300 hover:shadow-lg transition-all duration-300">

/* Dark card */
<div className="bg-stone-900 rounded-2xl p-7">

/* Subtle card */
<div className="bg-stone-100 rounded-2xl p-7">
```

- All cards: `rounded-2xl`
- Hover: `hover:border-stone-300 hover:shadow-lg transition-all duration-300`
- Hover lift: `hover:-translate-y-1` (use sparingly)

### Inputs

```jsx
<input
  className="w-full border border-stone-200 bg-white rounded-lg px-4 py-3 text-sm text-stone-900 placeholder-stone-300 focus:outline-none focus:border-stone-900 transition-colors"
/>
```

- Shape: `rounded-lg` (inputs are slightly less round than buttons)
- Focus ring: `focus:outline-none focus:border-stone-900`
- Placeholder: `placeholder-stone-300`

### Labels (above inputs)
```jsx
<label className="block text-xs text-stone-500 mb-1.5 tracking-wide uppercase">
  Field Name
</label>
```

### Divider
```jsx
<hr className="border-stone-200" />
/* or inline with text */
<div className="flex items-center gap-3">
  <div className="flex-1 h-px bg-stone-200" />
  <span className="text-xs text-stone-400">or</span>
  <div className="flex-1 h-px bg-stone-200" />
</div>
```

### Eyebrow + Heading Pattern (use before every section)
```jsx
<p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-3">
  Section Tag
</p>
<h2 className="font-['DM_Serif_Display'] text-4xl text-stone-900">
  Section Title
</h2>
```

### Badge / Tag Pills
```jsx
/* Dark badge (e.g. "Best Seller") */
<span className="text-[10px] tracking-widest uppercase bg-stone-900 text-white px-2.5 py-1 rounded-full">
  Label
</span>

/* Light badge */
<span className="text-[10px] tracking-[0.15em] uppercase text-stone-500 border border-stone-200 px-3 py-1.5 rounded-full">
  Label
</span>
```

### Navbar Pattern
```jsx
/* Transparent → opaque on scroll */
<nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
  scrolled ? "bg-white/95 backdrop-blur-sm border-b border-stone-200" : "bg-transparent"
}`}>
```

### Pricing / Plan Cards
- Featured/highlighted plan: `bg-stone-900 text-white`
- Other plans: `bg-white border border-stone-200`
- Price: `font-['DM_Serif_Display'] text-4xl`

---

## Animation & Motion

### Framer Motion (Primary Animation Library)

**FitMart uses [Framer Motion](https://www.framer.com/motion/) as the primary animation library** for all interactive animations, page transitions, and micro-interactions. CSS animations are used only for simple, passive entrance animations.

### Installation & Setup

```bash
# Already installed in the project
npm install framer-motion
```

```jsx
// Import in any component that needs animations
import { motion, AnimatePresence } from 'framer-motion';
```

### Common Animation Variants

```jsx
// Reusable variants object
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 }
};

const scaleOnHover = {
  scale: 1.02
};

const slideInRight = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 }
};
```

### Standard Animation Patterns

#### 1. Page Entrance (Fade Up)
```jsx
import { motion } from 'framer-motion';

<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }}
  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
>
  {/* Page content */}
</motion.div>
```

#### 2. Staggered Children (List/Grid Items)
```jsx
<motion.div
  initial="hidden"
  animate="visible"
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }}
>
  {items.map(item => (
    <motion.div
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      transition={{ duration: 0.4 }}
    >
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

#### 3. Card Hover Effects
```jsx
<motion.div
  whileHover={{ y: -4, transition: { duration: 0.2 } }}
  className="bg-white border border-stone-200 rounded-2xl p-7"
>
  {/* Card content */}
</motion.div>
```

#### 4. Modal / Drawer with Exit Animation
```jsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence>
  {isOpen && (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl"
      >
        {/* Drawer content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

#### 5. Button Tap Effect
```jsx
<motion.button
  whileTap={{ scale: 0.97 }}
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.1 }}
  className="bg-stone-900 text-white px-8 py-3 rounded-full"
>
  Click Me
</motion.button>
```

#### 6. Loading Skeleton Pulse
```jsx
<motion.div
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
  className="bg-stone-100 rounded-lg h-32"
/>
```

#### 7. Scroll-Triggered Animations
```jsx
import { useInView } from 'framer-motion';
import { useRef } from 'react';

function AnimatedSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6 }}
    >
      {/* Section content */}
    </motion.div>
  );
}
```

### Animation Guidelines

| Animation Type | Duration | Easing |
|---|---|---|
| Page entrance | 0.5-0.7s | `[0.16, 1, 0.3, 1]` (custom cubic-bezier) |
| Card hover | 0.2-0.3s | `easeOut` |
| Modal/drawer | 0.3-0.4s | `spring` or `[0.16, 1, 0.3, 1]` |
| Button tap | 0.1s | `easeOut` |
| Micro-interaction | 0.15-0.2s | `easeInOut` |
| Stagger children | 0.05-0.1s delay between items | `easeOut` |

### Rules

- **Use Framer Motion for all interactive animations** (hover, tap, entrance, exit)
- **Use CSS animations only for passive entrance animations** (fade-up, slide-up) when Framer Motion might be overkill
- **Keep animations subtle** — no bouncing, elastic, or highly exaggerated motions
- **Always include exit animations** when components unmount using `AnimatePresence`
- **Prefer `transform` and `opacity` animations** for best performance (avoid layout-triggering properties like `width`, `height`, `top`, `left`)
- **Use `whileHover`, `whileTap`, `whileFocus`** for interactive elements instead of CSS `:hover`
- **Set `transition` explicitly** — never rely on defaults
- **Add `useInView` for scroll-triggered animations** to improve perceived performance
- **Don't animate everything** — only add motion when it serves a purpose (guiding attention, providing feedback, improving flow)

### Legacy CSS Animations (Use Sparingly)

Keep these only for simple, non-interactive entrance animations:

#### Standard Fade-Up (page load)
```css
.fade-up {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.fade-up.visible { opacity: 1; transform: translateY(0); }
.delay-1 { transition-delay: 0.1s; }
.delay-2 { transition-delay: 0.25s; }
.delay-3 { transition-delay: 0.4s; }
```

#### Hero Text Reveal
```css
.hero-line { overflow: hidden; }
.slide-up {
  display: inline-block;
  transform: translateY(100%);
  transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-up.visible { transform: translateY(0); }
```

> **Note:** For new components, prefer Framer Motion over CSS animations. CSS animations are only for maintaining consistency with existing code.

---

## Page Backgrounds (section alternation)

Use this rhythm when stacking sections vertically:

| Section Type | Background |
|---|---|
| Primary hero | `bg-stone-50` |
| Feature / CTA dark | `bg-stone-900` |
| Content section | `bg-white` |
| Alternate content | `bg-stone-50` |
| Subtle banner | `bg-stone-100` |

---

## Iconography

No icon libraries. Use minimal inline SVGs or plain Unicode symbols:

| Symbol | Use |
|---|---|
| `×` | Close / dismiss |
| `→` | CTA arrows, navigation |
| `✓` | Success / confirmed |
| `★` / `☆` | Star ratings |
| `─` | List item marker (replace bullet points) |
| `∅` | Empty state |
| `◎` / `⚡` / `✓` | Feature icons (text-based) |

---

## Logo / Brand Wordmark

```jsx
<span className="font-['DM_Serif_Display'] text-xl text-stone-900 tracking-tight">
  FitMart
</span>
/* On dark background: text-white */
```

---

## Do / Don't Summary

| ✅ Do | ❌ Don't |
|---|---|
| Use Framer Motion for interactive animations | Use CSS for hover/tap/exit animations |
| Use `stone-*` exclusively | Use any other color family |
| `rounded-full` on buttons | `rounded` or `rounded-md` on buttons |
| `rounded-2xl` on cards | `rounded-xl` or less on cards |
| Eyebrow tag before every section heading | Jump straight into headings |
| `DM Serif Display` for all headings | Use DM Sans for headings |
| `transition-colors` on every interactive element | Static hover states |
| Minimal, purposeful animations | Excessive motion or bouncing |
| Generous whitespace | Cramped layouts |
| Lowercase `text-xs tracking-[0.2em] uppercase` for labels | Bold or large labels |
| `text-stone-400` for muted/secondary info | Black text for everything |
| `AnimatePresence` for mount/unmount animations | Missing exit animations |
| `whileHover` + `whileTap` on interactive elements | Only using CSS `:hover` |
| `useInView` for scroll-triggered animations | Animating everything on page load |

---

## Performance Tips

1. **Use `layout` prop sparingly** — it's powerful but expensive
2. **Prefer `transform` animations** over layout properties
3. **Set `position: relative` on animated elements** to prevent layout shifts
4. **Use `will-change` only for continuous animations** (rare in FitMart)
5. **Batch animations with `staggerChildren`** instead of individual delays
6. **Remove animations on mobile** if they cause jank (use `@media (prefers-reduced-motion)`)

---

## Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Framer Motion Examples](https://www.framer.com/motion/examples/)
- [Custom Easing Curves](https://easings.net/)
- [React Spring vs Framer Motion comparison](https://react-spring.io/comparison)
```