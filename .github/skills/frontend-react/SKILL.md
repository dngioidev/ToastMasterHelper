---
name: frontend-react
description: "Use when: creating React components, writing custom hooks, setting up React Query, TailwindCSS styling, frontend routing, state management, component composition, React TypeScript patterns, Vitest tests, accessibility, performance optimisation, Vite configuration"
argument-hint: "Describe the frontend task (e.g., 'build session schedule table component')"
---
# Frontend React Skill

Senior-level React engineering patterns for the TM Scheduler frontend.

## When to Use
- Creating or modifying React components
- Writing custom data-fetching hooks (React Query)
- Managing client state (Zustand/Context)
- Styling with TailwindCSS
- Setting up routing or layouts
- Writing Vitest + React Testing Library tests

## Procedure
1. **Read context** — load feature wiki and any existing design decisions
2. **Plan component tree** — sketch parent → child → leaf hierarchy
3. **Define types** — TypeScript interfaces for all data shapes
4. **Custom hook** — extract API logic into `use<Feature>.ts`
5. **Build components** — leaf → parent order
6. **Style** — TailwindCSS mobile-first
7. **Tests** — Vitest + RTL unit tests for hooks and components
8. **Build** — `cd frontend && npm run build` must pass
9. **Test run** — `npm run test` all passing

## Reference Files
- [React Architecture Patterns](./references/react-architecture.md)
- [React Best Practices](./references/react-best-practices.md)

## File Naming Convention
```
frontend/src/
├── features/
│   └── <feature>/
│       ├── components/
│       │   ├── <Feature>Page.tsx
│       │   └── <FeatureCard>.tsx
│       ├── hooks/
│       │   └── use<Feature>.ts
│       ├── types/
│       │   └── <feature>.types.ts
│       └── api/
│           └── <feature>.api.ts
├── components/
│   └── ui/              # Shared design system components
├── hooks/               # Shared hooks
├── lib/
│   ├── api.ts           # Axios instance
│   └── queryClient.ts   # React Query client
└── router/
    └── index.tsx        # React Router config
```

## Quick Patterns

### Custom API Hook
```typescript
export function useMembers() {
  return useQuery<Member[]>({
    queryKey: ['members'],
    queryFn: () => api.get<Member[]>('/members').then(r => r.data),
  });
}

export function useCreateMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMemberDto) => api.post('/members', dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['members'] }),
  });
}
```

### Component
```tsx
interface MemberCardProps {
  member: Member;
  onEdit: (id: string) => void;
}

export const MemberCard: React.FC<MemberCardProps> = ({ member, onEdit }) => {
  const statusColor = member.status === 'Active' ? 'text-green-600' : 'text-gray-400';
  return (
    <div className="rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-900">{member.name}</span>
        <span className={`text-sm ${statusColor}`}>{member.status}</span>
      </div>
      <p className="mt-1 text-sm text-gray-500">Level {member.project_level}</p>
      <button
        onClick={() => onEdit(member.id)}
        className="mt-3 text-sm text-brand hover:underline"
        aria-label={`Edit ${member.name}`}
      >
        Edit
      </button>
    </div>
  );
};
```

### Test
```typescript
describe('MemberCard', () => {
  it('renders member name and status', () => {
    render(<MemberCard member={mockMember} onEdit={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });
});
```
