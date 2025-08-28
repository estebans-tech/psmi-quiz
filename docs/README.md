# Question Parsing & QA Checklist (v4)

This document defines how to parse raw question blocks into the JSON format used by the app and how to perform quality checks while doing so.

---

## Input format & cleaning

- Each **question block** is separated by one or more blank lines.
- Remove these lines if present:
  - Lines starting with `->`
  - Headings like `Scrum.org - …`
  - `Question X of Y`
  - The label `Feedback`
- Normalize whitespace:
  - Replace NO-BREAK SPACE (U+00A0) with a regular space.
  - Trim leading/trailing whitespace on all captured strings.

---

## Type, prompt, and instructions

- **`type`**
  - If the first line explicitly says `single` or `multi`: **use it as-is**.
  - Otherwise infer:
    - Exactly a **True/False** pair → `single`.
    - Contains **“Choose the best answer”** → `single`.
    - Contains **“Choose the best N answers”**, **“Select the best N answers”**, or **“Choose/Select all that apply”** → `multi`.
    - If none of the above: `single` if exactly one `[x]`, else `multi` if two or more `[x]`.

- **`prompt`**
  - The question text on the second line (after an explicit `single`/`multi`) or the first non-empty line otherwise.
  - If selection instructions (e.g., “Choose the best **two** answers”, “Select all that apply”) appear on their own line, **append them to the prompt**.
  - **Do not** alter the wording (beyond whitespace normalization).

---

## Options & correctness

- Collect every line starting with `- [ ]` or `- [x]` **in input order**.
- Assign IDs alphabetically: `A, B, C, …`.
- `text` = everything after the checkbox marker; normalize whitespace (incl. U+00A0 → space).
- `correct` = array of the IDs whose options had `[x]`.

**Validation**
- `single` must have **exactly 1** correct option.
- `multi` must have **≥ 1** correct option. (Flag a warning if 0.)

---

## Explanation & source

- `explanation` = the **last non-empty paragraph after the options**, after removing:
  - `Great! That is correct.` (standalone line or as a leading phrase)
  - `Good try, but that is incorrect.`
- If the resulting explanation is **empty**:
  - **Strategy A (default):** leave `explanation` empty and omit `source`.
  - **Strategy B (on request or when we correct an obvious mistake):** provide a concise `explanation` and set `source` (e.g., `Scrum Guide 2020 — <section>`).

**If we correct clearly wrong `[x]` markings**
- Update `correct`.
- Add a brief rationale in `explanation`.
- Set an appropriate `source`.

---

## IDs & metadata

- `id` = `<prefix>-###` (three digits), starting at **001 per prefix** (e.g., `q-teams-001`).
- `version` = `1`.
- Omit `shuffle` unless specified elsewhere.
- `lockOptionOrder: true` if:
  - The block contains the literal line `lockOptionOrder`, **or**
  - The options are a **True/False** pair (any order).

---

## Spelling & small fixes

- Normalize obvious typos in **options** and **explanation** (but **never** in the **prompt**).
- Preserve original punctuation in options (beyond whitespace cleanup).

---

## Deduplication (on request)

- If two items have the **same prompt** and the **same set of option texts** (order may differ):
  - Keep the **first** occurrence and drop subsequent duplicates.

---

## Quality review (critical reading)

Pay special attention to common pitfalls:

- **Events & timeboxes** (Daily 15m; Review ≤4h; Retrospective ≤3h; Planning ≤8h for 1-month Sprints).
- **Artifacts vs. Commitments**  
  - Artifacts: Product Backlog, Sprint Backlog, Increment.  
  - Commitments: Product Goal (for Product Backlog), Sprint Goal (for Sprint Backlog), Definition of Done (for Increment).
- **Accountabilities**
  - Product Owner: orders the Product Backlog; maximizes value; tracks progress toward the **Product Goal**.
  - Developers: own the **Sprint Backlog**; update it; estimate the work; attend Daily Scrum.
  - Scrum Master: ensures events occur and are effective; coaches on empiricism and self-management; serves PO, team, and organization.
- **Sprint rules**
  - Sprint is cancelled only if the **Sprint Goal** becomes obsolete (by PO).
  - Scope may be clarified/re-negotiated with PO; **do not** endanger the Sprint Goal.
- **Single vs. Multi**
  - “Choose the best answer” → `single`.
  - “Choose the best N answers” / “Select … all that apply” → `multi`.
  - True/False pair → `single` **and** `lockOptionOrder: true`.

---

## JSON shape (for reference)

```ts
export type QuestionType = 'single' | 'multi';
export type QType = 'mcq' | 'msq';

export interface QuestionOption {
  id: string;      // 'A', 'B', ...
  text: string;
  explanation?: string;
}

export interface Question {
  id: string;                    // <prefix>-###
  type: QuestionType;            // 'single' | 'multi'
  prompt: string;
  options: QuestionOption[];     // IDs A..Z in input order
  correct: string[];             // always an array
  explanation?: string;          // last paragraph after options (cleaned)
  source?: string;               // e.g., 'Scrum Guide 2020 — <section>'
  shuffle?: boolean;             // omitted by default
  version: number;               // 1
  lockOptionOrder?: boolean;     // see rules above
}
