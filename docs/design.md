# Story 7 – UI/UX Refinement

Objective: Polish the entire interface for consistency, accessibility, and delightful interactions.

## Refinements
- Visual consistency: spacing scale, radii, shadows, typography.
- Interaction polish: hover states, active/focus rings, motion (Framer Motion optional).
- Accessibility: keyboard flows, aria labels, contrast checks.
- Performance: memoization, virtualization (if needed), bundle review.
- Dark mode: verify contrast ratios, ensure tokens cover both schemes, smooth transitions.
- Responsiveness: audit breakpoints, adjust density and layout for small/large screens.

## Questions For You
- Provide design feedback/preferences (spacing, colors, animations).
- Confirm any additional interactions or microcopy.
- Identify areas needing refinements post user testing.

The editor will stop here and await your final approval to conclude.

## Edge Cases & Scalability
- Reduced motion preference respected; avoid excessive animations.
- Focus management in dynamic components (modals, sheets, dropdowns).
- Image loading strategies for thumbnails (lazy, aspect ratio boxes) to prevent layout shift.
- Internationalization readiness (copy length changes, RTL considerations) if needed later.

## Implementation Appendix – UI/UX Integration

Design Tokens & Tailwind Mapping
- Use semantic CSS variables for colors to avoid hard-coded values: `--color-surface`, `--color-card`, `--color-interactive`, `--color-hover`, `--color-border`, `--color-text`.
- Expose tokens in `:root` and `[data-theme="dark"]` to enable theme switching without touching component code.
- Map Tailwind theme colors to tokens using `var(--color-*)` for consistent usage across components.

Example tokens (CSS variables)
```
/* styles/tokens.css */
:root {
  --color-surface: oklch(97% 0.02 95);
  --color-card: oklch(96% 0.03 95);
  --color-interactive: oklch(65% 0.12 230);
  --color-hover: oklch(60% 0.12 230);
  --color-border: oklch(88% 0.02 95);
  --color-text: oklch(20% 0.02 95);
}
[data-theme="dark"] {
  --color-surface: oklch(15% 0.02 95);
  --color-card: oklch(20% 0.02 95);
  --color-interactive: oklch(65% 0.12 230);
  --color-hover: oklch(70% 0.12 230);
  --color-border: oklch(30% 0.02 95);
  --color-text: oklch(90% 0.02 95);
}
```

Tailwind mapping (simplified)
```
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        interactive: 'var(--color-interactive)',
        hover: 'var(--color-hover)',
        border: 'var(--color-border)',
        text: 'var(--color-text)'
      }
    }
  }
}
```

Tech Stack (Project-Specific)
- Frontend: Next.js (App Router) + TypeScript
- UI: shadcn/ui components + Tailwind CSS
- State: Zustand for feature state; Context for theme/auth
- Forms & Validation: react-hook-form + zod
- Testing: Vitest + @testing-library/react; E2E with Playwright
- Theming: next-themes with attribute="class" for SSR-friendly dark mode
- Backend: Next.js API routes; optional Supabase/Firebase
- Deployment: Vercel or environment-specific; CI optional

Dark Mode Notes (Next.js)
- Use `next-themes` to respect system preference and persist choice automatically.
- Swap semantic tokens via CSS variables per theme to avoid SSR flicker.
- Ensure the theme toggle is keyboard- and screen-reader accessible.

Maintainability & Change-Friendly Architecture
- Centralize design tokens (colors, spacing, radius, shadows) via CSS variables and Tailwind theme.
- Use `class-variance-authority (cva)` for component variants to keep APIs stable.
- Keep presentational components dumb; encapsulate feature logic in hooks/stores and pass data via props.
- Co-locate component, styles, tests, and stories in feature folders.
- Prefer composition over inheritance; build pages from small building blocks.
- Avoid hardcoded pixel values; use the spacing scale and semantic tokens.
- Provide skeleton/loading/empty/error states for list-based UI.
- Gate expensive UI with lazy loading; defer non-critical work to idle moments.
- Ensure dark mode and responsive behavior by default in every new component.