# Agent Spawning Guide

How to spawn sub-agents in Step 5. Launch all agents simultaneously in a single message
(multiple Agent tool calls). Do NOT write any files yourself — agents do all writing.

---

## What Every Agent Receives

Each agent prompt must include all of the following:

1. **Gathered Q&A data** — the full structured output from the Q&A session relevant to its scope
2. **Exact file templates** — copy the relevant templates verbatim from `references/file-templates.md`
3. **Absolute file paths** — every file the agent must create, with full path from project root
4. **Skill mapping** (Section Agent only) — the auto-detected skills relevant to the section and to each sub-section, ready to drop into the `## Skills relevantes` blocks
5. **Writing rule** — paste this exactly: "Write in plain, conversational language (match proposal language). A new developer or non-technical stakeholder must understand the whole picture in under 2 minutes. Short paragraphs over bullet lists. No jargon. No heavy markdown."
6. **Instruction to auto-proceed** — "Write all files and stop. Do not ask for approval."

---

## Agent 1: Roadmap Agent

Writes: `plan-product/product-roadmap.md`

### Prompt template

```
You are writing the product roadmap file for a new project.

## What you know about the product

Product name: [NAME]
MVP sections: [sections confirmed as MVP]
All sections (including post-launch): [full section list]

## File to create

**File:** plan-product/product-roadmap.md
[paste product-roadmap.md template from file-templates.md]

## Writing rule

Write in plain, conversational language (match the proposal language). A new
developer or non-technical stakeholder must understand the whole picture in
under 2 minutes. Short paragraphs over bullet lists. No jargon. No heavy markdown.

Fill every placeholder with real content from the Q&A data above. Do not leave any
template placeholder text like "[2-3 sentences]" in the output.

Write the file and stop. Do not ask for approval.
```

---

## Agent 2: Section Agent (one per section)

Writes for one section: `_index.md` + one flat `{sub-section}.spec.md` per sub-section.
No sub-folders, no `tasks.md`, no `tests.md`. Each generated file MUST end with a
populated `## Skills relevantes` block.

### Prompt template

```
You are writing the specification files for the [SECTION_NAME] section of a project.

## What you know about this section

Section name: [SECTION_NAME]
Section folder: plan-product/specs/[section-folder]/
Section overview: [1-2 paragraph description from Q&A]
Relevant data entities: [entities used in this section]
Dependencies: [other sections or external services this depends on]

Section-level relevant skills:
  [list of /skill commands with one-line reasons, from auto-detected mapping
   confirmed in Step 4 — e.g.
   - /laravel-specialist — para los modelos Eloquent y los controladores de la sección
   - /security-review — antes de mergear cambios sensibles a esta área
   - /agent-os:discover-standards — para alinear con los standards del proyecto
  ]

Sub-sections:
[For each sub-section, include:]
  Sub-section name: [NAME]
  Sub-section file slug: [kebab-case slug used as filename]
  Who uses it: [role(s)]
  Main flow: [narrative description]
  Edge cases / special behavior: [narrative, optional]
  Sub-section relevant skills:
    [list of /skill commands with one-line concrete reasons specific to this
     sub-section — e.g.
     - /laravel-specialist — para el flujo de validación de la receta
     - /tailwind-css-patterns — para la tabla de pendientes en la cola
    ]

## Files to create

**File 1:** plan-product/specs/[section-folder]/_index.md
[paste _index.md template from file-templates.md]

Render the `## Skills relevantes` block at the bottom using the section-level
skill list above. One bullet per skill: "`/skill-name` — reason".

**For each sub-section [SUB]:**

**File:** plan-product/specs/[section-folder]/[sub-slug].spec.md
[paste {sub-section}.spec.md template from file-templates.md]

Render the `## Skills relevantes` block at the bottom using the sub-section
relevant skills list for that specific sub-section. One bullet per skill:
"`/skill-name` — concrete reason".

If a section or sub-section has no detected relevant skills, replace the bullet
list with the single line: "Ninguna detectada." Keep the heading.

## Writing rule

Write in plain, conversational language (match the proposal language). A new
developer or non-technical stakeholder must understand each file in under 2 minutes.
Prefer paragraphs over bullet lists. No jargon. No heavy markdown.

For each .spec.md file:
- The narrative sections (Qué hace / Quién lo usa / Cómo funciona)
  describe the feature for a human reader.
- No tasks, no checkboxes, no `- [ ]` items in the narrative sections.
- No test cases, no Gherkin, no Given/When/Then.
- No implementation hints in the narrative — those belong only in the
  `## Skills relevantes` block.
- Edge cases live inside the "How does it work?" prose, not in a separate list.

Fill every placeholder with real content from the Q&A data above. Do not leave template
placeholder text in the output.

Write all files for this section and stop. Do not ask for approval.
```

---

## Spawning Rules

1. **All agents launch simultaneously** — put all Agent tool calls in a single message
2. **One agent per section** — if there are 4 sections, spawn 4 section agents in parallel
3. **No file overlap** — each agent owns a distinct set of files, never the same file
4. **Wait for all** — do not report the summary until all agents have completed
5. **Do not write files yourself** — the main skill only does Q&A and orchestration
6. **Pass the skill mapping** — Section Agents must receive both section-level and per-sub-section skill lists from Step 4's confirmed mapping. Do not let agents guess which skills are relevant.
