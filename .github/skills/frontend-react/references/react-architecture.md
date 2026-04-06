# React Architecture Patterns

## Feature Folder Structure
Each feature is a self-contained slice of the application:
```
features/sessions/
├── components/
│   ├── SessionsPage.tsx      # Route entry point component
│   ├── SessionTable.tsx      # Schedule timetable
│   └── SessionRoleCell.tsx   # Individual role cell
├── hooks/
│   ├── useSessions.ts        # Fetch + cache sessions
│   └── useSessionMutations.ts # Create/update/delete
├── types/
│   └── session.types.ts      # TypeScript interfaces
└── api/
    └── sessions.api.ts       # Axios calls (called by hooks only)
```

## State Management Hierarchy
1. **URL state**: filter, sort, pagination (use `useSearchParams`)
2. **Server state**: React Query (`useQuery`, `useMutation`)
3. **Form state**: React Hook Form (`useForm`)
4. **Local UI state**: `useState` (modal open, tab selection)
5. **Global client state**: Zustand or Context (auth user, theme)

## React Query Patterns
```typescript
// Query key conventions
const QUERY_KEYS = {
  sessions: ['sessions'] as const,
  session: (id: string) => ['sessions', id] as const,
  members: ['members'] as const,
};

// Stale time strategy
// Static data (members): staleTime: 5 * 60 * 1000 (5 min)
// Dynamic data (sessions): staleTime: 60 * 1000 (1 min)
```

## Component Composition Patterns
```tsx
// Compound component for schedule table
<ScheduleTable sessions={sessions}>
  <ScheduleTable.Header />
  <ScheduleTable.Body>
    {(session) => <ScheduleTable.Row session={session} />}
  </ScheduleTable.Body>
</ScheduleTable>
```

## Error Boundary
Wrap route-level components in error boundaries:
```tsx
<ErrorBoundary fallback={<ErrorPage />}>
  <SessionsPage />
</ErrorBoundary>
```

## Loading States
Always handle loading and error states explicitly:
```tsx
const { data, isLoading, isError } = useSessions();
if (isLoading) return <SkeletonTable rows={5} />;
if (isError) return <ErrorMessage retry={refetch} />;
return <SessionTable sessions={data} />;
```

## Route Setup
```tsx
// router/index.tsx
const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <DashboardPage /> },
    { path: 'sessions/online', element: lazy(() => import('../features/sessions/...')), },
    { path: 'sessions/offline', element: lazy(...), },
    { path: 'members', element: lazy(...) },
  ]},
]);
```
