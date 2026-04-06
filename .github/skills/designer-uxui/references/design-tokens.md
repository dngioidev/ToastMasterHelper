# Design Tokens

## TailwindCSS Configuration

```typescript
// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#4F46E5',   // Indigo 600 — primary actions
          light: '#818CF8',     // Indigo 400 — hover states
          dark: '#3730A3',      // Indigo 800 — active states
        },
        success: {
          DEFAULT: '#10B981',   // Emerald 500 — passed, active
          light: '#D1FAE5',     // Emerald 100 — success backgrounds
        },
        warning: {
          DEFAULT: '#F59E0B',   // Amber 500 — pending, leave
          light: '#FEF3C7',     // Amber 100 — warning backgrounds
        },
        danger: {
          DEFAULT: '#EF4444',   // Red 500 — errors, destructive
          light: '#FEE2E2',     // Red 100 — error backgrounds
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Use Tailwind defaults — document overrides here if any
      },
    },
  },
  plugins: [],
} satisfies Config;
```

## Semantic Token Usage

| Token | Use Case |
|-------|----------|
| `brand` | Primary buttons, active nav items, links |
| `success` | Active member badge, Passed speech indicator |
| `warning` | Leave status badge, pending state, caution |
| `danger` | Error states, destructive action buttons |
| `gray-50` | Page background |
| `gray-100` | Card background, alternate table rows |
| `gray-200` | Borders |
| `gray-500` | Secondary text, placeholders |
| `gray-900` | Primary text |

## Typography Scale

| Class | Size | Use |
|-------|------|-----|
| `text-xs` | 12px | Labels, captions, meta |
| `text-sm` | 14px | Secondary text, table content |
| `text-base` | 16px | Body text |
| `text-lg` | 18px | Section headings |
| `text-xl` | 20px | Page subheadings |
| `text-2xl` | 24px | Page titles |

## Spacing
Use Tailwind's default spacing scale (4px increments):
- `p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px, etc.
- Standard card padding: `p-4` (desktop), `p-3` (mobile)
- Standard section gap: `gap-4` or `gap-6`

## Border Radius
| Class | Size | Use |
|-------|------|-----|
| `rounded` | 4px | Inputs, small badges |
| `rounded-md` | 6px | Buttons |
| `rounded-lg` | 8px | Cards |
| `rounded-full` | 9999px | Avatar, pill badges |

## Shadow
| Class | Use |
|-------|-----|
| `shadow-sm` | Default card |
| `shadow-md` | Elevated card, dropdown |
| `shadow-lg` | Modal, popover |
