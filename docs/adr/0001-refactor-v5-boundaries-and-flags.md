# ADR 0001: Refactor v5 Boundaries and Feature Flags

Date: 2026-03-09

## Status
Accepted

## Context
The application has grown with mixed concerns (UI, data access, business logic) leading to tight coupling and difficult changes. We need enforceable boundaries and a mechanism to introduce changes safely.

## Decision
- Establish layered architecture: UI -> hooks -> services -> clients
- Adopt feature flags to ship refactors incrementally without regressions
- Enforce import boundaries and avoid circular dependencies via dependency-cruiser in CI
- Document module public APIs via barrel files and avoid deep cross-feature imports

## Consequences
- Small, reviewable PRs with CI gates
- Easier testing and targeted refactors
- Temporary duplication during migrations under flags until removal
