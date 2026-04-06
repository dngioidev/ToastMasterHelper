---
description: "Use when: writing React frontend code, creating TypeScript files in frontend/src/, React components, hooks, TailwindCSS styles, Vite config, React Query usage"
applyTo: "frontend/src/**/*.{ts,tsx}"
---
# Frontend Code Standards

## TypeScript
- Strict mode everywhere — no `any`, no implicit types
- All component props typed with explicit interfaces
- All hook return values typed

## React Conventions
- Functional components ONLY — no class components
- Named exports for components (not default exports)
- Props interface named `<Component>Props`
- Custom hooks prefixed with `use`

## State Rules
- Server state: React Query (`useQuery`/`useMutation`) — never `useState` for API data
- Form state: React Hook Form
- Local UI state: `useState`
- Global client state: Zustand or Context (auth only)

## TailwindCSS
- Mobile-first: base = mobile, `md:` = tablet, `lg:` = desktop
- No inline `style` attributes unless unavoidable
- Repeated patterns → extract to component or `@layer components`

## Accessibility
- Every form input has an associated `<label htmlFor>`
- Icon-only buttons have `aria-label`
- `role="alert"` on error messages
- Never `outline: none` without replacement focus style

## File Conventions
- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Types: `camelCase.types.ts`
- API: `camelCase.api.ts`

## Testing
- Every custom hook has a Vitest test
- Components have React Testing Library render + interaction tests
- Run `npm run test` before marking any task done
