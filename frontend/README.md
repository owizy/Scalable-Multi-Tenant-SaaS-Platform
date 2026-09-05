# Next.js Multi-Tenant SaaS Frontend

A production-grade React application built with Next.js (App Router), TypeScript, Tailwind CSS, and ABAC-aware authorization.

## 🏗️ Architecture

The project follows a **feature-based** folder structure to ensure scalability and maintainability.

```bash
src/
├── app/               # Next.js App Router (Layouts, Pages, Middleware)
├── components/        # Shared UI components
│   ├── layout/        # Layout components (Sidebar, Topbar)
│   └── ui/            # Basic UI primitives (Button, Card, Table, etc.)
├── features/          # Domain-specific logic (Auth, Projects)
├── hooks/             # Custom shared React hooks
├── lib/               # Utility functions and core logic
│   ├── api-client.ts  # Axios client with interceptors
│   ├── permissions.ts # ABAC engine (RBAC + Conditions)
│   └── utils.ts       # Shared helper functions
├── providers/         # Global React Context providers (Auth, Theme)
└── types/             # Shared TypeScript types/interfaces
```

## 🔐 Authentication

- **JWT Handling**: Uses `access_token` and `refresh_token` stored in secure cookies.
- **Interceptors**: Axios interceptors automatically attach the token and handle 401 errors by attempting a token refresh.
- **Auth Provider**: Provides global `user` state and `login`/`logout` functions.

## 🧠 Authorization (ABAC)

The UI is powered by a central permission engine (`src/lib/permissions.ts`). It supports both Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC).

### Permission Utility (`can`)

The `can` utility checks if a user has permission for a specific action on a resource:

```typescript
// can(user, action, resource, data?)
can(currentUser, 'UPDATE', 'Project', projectData);
```

### `Can` Component

The `<Can>` component conditionally renders children based on permissions:

```tsx
<Can I="UPDATE" a="Project" data={project}>
  <Button>Edit Project</Button>
</Can>
```

- **RBAC**: Handled via simple role-to-action mapping.
- **ABAC**: Handled via `conditions` functions. For example, a `USER` can only `UPDATE` a `Project` if `project.ownerId === user.id`.

## ⚡ Key Features

- **Dashboard Layout**: Responsive sidebar and topbar.
- **Forms**: Centralized validation using `React Hook Form` and `Zod`.
- **API Integration**: Centralized Axios client with automatic token refreshing.
- **Component System**: Custom reusable UI primitives designed for a "premium" feel.
- **Protected Routes**: Handled via layout-level authentication checks.

## 🧪 Future Improvements

- [ ] Add Playwright for E2E testing.
- [ ] Implement Server Components for data fetching where appropriate.
- [ ] Add a dark mode toggle.
- [ ] Setup shadcn/ui for more complex components.
