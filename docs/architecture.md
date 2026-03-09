# Architecture: Charter Legacy v4 Refactor Plan (v5)

## Goals
- Improve modularity and maintainability
- Introduce enforced boundaries between UI, hooks, services, and data clients
- Enable incremental refactors with feature flags and adapters
- Strengthen CI/CD and observability

## Module Boundaries
- UI (components/pages): presentational, declarative; receives data via props/hooks
- Hooks (state & orchestration): compose services, manage async lifecycles
- Services (business logic): pure orchestrations with typed inputs/outputs
- Data clients (Supabase/API): side effects; versioned clients v1/v2; no React imports
- Shared (primitives): buttons, dialogs, modals, form controls

```
UI -> hooks -> services -> data/clients
          ^ shared primitives ^
```

## Conventions
- Feature-first foldering under src/features/<feature>
- Public API per module via index.(ts|tsx)
- No cross-feature deep imports; use module public APIs
- Error model: Result<T, E> or exceptions normalized at service boundaries
- Async state model: idle | loading | success | error
- Naming: 
  - Hooks: useXyz
  - Services: xyzService.ts
  - Clients: supabaseClient.ts, apiClient.ts (versioned)

## Feature Flags
- Central registry in src/shared/flags/flags.ts
- Flags read from env or localStorage with overrides
- New pathways land behind flags; old code remains until stability proven, then removed

## Data & Migrations
- Prefer additive DB migrations; deprecate then remove
- Generate and commit types from Supabase (types_supabase.ts authoritative)

## Testing Strategy
- Unit tests for utils/services
- Component tests for hooks/containers
- E2E Playwright for critical flows (Dashboard, Staff node, Wizards, Fulfillment)
- Visual regression snapshots for key screens

## Observability
- Structured logs in services and critical UI actions
- Central error boundary and toast notifications for surfaced errors

## Adoption Plan
1. Create shared primitives and feature flag system scaffolding
2. Introduce typed service and client layers; migrate leaf modules first
3. Move page containers under features/; adapt callers via flags
4. Stabilize, remove old code paths once CI and E2E are green

## ADRs
- docs/adr/ will capture material decisions and tradeoffs
