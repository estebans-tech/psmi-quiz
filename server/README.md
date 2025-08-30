# Questions API & Data Authoring

This service exposes PSM I practice questions from multiple JSON files (by category)
and lets clients request subsets via a CSV `filter`. The server route is deliberately
thin; parsing and file-loading live in `server/utils`.

## Directory layout

server/data/<lang>/
  theory.json      # IDs prefixed: q-theory-###
  values.json      # IDs prefixed: q-values-###
  team.json        # IDs prefixed: q-team-###
  events.json      # IDs prefixed: q-events-###
  artifacts.json   # IDs prefixed: q-artifacts-###

- Current language: `en`. Other `lang` values are accepted but fall back to `en`
  with a server-side warning (no hard error).
- Each file contains an array of `Question` (schema below).

## Endpoint

GET /api/questions?lang=en&filter=<csv>

### Query

- lang — language code; only `en` is supported now (others fallback to `en` with a warning).
- filter — CSV of categories, case-insensitive.
  Allowed: theory, values, team, events, artifacts.
  - Omitted or filter=all ⇒ all categories.
  - Unknown tokens are ignored and logged (response still succeeds).

### Response

- Array of questions with a server-injected `category` field.
- No server-side shuffle; the client shuffles (seeded) and honors `lockOptionOrder`.

Example response item:

{
  "id": "q-values-001",
  "type": "single",
  "prompt": "Which Scrum value encourages transparency…?",
  "options": [
    { "id": "a", "text": "Openness" },
    { "id": "b", "text": "Speed" },
    { "id": "c", "text": "Hierarchy" }
  ],
  "correct": ["a"],
  "explanation": "Openness supports transparency and inspection.",
  "version": 1,
  "lockOptionOrder": false,
  "category": "values"
}

### Examples

- All categories (default):
  /api/questions?lang=en
  /api/questions?lang=en&filter=all

- Subset (CSV):
  /api/questions?lang=en&filter=values,events

## Question schema (authoring)

type QuestionOption = { id: string; text: string }

type Question = {
  id: string                     // must be globally unique per lang
  type: 'single' | 'multi'
  prompt: string
  options: QuestionOption[]
  correct: string[]              // references option.id
  explanation: string
  version: number
  lockOptionOrder?: boolean      // true = keep JSON order; false/omitted = shuffle client-side
}

## Authoring rules

- ID prefixes by file (human-friendly and helps reviews):
  - theory.json   → q-theory-###
  - values.json   → q-values-###
  - team.json     → q-team-###
  - events.json   → q-events-###
  - artifacts.json→ q-artifacts-###
- IDs must be globally unique per language.
- True/False questions:
  - Put options in the JSON as True, then False.
  - Set "lockOptionOrder": true (prevents client shuffle).
- Keep "correct" in sync with options[*].id.
- Explanation should be concise and exam-aligned.

## Validation (tests/CI)

A sanity test should load all files under server/data/en/ and check:

- Global uniqueness of question.id (across all category files).
- All "correct" IDs exist in the corresponding options.
- T/F questions (texts “true”/“false”, case-insensitive) must have:
  - lockOptionOrder: true
  - JSON order: True, then False.

These are guardrails only; a stricter duplicate-ID report (with file names) can be added later.
