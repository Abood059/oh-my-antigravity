---
name: unit-tests
description: Evaluate test relevance, plan missing cases, or write and run unit tests in any programming language, prioritizing business use cases and domain invariants. Use when asked to review existing tests for value or coverage padding, add unit tests, or plan unit-test cases. Review and planning requests do not edit files. Not for general code review, end-to-end testing, or load testing.
license: MIT
---

# Unit tests

Evaluate existing and proposed tests by the business behavior they protect,
then fill meaningful gaps using the project's language, framework, and
conventions. Prioritize business use cases and domain invariants over line or
branch coverage. The target can be a file, function, class, or module; resolve
it from the user's request and repository context.

## Choose the mode

- **Review relevance:** When asked whether existing tests are useful or merely
  increase coverage, assess them and report findings and meaningful gaps.
  Do not edit tests or automatically continue into generation.
- **Plan only:** When asked to list cases, analyze coverage, or review a test
  strategy without implementing it, assess existing tests and return the plan.
  Do not edit files or automatically continue into generation.
- **Generate and verify:** When asked to write or add tests, establish the
  plan, implement it, and run the tests. Printing the plan does not require
  a separate approval unless the user or project instructions require one.

If the user already supplied a plan for this target, use it. Verify it against
the current code and tests; name any cases added or dropped and the reason.
Do not start a second independent planning pass.

## 1. Discover the project's test setup

Read repository instructions, the target's package or build configuration,
relevant CI commands, and neighboring tests. In a monorepo, use the target's
own package and working directory rather than assuming the root's stack.

Determine the language, runtime, installed test and assertion libraries,
test discovery rules, fixture conventions, and focused test command. Reuse
project scripts, wrappers, lockfile-selected tools, and existing environment
setup. A manifest or file extension is a clue, not proof of the test runner.

Search for coverage by imports, symbols, and behavior as well as filenames;
tests may be colocated, embedded in a source module, or spread across files.
Read existing tests for the target and a few nearby examples. Extend the
appropriate existing tests and reuse fixtures; avoid duplicate coverage.

There is no language allowlist. Use the detected stack, including languages
without a built-in rule or example here. If no test setup exists, prefer the
language's standard test facilities when they fit the task. Resolve a choice
that requires a new dependency or configuration from project instructions
and user constraints; ask if a material choice remains unresolved.

## 2. Understand behavior and the test boundary

Read the target and the collaborators, input/output types, constructors,
factories, error types, and validators needed to understand its behavior and
create valid data. Trace reachable helper branches through the interface
callers use. Do not guess fields, signatures, or third-party APIs.

Read relevant requirements, domain documentation, and callers to identify the
business use cases, valid state transitions, and invariants the target owns.
Identify expected outcomes from these contracts, existing tests, and
implementation. Distinguish required behavior from incidental current
behavior; flag contradictions rather than silently choosing an expectation.
For library or infrastructure code, use the caller-facing contract or
operational invariant instead of inventing a business narrative.

Use a callable interface appropriate to the module, without exposing private
methods or changing visibility for tests. Keep business-logic unit tests
isolated from live services, databases, and full application startup.

Routing, binding, declarative validation, authentication, and serialization
may require a framework's test client or a focused slice to execute. A direct
handler call does not prove those behaviors. Identify such cases as framework
or integration coverage and use the existing focused harness when it is in
scope; otherwise report the gap instead of claiming unit tests cover it.

## 3. Evaluate test relevance

Apply this check to existing tests, every proposed case, and the tests you
generate. Executing a branch, a passing suite, and a higher coverage number
are insufficient evidence of value. Ask:

- Which business use case, domain invariant, or supported caller contract
  does this test protect? Cite the requirement, domain rule, or caller that
  makes it relevant; implementation alone does not justify every input case.
- What concrete defect would break that behavior, and would the assertions
  fail if it happened while the same lines of code still executed?
- Does the scenario represent a supported workflow or a meaningful violation
  of a domain rule? Does it add protection beyond existing tests?

Classify tests or cases as:

- **Relevant:** Protects an evidenced business outcome or invariant with
  assertions that detect its violation. Prioritize normal workflows and
  important business rejection paths.
- **Redundant:** Repeats protection already supplied by another test without
  a distinct rule, scenario, or defect being detected.
- **Coverage-only:** Executes code but asserts no meaningful contract, checks
  only implementation details, or verifies a mock's own configured behavior.
  Classify from evidence, not assumptions about the author's motives.
- **Edge/speculative:** Exercises an unusual input or technical boundary
  without an evidenced business or caller-contract reason.
- **Unclear:** Available evidence does not establish the scenario's value or
  expected outcome. State what information is missing rather than calling
  the test useless or inventing a requirement.

Flag edge cases explicitly and avoid generating them by default. A boundary
or failure case is eligible only when it directly protects an evidenced
business rule or domain invariant, or the user explicitly requests it. State
that justification; reaching a defensive branch is insufficient. For example,
an order exceeding stock protects the no-overselling invariant, whereas an
unsupported input shape rejected by request parsing adds no checkout-domain
coverage.

Report findings with the test name and file location, classification, the
rule or evidence, the defect its assertions detect or miss, and the proposed
action. Group relevant tests by protected behavior when that keeps the review
concise. Identify important business rules left untested even when coverage
is high. In review mode, stop after this assessment and the prioritized gaps.

Flag existing redundant, coverage-only, and incidental edge tests for cleanup;
do not delete or weaken existing tests unless cleanup is in the user's scope.
Exclude such cases from generation. Coverage reports can locate meaningful
gaps but do not set the test selection goal. If a required coverage threshold
cannot be met with relevant tests, report the conflict; do not pad the suite
or silently relax the threshold.

## 4. Establish the cases

Select missing cases that pass the relevance check, in this order:

- Representative business workflows and their observable outcomes, including
  meaningful state transitions and collaborator effects.
- Domain invariants and important business rejection or recovery rules.
  Keep independently changeable rules distinct and other conditions valid
  so each failure has one cause.
- Supported caller or operational contracts when the target is technical
  infrastructure rather than domain logic.

Exclude redundant inputs within the same equivalence partition, trivial
accessors, framework internals, unreachable branches, and speculative cases
unrelated to the target's contract. Neither an explicit branch nor null,
empty, size-dependent, or extreme input handling makes a test relevant by
itself. Inspect internal paths but do not manufacture one test per branch,
method, or input variation.

For HTTP behavior in scope, assert the concrete configured status, response,
or redirect destination. Keep validation, unauthenticated, and forbidden
cases separate when the contract distinguishes them. Assert the relevant
constraint or error detail when a generic rejection could hide another cause.

Return each missing case with:

```text
Target: <file and callable interface>
Case: <behavior under a specific condition and its expected outcome>
Protects: <business use case or invariant and its evidence>
Given: <concrete inputs and relevant collaborator state>
When: <action through the selected interface>
Then: <observable result, error, state, or interaction>
Detects: <concrete defect the assertions would catch>
Level: <unit, or framework/integration if needed>
```

Use the project's idiomatic names or descriptive test titles; do not impose
one identifier style across languages. Summarize existing coverage separately
from missing cases. If no gap is found, say which behaviors are already
tested; do not invent cases or infer complete coverage from a passing suite.
In planning mode, stop here and report flagged exclusions, uncertainties, or
cases needing another test level. The plan can be reused by this same skill
for generation.

## 5. Write focused tests

- Make Arrange/Act/Assert or Given/When/Then evident, following local style.
  Test one behavior per case; multiple assertions may describe that outcome.
  Use table-driven or parameterized tests for equivalent scenario shapes
  when idiomatic, keeping each selected business rule or invariant visible.
- Keep assertion-relevant inputs explicit in the test or its case row.
  Reuse simple factories or fixtures for irrelevant setup; do not rely on
  their defaults for the condition under test or build a new fixture system.
- Use independently determined expectations. Avoid duplicating the algorithm
  under test, deriving expected output from its result, or conditionally
  skipping assertions. Simple data setup and property-based checks are valid
  when they have an independent oracle and fit existing project conventions.
- Exercise real production behavior. Source-string checks and assertions
  about a mock's own configured return value do not test the target.
- Use real value objects and the real target. Replace external collaborators
  at existing seams with suitable fakes, stubs, spies, or mocks. Verify only
  relevant interactions; capture or inspect payload fields when data matters.
  A wildcard used to stub a response is not an assertion about the call.
- For serialization, use expectations independent of the production
  serializer. Compare structured values unless exact bytes, order, or
  whitespace are part of the contract. Test logs only when their contents
  or emission are meaningful behavior.
- Control nondeterminism with existing clock, randomness, scheduler, or I/O
  seams. Await asynchronous work, isolate mutable state, and clean up test
  resources with the framework's lifecycle facilities; avoid timing sleeps.

Preserve unrelated work. Changing production behavior or public interfaces
requires that change to be in the user's scope; a request to add tests alone
does not authorize it. Make test discovery/configuration edits only when
needed to execute the requested tests and consistent with project constraints.

## 6. Verify relevance and execution

Reapply the relevance check to the generated assertions, not just their names
or plan descriptions. Correct tests that would stay green when the protected
rule breaks; drop newly generated coverage-only, redundant, or incidental
edge cases. If a supported defect hypothesis is hard to assess, use a focused
mutation or counterexample in an isolated workspace when practical. Mutation
tools and a mutation run for every test are not required.

Run the smallest relevant test selection, plus required project checks. For
compiled or typed stacks, ensure the check includes the test code; a build
that checks only production files is insufficient. A runner that compiles
tests itself can satisfy both compilation and execution. For interpreted
stacks, syntax checking alone does not prove that tests run.

Confirm the intended tests were discovered and executed. A successful exit
with zero matching tests, skipped cases, or a non-executing dry run does not
verify coverage. Run nearby tests if shared fixtures or configuration changed.

Diagnose failures before fixing them. Correct mistaken expectations or setup
when the evidence supports it. If a test exposes a production defect against
the established contract, retain and report the failing evidence. Do not
weaken assertions, change expectations to bless a defect, disable tests, or
change production code merely to obtain a green run. Preserve existing
intentional skips; report newly requested cases that cannot be executed.

Stop repeating fixes when they no longer make progress. If tools,
dependencies, permissions, or unresolved behavior block verification, report
the exact command, error, and remaining work; do not claim completion.

Close with protected business use cases and invariants, relevance findings,
flagged and excluded edge cases with reasons, files changed, commands and
observed test results, and any failures or remaining meaningful gaps. Claim
coverage percentages only when measured; do not present them as proof of test
quality. Claim passing tests only when execution confirms them. Review and
planning output need no generated files or execution claim.
