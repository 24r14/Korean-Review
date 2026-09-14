# Korean Review · Content QA Checklist

This checklist is used before any lesson pack is connected to the production UI.

## 1. Source fidelity

- Every major grammar point is supported by the teacher PPT or an explicitly named course source.
- `sourceRefs` point to the correct file and slide(s).
- Teacher terminology is preserved where it matters for class alignment.
- The data pack does not silently add a grammar rule as though it came from the teacher.
- Any assistant-added explanation is clearly a rewrite/enrichment rather than a quotation.

## 2. Vocabulary QA

- Korean spelling matches the teacher material.
- English meaning matches the classroom use.
- Chinese gloss is natural and useful for a Chinese-speaking learner.
- Hanja is included only when confidently supportable.
- Mixed/native/loanword items are not falsely labeled Sino-Korean.
- Homonyms or multiple senses are not collapsed when that would mislead a learner.
- Part of speech and tags are consistent across lessons.
- Hanja, Chinese glosses, and word-origin notes are classified as `teacher-source`, `verified-enrichment`, or `unverified-enrichment`.
- `verified-enrichment` is used only after an explicit dictionary/manual QA pass; otherwise the item remains `unverified-enrichment`.

## 3. Grammar QA

- Pattern and formation are accurate.
- Examples actually demonstrate the stated rule.
- Irregular forms are not over-generalized.
- Speech level, politeness, and honorific marking are kept distinct.
- Tense/aspect/modality labels do not force an English category where the Korean form has broader functions.
- Contrasts such as `에 vs 에서`, `안 vs 못`, `무슨 vs 어느`, and `-고 vs 그리고 vs 하고` are represented explicitly when the teacher emphasizes them.

## 4. Practice QA

- Questions are original transformations, not copied workbook/PPT exercises.
- Each question has at least one accepted answer.
- Typing questions allow harmless punctuation/spacing variants where appropriate.
- Explanation points back to the relevant concept instead of only saying “correct/incorrect.”
- Difficulty roughly matches the lesson level.
- At least one question per major grammar point exists before release.

## 5. Culture / pragmatics QA

- Cultural notes are descriptive, not stereotyped or absolute.
- Address terms, honorifics, and speech levels include relationship/situation context.
- Teacher-presented culture is separated from broader supplemental culture.
- Modern usage changes are flagged when a classroom form may sound old-fashioned or context-specific.

## 6. Copyright / public-site QA

- Do not publish full teacher slides, textbook pages, workbook pages, or long dialogue passages.
- Use short phrases only when needed for teaching the pattern.
- Prefer original explanations, original exercises, and original illustrations.
- Any external image/audio source must have suitable reuse rights or be replaced with original assets.

## 7. Technical QA

- JSON parses successfully.
- IDs are unique.
- Related concept IDs resolve.
- Required fields follow `content/content-schema-v1.json`.
- `content/enrichment-policy-v1.json` exists and defines the three source layers used by the validator.
- `content/enrichment-verification-v1.json` records every item promoted to verified enrichment.
- Lesson packs with `meaningZh`, `hanja`, `originType`, or `originNote` declare those fields in `sourcePolicy.enrichmentQa`.
- No lesson pack is loaded on initial page startup unless it is needed.
- Course and Explore reference shared concept data instead of duplicating competing explanations.

## Current pipeline status

- Lessons 1–9: source-grounded draft packs created.
- Lessons 10–12: next conversion batch.
- Lessons 13–14: after 10–12; existing Lesson 13 live prototype will later be reconciled with the new schema.
- Production wiring: intentionally deferred until the UI/runtime stability cleanup is complete.

## Known QA priority

Hanja/Chinese etymology enrichment should receive a separate verification pass before it is exposed broadly in the public UI. It is useful as a learner aid, but it is not part of the teacher-source fidelity layer. As of the current Lesson 1-14 audit, the first 17 high-frequency vocabulary items have been promoted in `content/enrichment-verification-v1.json`; all other enrichment remains unverified.
