# Portfolio Repository Instructions

## Active project

The current major project is the portfolio revamp.

Authoritative specification:  
`docs/portfolio-revamp-plan.md`

Persistent implementation state:  
`docs/portfolio-revamp-status.md`

The implementation plan is authoritative for product requirements. Do not silently reinterpret or expand its scope.

## Orchestration policy

Act as the primary implementation orchestrator for Stage 1.

Work incrementally in coherent implementation batches rather than attempting the entire specification in one unstructured change.

Before beginning a batch:

- Read the relevant sections of `docs/portfolio-revamp-plan.md`.
- Read `docs/portfolio-revamp-status.md`.
- Inspect the actual repository implementation before making architectural claims.
- Verify prerequisites from previous batches are complete.

After each batch:

- Run relevant tests.
- Run `npm run lint`.
- Run `npm run build`.
- Inspect the resulting diff for regressions or unrelated changes.
- Use an independent review subagent for architecturally significant changes.
- Fix confirmed review findings.
- Re-run validation.
- Update `docs/portfolio-revamp-status.md`.
- Create a local Git checkpoint commit.

Do not proceed to the next batch until the current batch is in a validated state.

## UI verification

Browser automation is intentionally unavailable during Stage 1.

Do not block implementation waiting for browser access.

Verify behavior through:

- static inspection
- automated tests where practical
- lint
- production build
- route/state tests
- focused regression review

For requirements that cannot be fully verified without rendering the UI, record
them in `docs/portfolio-revamp-status.md` under a manual verification section
rather than claiming they were visually verified.

Do not mark visual or interaction-specific acceptance criteria as confirmed
unless they can actually be established without browser access.

Examples:

- **PASS:** route logic covered by tests
- **PASS:** build succeeds
- **PASS:** focus handler exists and is tested
- **NEEDS MANUAL VERIFICATION:** Portfolio window visually centered
- **NEEDS MANUAL VERIFICATION:** project cards are not clipped
- **NEEDS MANUAL VERIFICATION:** mobile spacing looks correct
- **NEEDS MANUAL VERIFICATION:** dock appearance
- **NEEDS MANUAL VERIFICATION:** modal sizing
- **NEEDS MANUAL VERIFICATION:** responsive breakpoints feel right

## Scope control

Complete Stage 1 autonomously. Do not begin Stage 2.

Avoid over-engineering. Do not add features, abstractions, applications, dependencies, or refactors unless required by the approved plan or the existing architecture.

Preserve existing functionality unless the plan explicitly replaces it.

Never invent project metrics, outcomes, experience, or technical claims.

## Subagents

Use subagents when:

- An independent code review is useful.
- An investigation benefits from isolated context.
- Accessibility should be reviewed independently.
- A regression analysis is needed.
- Independent workstreams can safely run without editing overlapping state.

Do not delegate simple sequential work merely to use a subagent. The orchestrator remains responsible for architectural decisions and integrating findings.

Reviewer subagents should normally inspect and report rather than modify code.

## Git and safety

Work on the portfolio revamp feature branch.

Local reversible actions are allowed.

Do not:

- Force push.
- Reset with `--hard`.
- Delete branches.
- Bypass hooks or tests.
- Discard unfamiliar user changes.
- Push to remote unless explicitly requested.
- Modify production infrastructure unless required by the plan and explicitly safe.

Keep each checkpoint commit scoped to the completed implementation batch.

## Escalation

Stop and ask for input only when:

- The approved plan conflicts materially with the existing architecture.
- A product/design decision is genuinely unresolved by the plan.
- Required credentials or external services are unavailable.
- An irreversible or destructive action is required.
- Satisfying a requirement requires materially expanding scope.

Ordinary implementation decisions should be made autonomously based on the existing codebase and the approved plan.

## Quality

Investigate before modifying. Never speculate about code that has not been inspected.

Prefer the simplest implementation that satisfies the specification.

Tests verify correctness. Do not hard-code behavior merely to satisfy tests.

Clean up temporary scripts or files created during implementation.
