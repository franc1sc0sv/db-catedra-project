# File Templates

All output files the skill generates at runtime. Pass relevant templates verbatim to sub-agents.

**Writing rule for every file:**
Write in plain, conversational language (Spanish or English — match the proposal).
A new developer — or a non-technical stakeholder — must pick up any file and
understand the whole picture in under 2 minutes. Favor short paragraphs over
bullet lists. No jargon, no heavy markdown, no acronyms without explanation.
These files define the project at a high level. Technical depth belongs in code.

---

## 1. `plan-product/product-roadmap.md`

```markdown
# Product Roadmap

[1-2 sentences on development philosophy: what gets built first and why.]

## MVP — What ships first

[Paragraph describing the first usable version. What can a user actually accomplish
on day one? What is deliberately left out and why?]

## Sections

### 1. [Section Title]
[Two sentences: what this area does and why it matters to the user.]

### 2. [Section Title]
[Two sentences.]

[Sections are ordered by development priority. Each maps to a main area of the product —
think of them as navigation items or major screens a user navigates to.]
```

---

## 2. `plan-product/specs/{section}/_index.md`

```markdown
# [Section Name]

[1-2 paragraphs from the user's perspective: what do they come here to do?
What problem does this section solve for them?]

## What's inside this section

[Short paragraph listing and briefly explaining the sub-sections.
Example: "Authentication is split into three parts: Registration handles new user
sign-up, Login covers returning users, and Password Reset lets users recover access."]

- **[sub-section]** — [one sentence on what it does]
- **[sub-section]** — [one sentence on what it does]

## What data does this section work with?

[1-2 sentences naming the relevant entities and how they're used here.]

## What does this section depend on?

[One sentence naming other sections or external services, or: "No dependencies — this
section can be built standalone."]

## Skills relevantes

[Lista de skills (comandos /skill) que un implementador puede invocar al trabajar en
esta sección. Una línea por skill, con una frase de cuándo aplica. Si no hay skills
relevantes detectadas, omitir la lista pero dejar el encabezado con "Ninguna detectada".]

- `/laravel-specialist` — para los modelos Eloquent y los controladores de la sección
- `/security-review` — antes de mergear cambios sensibles a esta área
```

---

## 3. `plan-product/specs/{section}/{sub-section}.spec.md`

**File naming**: flat, one file per sub-section directly under the section folder.
No sub-folders. Examples: `plan-product/specs/auth/login-web.spec.md`,
`plan-product/specs/sales/new-sale.spec.md`.

**Goal of this file**: a short, conversational document that lets a new developer or
non-technical stakeholder understand what this feature is and how it works in under
2 minutes. No tasks, no tests, no implementation details — only narrative plus a
short pointer to the skills that could help build it.

```markdown
# [Sub-section Title]

## What does this part of the system do?
[2-3 paragraphs of plain prose. What problem does it solve? What does the user
accomplish here? Write as you would explain it to a colleague over coffee.]

## Who uses it?
[One sentence naming the role(s) that access this feature.]

## How does it work?
[Narrative paragraph describing the main flow: what the user does, what the system
shows, and what happens at the end. Cover important edge cases inside the same prose
when they matter — do not fragment into bullet lists.]

## Skills relevantes

[Lista corta de skills aplicables a esta sub-sección específica. Una línea por skill
con la razón concreta (no genérica). Si no hay match claro, dejar "Ninguna detectada".]

- `/laravel-specialist` — para el flujo de validación de la receta
- `/tailwind-css-patterns` — para la tabla de pendientes en la cola
```

**Hard rules for this file:**
- No tasks, no checkboxes, no `- [ ]` items.
- No test cases, no Gherkin, no Given/When/Then.
- No implementation hints in the narrative sections (frameworks, file paths, code).
  Implementation hints belong only in the `## Skills relevantes` block.
- Prefer paragraphs over bullets. Bullets only when the content is truly a flat list
  (the Skills relevantes block is the natural exception).

