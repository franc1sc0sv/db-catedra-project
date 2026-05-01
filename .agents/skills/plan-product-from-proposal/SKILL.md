---
name: plan-product-from-proposal
description: >-
  Use when: (1) starting a new project from a proposal or rough notes,
  (2) migrating an existing proposal to plan-product format,
  (3) generating a full section-based plan-product tree from scratch.
  Triggers on: "spec from proposal", "plan product from proposal",
  "migrate proposal to specs", "generate plan-product tree",
  "create project specs", "init project specs",
  "proposal to plan-product", "convert proposal".
license: project
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - AskUserQuestion
metadata:
  category: project-planning
  tags: [plan-product, specs, planning, interactive]
  status: ready
  version: 2
---

# Plan Product From Proposal

Convert a project proposal into a complete plan-product tree (narrative
documents for humans) through a deep, interactive Q&A process. Sub-agents
generate all files in parallel once the dev approves.

Before starting, read `references/file-templates.md` to load all output
templates. Keep them in context — sub-agents need them verbatim.

## Workflow

### Step 1 — Intake

- If a file path argument was passed → read the file
- Else → use AskUserQuestion: *"Share your project proposal — rough notes, a doc,
  bullet points, anything. We'll extract everything together."*
- Silently parse the proposal: identify candidate sections, roles, entities,
  ambiguities, and gaps before asking anything

### Step 1.5 — Skill Inventory & Mapping

Read the available-skills list from the session-start system-reminder
(it lists every skill loaded in the current session, e.g. /laravel-specialist,
/frontend-design, /tailwind-css-patterns, /accessibility, /security-review,
/php-pro, /vite, /agent-os:discover-standards, etc.).

For each skill, derive a short relevance descriptor (one phrase: when this
skill would help). Build an in-memory map keyed by domain:

```
backend / framework  → /laravel-specialist, /php-pro, /laravel-patterns, /nodejs-*
frontend / UI        → /frontend-design, /tailwind-css-patterns, /vite, /accessibility
testing / QA         → /ccc-skills:uat-testing, /security-review, /review
docs / diagrams      → /project-documenter, /ccc-skills:excalidraw
deploy / ops         → /laravel-cloud:deploying-laravel-cloud
meta / standards     → /agent-os:discover-standards, /agent-os:shape-spec
```

Keep this map. Use it to:
- Inform Q&A in Step 2 (e.g. if `/laravel-specialist` exists, infer Laravel as a
  likely tech stack option for the integrations question).
- Auto-detect which skills apply to each section and sub-section in Step 3.
- Preview the mapping in Step 4 for the user to adjust.
- Pass the per-section / per-sub-section skill list to the section agents in
  Step 5 so they render a `## Skills relevantes` block in every `_index.md`
  and `*.spec.md`.

Do NOT ask the user about skills section-by-section — auto-detect, then preview
in Step 4 for bulk adjustment.

### Step 2 — Product Vision Q&A

**Rule: Never assume. Use AskUserQuestion for every doubt the proposal does not
already resolve. Always offer 3-4 concrete choices derived from the proposal.
Never label any option as "(Recommended)". The AI decides how many questions
are needed — skip a question entirely if the proposal already answers it.**

Read `references/qa-guide.md` for the question bank and multi-choice patterns.

Cover in this order, skipping any category fully resolved by the proposal:
1. Identity — product name, core description, problems solved
2. Users & Roles — actor list, what each role can do, admin distinction
3. Sections — AI-derived section proposals, MVP vs. post-launch cut
4. Data Entities — core entities (multi-select), relationships
5. Integrations & Constraints — third-party services, auth method, scale
6. Priority — confirm the hard MVP line

### Step 3 — Section Deep-Dive

For each confirmed section, one at a time, ask only the questions the proposal
does not already answer:

1. Ask what sub-sections live inside it — present AI-derived list, multi-select to confirm
2. For each sub-section, gather (only if not already clear):
   - User flow (written as a short story, not step numbers)
   - Screen requirements (what needs to be visible/interactive)
   - UI pattern if not obvious (form, table, modal, wizard)

While confirming sub-sections, silently update the skill mapping from Step 1.5
with per-sub-section relevance (e.g. an API sub-section gets backend skills,
a dashboard sub-section gets frontend skills).

Read `references/qa-guide.md` → "Section Deep-Dive Questions" for AskUserQuestion patterns.

### Step 4 — Full Outline Confirmation

Present every file that will be created as a directory tree. Then show the
auto-detected skill mapping per section and per sub-section, e.g.:

```
Skills relevantes detectadas (auto):
  Autenticación        → /laravel-specialist, /security-review, /php-pro
  Ventas               → /laravel-specialist, /tailwind-css-patterns, /frontend-design
  Inventario           → /laravel-specialist, /tailwind-css-patterns
  Reportes y Auditoría → /laravel-specialist, /frontend-design, /security-review
```

Ask: *"Here's everything I'll generate, plus the skills I'll reference per
section. Any adjustments before I start?"*

User confirms → auto-proceed immediately. If adjustments → loop back to the
relevant step (or just edit the skill mapping in place).

### Step 5 — Multi-Agent Generation

**Immediately after confirmation, spawn all agents in parallel. Do NOT write files yourself.**

Read `references/agent-spawning.md` for exact agent prompt templates and spawning rules.

Launch simultaneously in a single message (multiple Agent tool calls):
1. **Roadmap agent** — writes `plan-product/product-roadmap.md`
2. **One section agent per section** — writes `plan-product/specs/{section}/_index.md` + one flat `{sub-section}.spec.md` per sub-section. Each file includes a `## Skills relevantes` block populated from the auto-detected mapping. No sub-folders, no `tasks.md`, no `tests.md`.

Pass each section agent both `section_skills` and `sub_section_skills`
(per-sub-slug list) from Step 4's mapping.

Wait for all agents to complete before showing the summary.

### Step 6 — Summary Report

After all agents complete, report:

```
✓ plan-product tree generated:

  plan-product/
    product-roadmap.md
    specs/
      {section}/
        _index.md             ← incluye Skills relevantes
        {sub-section}.spec.md ← incluye Skills relevantes

Review the files. Run /agent-os:shape-spec on any sub-section to go deeper.
```

### Step 7 — Optional: Link Standards

Ask: *"Should I check agent-os/standards/index.yml and link relevant standards
to each section's _index.md?"*

If yes, read the standards index (it stays at `agent-os/standards/index.yml`
because it is owned by `/agent-os:discover-standards`, a different skill),
identify relevant standards per section, and add a "Relevant Standards" list
to each `plan-product/specs/{section}/_index.md`.

## Examples

### Positive Trigger

User: "I have a rough proposal for a pharmacy management system. Can you generate the plan-product tree from it?"

Expected behavior: Skill activates, asks for the proposal text, runs the Q&A loop covering identity/roles/sections/entities, confirms the file tree and the auto-detected skill mapping, then spawns parallel agents to write all plan-product files.

### Non-Trigger

User: "There's a bug in the login controller — the session isn't being saved correctly."

Expected behavior: Do not use this skill. Debug the session issue directly by reading the relevant code.

## Troubleshooting

### Skill generates files without completing Q&A

- Error: Files are created before the user has confirmed scope.
- Cause: Step 4 confirmation was skipped or answered too loosely.
- Solution: Always show the full file tree (and skill mapping) and wait for explicit user confirmation before spawning agents.

### Sub-agents write files in the wrong format

- Error: Output files contain template placeholders or wrong structure.
- Cause: Agent prompt did not include the exact templates from references/file-templates.md.
- Solution: Read references/file-templates.md before spawning and paste templates verbatim into each agent prompt.

### Skill triggers on general coding tasks

- Error: Skill activates when user asks about unrelated development work.
- Cause: Description trigger phrases overlap with generic requests.
- Solution: Check that the user's request contains "proposal", "plan-product", or "spec tree" context. If not, do not use this skill.
