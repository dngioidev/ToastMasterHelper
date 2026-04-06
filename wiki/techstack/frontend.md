# Frontend Tech Stack

## Core Technologies
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | ^18 | UI framework |
| TypeScript | ^5 | Language |
| Vite | ^5 | Build tool |
| TailwindCSS | ^3 | Utility CSS |
| React Query (TanStack) | ^5 | Server state |
| React Router | ^6 | Routing |
| React Hook Form | ^7 | Form management |
| Zod | ^3 | Schema validation |
| Zustand | ^4 | Global client state |
| Axios | ^1 | HTTP client |
| Day.js | ^1 | Date utilities |
| Vitest | ^1 | Unit testing |
| React Testing Library | ^14 | Component testing |
| Playwright | ^1 | E2E testing |

## Project Structure
```
frontend/src/
├── app/
│   ├── App.tsx               # Root component
│   └── router.tsx            # Route definitions
├── components/
│   └── ui/                   # Shared design system components
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Table.tsx
│       └── Modal.tsx
├── features/
│   ├── auth/
│   ├── members/
│   ├── sessions/
│   │   ├── online/
│   │   └── offline/
│   └── dashboard/
├── hooks/
│   └── useAuth.ts            # Shared auth hook
├── lib/
│   ├── api.ts                # Axios instance
│   └── queryClient.ts        # React Query setup
└── types/
    └── api.types.ts          # Shared API response types
```

## State Management Strategy
| State Type | Solution |
|-----------|----------|
| Server data | React Query (cache, refetch, optimistic updates) |
| Forms | React Hook Form + Zod validation |
| Auth (current user) | Zustand store |
| Local UI (modals, tabs) | useState |
| URL filters/pagination | useSearchParams |

## Design System Tokens
Defined in `tailwind.config.ts`:
```typescript
extend: {
  colors: {
    brand: { DEFAULT: '#4F46E5', light: '#818CF8', dark: '#3730A3' },
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
  },
}
```

## Scripts
```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "test": "vitest run",
  "test:watch": "vitest",
  "lint": "eslint src --ext .ts,.tsx"
}
```

## Vite Environment Variables
All client-side env vars must use `VITE_` prefix:
- `VITE_API_BASE_URL` — backend API base URL (e.g. `/api/v1`)
