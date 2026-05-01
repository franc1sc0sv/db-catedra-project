---
name: specs-from-plan-product
description: >-
  Take the plan-product spec tree and run the full agent-os shape-spec flow per
  spec in batch mode. Reads every plan-product/specs/{section}/{sub}.spec.md,
  pre-answers all shape-spec questions from the spec content, consolidates open
  questions into one user-facing round, then spawns parallel agents that produce
  agent-os/specs/{domain}/{feature-slug}/ folders ready to implement.
  Triggers on: "shape all specs", "run shape-spec on all", "specs from plan-product",
  "batch shape", "generate impl specs", "implement all specs".
license: project
allowed-tools:
  - Read
  - Write
  - Bash
  - Agent
  - AskUserQuestion
metadata:
  category: project-planning
  tags: [agent-os, shape-spec, batch, plan-product, specs]
  status: ready
  version: 1
---

# Specs From Plan Product

Batch-shape every `plan-product/specs/` spec into an implementation-ready
`agent-os/specs/{domain}/{feature-slug}/` folder by running shape-spec in
pre-answered (BATCH MODE) per spec.

Agents do all file creation. This skill only reads, asks questions, and spawns agents.

---

## Workflow

### Step 1 — Discover Specs

Scan `plan-product/specs/` recursively. Collect every `.spec.md` file;
exclude `_index.md`. For each file derive:

- **domain** — the section folder name (e.g., `ventas`, `recetas`)
- **feature-slug** — the filename without `.spec.md` (e.g., `nueva-venta`)
- **content** — full file text (all four sections: what it does, who uses it,
  how it works, skills relevantes)

Also read:
- `plan-product/product-roadmap.md` — product vision and MVP scope
- `agent-os/standards/index.yml` — available standards for matching

### Step 2 — Show Manifest & Confirm Scope

Present the full list grouped by domain. Use AskUserQuestion:

```
I found {N} specs across {M} sections. Which should I shape?

A) All specs ({N} total)
B) Only MVP specs (inferred from product-roadmap.md)
C) Specific sections — tell me which
D) Specific spec files — list them
```

Wait for explicit confirmation. Filter the working set accordingly.

### Step 3 — Pre-Gather Shared Context (once, not per spec)

Ask two questions that apply across ALL specs so they are never repeated
per-spec. Use AskUserQuestion for each:

**Q1 — Codebase references**

```
Is there existing code I should study as reference for all specs?

Examples:
- "app/Http/Controllers/Web/Auth/ shows the full request lifecycle"
- "app/Services/ for the service layer pattern"
- "No existing references yet"

(Point to files, folders, or features. I will read and summarise them.)
```

Read any paths provided. Build a references summary to inject into every
agent prompt.

**Q2 — Cross-cutting constraints**

```
Any constraints that apply to ALL specs?

Examples:
- "Always use the service-interface pattern"
- "Web-only routes — no API endpoints"
- "None — decide per spec"
```

Visuals (step 2 of interactive shape-spec) are skipped here; plan-product
specs are code features, not UI mockups. Visuals can be added later via
`/agent-os:shape-spec` on any individual spec.

### Step 4 — Auto-Map Each Spec to Shape-Spec Inputs

For each spec in the working set, silently derive the following inputs that
shape-spec would otherwise ask interactively:

| Input | Source |
|---|---|
| Scope | "What does this part do?" section of the .spec.md |
| Roles | "Who uses it?" section + role names mentioned |
| Flow + edge cases | "How does it work?" section |
| Domain | Section folder name |
| Feature slug | Sub-section filename slug |
| Standards | Match "Skills relevantes" + keywords → agent-os/standards/index.yml |
| Codebase refs | Step 3 Q1 results + any file paths named in the spec |
| Product context | MVP excerpt from product-roadmap.md |

Read the full content of every matched standard from `agent-os/standards/`
so the content is available to inject verbatim into agent prompts.

### Step 5 — Identify Open Questions

After auto-mapping, flag specs where the source data is genuinely ambiguous
or missing. Collect ALL gaps across all specs into a single AskUserQuestion
call (never ask per-spec):

```
Before generating, I need clarity on {N} points across {M} specs:

**{domain} / {feature-slug}:**
  - [specific ambiguity from the spec]

**{domain} / {feature-slug}:**
  - [specific ambiguity]

(Answer each, or "skip" to exclude that spec from this batch)
```

Apply answers. Mark skipped specs, exclude from generation.

Only flag ambiguities that are truly blockers (missing actor, contradictory
flow, unknown business rule). Do NOT flag things that can be inferred or
that the codebase standards already resolve.

### Step 6 — Show Full Batch Plan

Present a pre-flight summary. Use AskUserQuestion:

```
Ready to shape {N} specs. Each produces:

  agent-os/specs/{domain}/{feature-slug}/
    spec.md        ← what & why, implementation approach
    tasks.md       ← implementation checklist
    shape.md       ← scope, decisions, context
    standards.md   ← full content of matched standards
    references.md  ← code pointers with relevance notes
    sub-specs/     ← empty folder for future technical breakdowns

  agent-os/specs/{domain}/_index.md  ← created/updated with a row per feature

Specs queued:
  ✓ {domain}/{feature-slug}   → [matched standards]
  ✓ ...
  ⏭ {domain}/{feature-slug}   → SKIPPED — [reason]

Proceed? (yes / adjust)
```

Wait for explicit confirmation before spawning agents.

### Step 7 — Spawn Parallel Agents

Immediately after confirmation, spawn one agent per spec. Launch ALL agents
in a single message (multiple Agent tool calls). Do NOT write any files
yourself.

Each agent prompt must:
1. Begin with `BATCH MODE` label (signals shape-spec to skip interactive steps)
2. Provide domain, feature-slug, and output folder path
3. Paste the full plan-product spec content verbatim
4. Include cross-cutting constraints from Step 3
5. Include codebase references summary from Step 3
6. Include full standard file content (not summaries) for every matched standard
7. Include the relevant product-roadmap excerpt
8. List all 7 output targets with exact paths and content rules (see template below)

**Agent prompt template:**

```
BATCH MODE — shape-spec for one feature. Write all files. Do not ask questions. Do not wait for approval.

## Feature

- **Domain:** {domain}
- **Feature slug:** {feature-slug}
- **Output folder:** agent-os/specs/{domain}/{feature-slug}/

## Source Spec (plan-product)

{full .spec.md content}

## Product Context

{relevant MVP excerpt from product-roadmap.md}

## Cross-cutting Constraints

{from Step 3 Q2}

## Codebase References

{file paths + one-line relevance note per path}

## Standards to Apply

{full verbatim content of each matched standard, separated by ---}

---

## Files to Create

### 1. agent-os/specs/{domain}/_index.md

Check if this file already exists.
- Does NOT exist → create with this template:

  # {Domain} — Specs Index

  | Feature | Status | Spec | Tasks |
  |---|---|---|---|
  | {feature-slug} | draft | [spec]({feature-slug}/spec.md) | [tasks]({feature-slug}/tasks.md) |

- Already exists → append this row to the table:
  | {feature-slug} | draft | [spec]({feature-slug}/spec.md) | [tasks]({feature-slug}/tasks.md) |

### 2. agent-os/specs/{domain}/{feature-slug}/spec.md

Cover:
- What this feature does (from source spec)
- Why it exists — business value and user need
- Implementation approach aligned with the standards and codebase patterns above
- Key technical decisions and constraints

Write in plain prose. No task lists. No test cases.

### 3. agent-os/specs/{domain}/{feature-slug}/tasks.md

Implementation checklist.
- Task 1: "Save spec documentation" — mark as complete (✅), files already written by this agent
- Remaining tasks: concrete Laravel implementation steps derived from the spec flow

Name the exact files to create in each task. Use this project's file placement:
- Controllers:       app/Http/Controllers/Web/{Domain}/{Name}Controller.php
- Service interface: app/Services/{Domain}/Contracts/{Name}ServiceInterface.php
- Service:           app/Services/{Domain}/{Name}Service.php
- Form request:      app/Http/Requests/{Domain}/{Name}Request.php
- Model:             app/Models/{Name}.php
- Migration:         database/migrations/YYYY_MM_DD_HHMMSS_create_{table}.php
- Views:             resources/views/{role}/{domain}/{view}.blade.php
- Routes:            routes/web.php (add Route::middleware group)

### 4. agent-os/specs/{domain}/{feature-slug}/shape.md

Template:

  # {Feature Name} — Shaping Notes

  ## Scope

  [What we're building, from source spec]

  ## Decisions

  - [Key decisions derived from the spec flow and standards]
  - [Constraints applied]

  ## Context

  - **Visuals:** None
  - **References:** [list of codebase paths referenced]
  - **Product alignment:** [relevant MVP notes]

  ## Standards Applied

  - {standard-name} — [one sentence: why it applies here]

### 5. agent-os/specs/{domain}/{feature-slug}/standards.md

Template:

  # Standards for {Feature Name}

  The following standards apply to this work.

  ---

  ## {standard-folder}/{standard-name}

  {full content of the standard file}

  ---

  (repeat for each standard)

### 6. agent-os/specs/{domain}/{feature-slug}/references.md

Template:

  # References for {Feature Name}

  ## Similar Implementations

  ### {Reference name}

  - **Location:** `{file path}`
  - **Relevance:** [one sentence]
  - **Key patterns:** [what to borrow from this]

### 7. agent-os/specs/{domain}/{feature-slug}/sub-specs/.gitkeep

Create an empty `.gitkeep` file to establish the sub-specs directory.

---

Write all 7 targets. Stop when done.
```

Wait for all agents to complete before showing the summary.

### Step 8 — Summary Report

```
✓ {N} specs shaped and ready:

  agent-os/specs/
    {domain}/
      _index.md
      {feature-slug}/    (spec.md, tasks.md, shape.md, standards.md, references.md, sub-specs/)
    ...

  ⏭ Skipped ({M} specs):
    - {domain}/{feature-slug}: [reason]

The spec-integrity hook validated each file as it was written.
Open any tasks.md to begin implementation, or run /agent-os:shape-spec
on a skipped spec to shape it interactively.
```

---

## Troubleshooting

### spec-integrity hook warns about missing _index.md row

The agent that writes `_index.md` may have run after another agent already
triggered the hook. This is a timing issue — not a content error. Verify
that `_index.md` contains the row; if so, the warning can be ignored.

### Agent generates generic tasks instead of specific file paths

The agent prompt must include the **exact file placement rules** from the
`tasks.md` section of the template above. If tasks are generic, re-run the
affected spec with a more explicit prompt including the placement table.

### Skill triggers on unrelated requests

Check that the user's message contains "shape", "spec", "plan-product", or
"implement" context. If not, do not activate this skill.
