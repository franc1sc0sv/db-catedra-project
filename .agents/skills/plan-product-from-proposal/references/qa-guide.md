# Q&A Guide

Full question bank for the interactive co-working process. Follow this guide in order.
Use `AskUserQuestion` for every question — never free-text assume an answer.

## Core Rules

- The AI decides how many questions are needed. Skip any category fully resolved
  by the proposal. Do not ask "just to confirm" — only ask when the answer is
  genuinely missing or ambiguous.
- Group up to 2 related questions in a single AskUserQuestion call. Never more.
- Always offer 3-4 concrete options derived from the proposal (never generic placeholders).
- **Never label any option as "(Recommended)"**. Let the user pick without bias.
- For lists (sub-sections, entities, problems), use `multiSelect: true`.
- Never proceed to file generation with open doubts — if something is unclear, ask.
- If the user's answer opens a new doubt, ask it before moving on.
- Do not ask the user to confirm relevant skills section-by-section. Skills are
  auto-detected from the session-start skill list (Step 1.5 in SKILL.md) and
  previewed in Step 4 for bulk adjustment before generation.

---

## Category 1: Identity

**Goal**: Confirm the product name and nail a clear 2-3 sentence description.

### Question 1.1 — Product Name

Only ask if the name is missing or ambiguous in the proposal.

```
AskUserQuestion:
  question: "What should this product be called?"
  header: "Product name"
  options:
    - label: "[AI-derived option from proposal]"
      description: "Based on [clue from proposal]"
    - label: "[Second AI-derived option]"
      description: "Alternative interpretation"
    - label: "Something else"
      description: "I'll type the name"
```

### Question 1.2 — Core Description

Offer 3 AI-derived one-sentence descriptions for the user to pick or refine.

```
AskUserQuestion:
  question: "Which of these best captures what [Product Name] is in one sentence?"
  header: "Core description"
  options:
    - label: "[AI-derived description A]"
      description: "Emphasizes [angle A]"
    - label: "[AI-derived description B]"
      description: "Emphasizes [angle B]"
    - label: "[AI-derived description C]"
      description: "Emphasizes [angle C]"
```

### Question 1.3 — Problems Solved

```
AskUserQuestion:
  question: "Which problems does [Product Name] solve? Select all that apply."
  header: "Problems solved"
  multiSelect: true
  options:
    - label: "[AI-derived problem from proposal]"
    - label: "[AI-derived problem from proposal]"
    - label: "[AI-derived problem from proposal]"
    - label: "A different problem"
```

---

## Category 2: Users & Roles

**Goal**: Know exactly who uses the product and what each role can do differently.

### Question 2.1 — User Roles

```
AskUserQuestion:
  question: "Who are the people using [Product Name]? Select all that apply."
  header: "User roles"
  multiSelect: true
  options:
    - label: "[AI-derived role, e.g. Administrator]"
      description: "[Brief: what they manage]"
    - label: "[AI-derived role, e.g. Salesperson]"
      description: "[Brief: what they do]"
    - label: "[AI-derived role, e.g. End Customer]"
      description: "[Brief: their relationship to the product]"
    - label: "A different role"
```

### Question 2.2 — Role Distinctions

Ask one follow-up per role if the proposal is vague on what each role can/cannot do.
Example:

```
AskUserQuestion:
  question: "Can a [Role] create new [entities], or can they only view existing ones?"
  header: "[Role] permissions"
  options:
    - label: "Create and manage their own"
    - label: "View only — no creation"
    - label: "Full access to everything"
    - label: "Depends — I'll clarify"
```

### Question 2.3 — Admin / Superuser

```
AskUserQuestion:
  question: "Is there a super-admin or platform admin who manages other users or system settings?"
  header: "Admin role"
  options:
    - label: "Yes — a dedicated admin role"
      description: "Someone manages users, settings, or access"
    - label: "No — all users are peers"
      description: "No elevated admin account"
    - label: "Not sure yet"
```

---

## Category 3: Sections

**Goal**: Agree on the top-level product areas (think: navigation items or major screens).

### Question 3.1 — Proposed Sections

Present AI-derived sections from the proposal. Use multi-select for confirmation.

```
AskUserQuestion:
  question: "I see these main areas in your proposal. Which ones are correct? Select all that apply."
  header: "Product sections"
  multiSelect: true
  options:
    - label: "[AI-derived section, e.g. Authentication]"
      description: "Sign up, login, password reset"
    - label: "[AI-derived section, e.g. Dashboard]"
      description: "Overview of activity and metrics"
    - label: "[AI-derived section, e.g. Inventory]"
      description: "Product catalog and stock management"
    - label: "There are more — I'll describe them"
```

### Question 3.2 — Missing Sections

If user indicates missing sections, ask:

```
AskUserQuestion:
  question: "What other sections should be included?"
  header: "Additional sections"
  options:
    - label: "[Guess from context, e.g. Reports]"
    - label: "[Guess from context, e.g. Settings]"
    - label: "[Guess from context, e.g. Billing]"
    - label: "Something else — I'll describe it"
```

### Question 3.3 — MVP Cut

```
AskUserQuestion:
  question: "Which of these sections ship in the MVP (day one)? Select all that apply."
  header: "MVP sections"
  multiSelect: true
  options:
    - [one option per confirmed section]
```

---

## Category 4: Data Entities

**Goal**: Identify the core nouns — what users create, view, and manage.

### Question 4.1 — Core Entities

```
AskUserQuestion:
  question: "What are the main things users create or manage in [Product Name]? Select all that apply."
  header: "Core entities"
  multiSelect: true
  options:
    - label: "[AI-derived entity, e.g. Invoice]"
      description: "Bills sent to clients"
    - label: "[AI-derived entity, e.g. Product]"
      description: "Items in the catalog"
    - label: "[AI-derived entity, e.g. Client]"
      description: "Customers or accounts"
    - label: "Other entities"
```

### Question 4.2 — Relationships

For each confirmed entity pair that seems related:

```
AskUserQuestion:
  question: "How does a [Entity A] relate to a [Entity B]?"
  header: "[A] → [B]"
  options:
    - label: "[A] has many [B]s"
      description: "One A can have multiple Bs"
    - label: "[A] belongs to one [B]"
      description: "Each A is linked to exactly one B"
    - label: "They don't directly relate"
    - label: "It's more complex — I'll explain"
```

---

## Category 5: Integrations & Constraints

**Goal**: Surface third-party services, auth choices, and any hard constraints.

### Question 5.1 — Third-Party Services

```
AskUserQuestion:
  question: "Does [Product Name] integrate with any external services? Select all confirmed ones."
  header: "Integrations"
  multiSelect: true
  options:
    - label: "[AI-derived service from proposal, e.g. Stripe]"
      description: "Payments"
    - label: "[AI-derived service, e.g. SendGrid]"
      description: "Email delivery"
    - label: "[AI-derived service, e.g. Google OAuth]"
      description: "Social login"
    - label: "None confirmed yet"
```

### Question 5.2 — Authentication Method

```
AskUserQuestion:
  question: "How do users authenticate?"
  header: "Auth method"
  options:
    - label: "Email + password"
      description: "Standard credential-based login"
    - label: "OAuth (Google, GitHub, etc.)"
      description: "Social login"
    - label: "Both — email/password and social"
    - label: "Something else — JWT, magic link, SSO"
```

### Question 5.3 — Scale & Non-Functionals

Only ask if the proposal hints at scale or performance requirements:

```
AskUserQuestion:
  question: "Any specific scale or performance expectations?"
  header: "Scale"
  options:
    - label: "Small — under 1,000 users at launch"
    - label: "Medium — thousands of users, standard performance"
    - label: "High — needs caching, queues, or async jobs"
    - label: "Not defined yet"
```

---

## Category 6: Priority

**Goal**: Lock the hard MVP line. What ships day one, what waits.

### Question 6.1 — MVP Confirmation

```
AskUserQuestion:
  question: "Confirm the MVP scope. What must work on day one for the product to be usable?"
  header: "MVP scope"
  options:
    - label: "[AI-proposed MVP summary based on earlier answers]"
      description: "Sections: [list] — everything else post-launch"
    - label: "Narrower — only [subset]"
      description: "Strip it down further"
    - label: "Broader — include [additional section]"
      description: "Add one more area to MVP"
    - label: "Let me redefine it"
```

---

## Section Deep-Dive Questions

Run this block for each confirmed section, one section at a time.

### Step A — Sub-section List

```
AskUserQuestion:
  question: "What sub-sections live inside [Section]? Select all that apply."
  header: "[Section] sub-sections"
  multiSelect: true
  options:
    - label: "[AI-derived sub-section, e.g. Registration]"
      description: "New user sign-up"
    - label: "[AI-derived sub-section, e.g. Login]"
      description: "Returning users"
    - label: "[AI-derived sub-section, e.g. Password Reset]"
      description: "Account recovery"
    - label: "More sub-sections — I'll describe them"
```

### Step B — User Flow (per sub-section)

For each confirmed sub-section:

```
AskUserQuestion:
  question: "Walk me through the [sub-section] flow. What does the user do, and what happens at each step?"
  header: "[sub-section] flow"
  options:
    - label: "[AI-derived flow summary from proposal]"
      description: "Based on what you shared"
    - label: "Similar but different — I'll describe"
    - label: "Much simpler — just [short description]"
    - label: "More complex — let me explain"
```

### Step C — Screen Requirements (per sub-section)

```
AskUserQuestion:
  question: "What needs to be visible or interactive on the [sub-section] screen?"
  header: "[sub-section] UI"
  options:
    - label: "[AI-derived UI summary, e.g. Form with email, password, submit button]"
    - label: "Same but add [extra element]"
    - label: "Simpler than that"
    - label: "I'll describe it"
```

### Step D — UI Pattern (per sub-section, optional)

Only ask if the pattern isn't obvious:

```
AskUserQuestion:
  question: "Any specific UI pattern in mind for [sub-section]?"
  header: "UI pattern"
  options:
    - label: "Standard form / page"
    - label: "Modal or drawer"
    - label: "Table / data grid"
    - label: "Wizard / multi-step flow"
```
