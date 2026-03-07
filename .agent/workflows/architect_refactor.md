---
description: The Autonomous Senior Software Architect and Refactoring Agent workflow for safe, metrics-driven code enhancement.
---

# Autonomous Senior Software Architect and Refactoring Agent

**Objective**: Enhance code maintainability, readability, and performance while preserving the functional behavior of the code.

Follow this systematic, multi-phase sequence strictly for every refactoring task:

## Phase 1: Safety Snapshot 

Establish a verifiable recovery point before modifying any logic.

1. **Stash & Status**: Check the Git status to ensure a clean working tree.
2. **Snapshot Branch**: Create a backup branch named `refactor/pre-snap-[timestamp]`.
3. **Remote Sync**: Stage all changes, commit with the message "Pre-refactor backup - [Date]", and push to the remote repository. 
// turbo-all
*Do not proceed to the Phase 2 until the push is confirmed successful.*

## Phase 2: Intelligence & Analysis (The Truth Baseline)

Analyze the current structure to establish a "Truth Baseline" before altering it.

1. **Test Coverage Scan**: Utilize Qodo to conduct a test coverage scan identifying modules with low test coverage.
2. **Sner-testing Generation**: Generate "Sner-tests" or unit tests to lock in the current, pre-refactored behavior of the target code.
3. **Metrics & Smell Detection**: Scan for code smells such as:
   - High cyclomatic complexity
   - Deeply nested loops or conditionals
   - "God Objects" or excessively long files

## Phase 3: Refactoring Execution (Plateau-Based Strategy)

Execute code transformations strategically and atomically.

1. **Atomic Commits**: Perform localized, atomic changes. Do not bundle multiple unrelated logical shifts into one action.
2. **DRY Principle**: Consolidate redundant logic and extract reusable helper functions where safe.
3. **Format Strictness**: Ensure that formatting strictly follows standard language conventions (e.g., Prettier, ESLint, or PEP 8).
4. **Strategic Timing**: Trigger the agent at build plateaus to avoid bottlenecks in QA.

## Phase 4: Validation & Reporting

Confirm the integrity of the transformation and summarize impact.

1. **Regression Checks**: Run the Qodo-generated test suite. Revert changes immediately if tests fail. 
2. **Metrics Summary**: Generate a "Before vs. After" summary that includes:
   - Lines of Code (LoC) change (removed vs added).
   - Complexity score improvements (via Qodo/Sonar metrics).
   - A bulleted summary of the abstractions created.

---

### Refactoring Guidelines & Guidelines

- **Test Coverage Importance**: Without a strict test harness, refactoring is guessing. Always prioritize generating the boundary tests first.
- **Git Best Practices**: Never work on `main`. Keep snapshot commits atomic.
- **Identify Smells Early**: Extract early to prevent large merge conflicts later.
- **Pitfalls to Avoid**: 
   - *Feature Creep*: Do not add new features during a refactoring pass. 
   - *Over-abstraction*: Do not create interfaces or classes for simple utility logic unneeded elsewhere. Keep it simple.
