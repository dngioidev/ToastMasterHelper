# React Best Practices

## Performance
```tsx
// Memoize expensive renders
const MemberRow = React.memo(({ member, onEdit }: MemberRowProps) => { ... });

// Memoize derived data
const eligibleSpeakers = useMemo(
  () => members.filter(m => m.project_level < 10 && m.status === 'Active'),
  [members]
);

// Stable callbacks
const handleEdit = useCallback((id: string) => navigate(`/members/${id}`), [navigate]);
```

## Forms with React Hook Form
```tsx
const { register, handleSubmit, formState: { errors } } = useForm<CreateMemberDto>({
  resolver: zodResolver(createMemberSchema),
});

// Every input needs register and error display
<input {...register('name')} aria-describedby="name-error" />
{errors.name && <span id="name-error" role="alert">{errors.name.message}</span>}
```

## Accessibility Requirements
```tsx
// Form inputs — always associate label
<label htmlFor="project-level">Project Level</label>
<input id="project-level" type="number" min={0} max={10} />

// Buttons — descriptive name
<button aria-label="Edit member Alice">✏️</button>

// Loading states
<div role="status" aria-live="polite">
  {isLoading ? 'Loading sessions...' : null}
</div>

// Tables — proper semantics
<table>
  <caption className="sr-only">Session schedule for April 2026</caption>
  <thead><tr><th scope="col">Role</th> ...</tr></thead>
  <tbody>...</tbody>
</table>
```

## Custom Hook Pattern
```typescript
// Always return a typed object (not tuple, for extensibility)
export function useSession(id: string) {
  const { data, isLoading, isError, refetch } = useQuery<Session>({
    queryKey: QUERY_KEYS.session(id),
    queryFn: () => sessionsApi.getById(id),
    enabled: !!id,
  });

  return { session: data, isLoading, isError, refetch };
}
```

## Environment Variables
- All Vite env vars must start with `VITE_`
- Access via `import.meta.env.VITE_API_BASE_URL`
- Validate at startup: throw if required vars missing

## TypeScript Strict Mode Compliance
```typescript
// No implicit any
// No unused variables
// Strict null checks — use optional chaining (?.) and nullish coalescing (??)
const name = member?.name ?? 'Unknown';

// Use discriminated unions for state
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

## Bundle Size Rules
- Check bundle size after adding dependencies: `npm run build && npx vite-bundle-visualizer`
- Day.js instead of Moment.js (< 5KB vs 67KB)
- Lazy-load route components always
- Tree-shake icon libraries: import only used icons
