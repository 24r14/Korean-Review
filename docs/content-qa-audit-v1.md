# Content QA Audit v1 — Lessons 1–14

Status: **content architecture QA, not production approval**

This audit reviews the structured lesson packs and cross-lesson architecture against the teacher PPT set currently available. It does **not** treat assistant-added Chinese glosses, Hanja, romanization, or broader linguistic expansion as teacher-source facts.

## 0. Enrichment QA boundary added

The repository now has an explicit enrichment policy at `content/enrichment-policy-v1.json`.

Current source layers:
- `teacher-source`: classroom facts traceable to teacher PPT/course sourceRefs.
- `verified-enrichment`: supplemental learner aids that have an explicit dictionary/manual QA reference.
- `unverified-enrichment`: assistant-added learner aids that have not yet been independently checked.

Current Lesson 1-14 status:
- Hanja, Chinese glosses, `originType`, and `originNote` are classified as enrichment rather than teacher-source facts across the lesson packs.
- `content/enrichment-verification-v1.json` now records two verified batches: 34 high-frequency vocabulary items from Lessons 1, 5, 13, and 14.
- Remaining Hanja/Chinese/word-origin fields stay **unverified enrichment** until they receive item-level evidence; semantic Chinese glosses are kept distinct from Korean Hanja even when both are verified.
- The standalone `content/vocab-enrichment.json` file is also treated as unverified enrichment, even when individual items are plausible.
- One malformed Hanja field was found and removed: `v4-of` had `hanja: "의"`, which was not Hanja.

Validator coverage now checks that lesson packs using enrichment fields declare the teacher/verified/unverified boundary in `sourcePolicy.enrichmentQa`, that verified item IDs point to `content/enrichment-verification-v1.json`, and that Hanja fields contain at least one CJK/Hanja character.

## 1. What is already strong enough to keep

### Source traceability
- Lesson packs use `sourceRefs` so teacher-derived grammar, vocabulary, expressions, and teacher emphasis can be traced back to PPT slides.
- The public site should continue to use transformed explanations and original practice rather than republishing full PPT dialogue, slide images, or textbook pages.

### Cross-lesson progression
The current source set supports a coherent progression rather than 14 isolated lessons:
- numbers → counters → time → dates/age → ordinals → money/large numbers
- present → past → future/probability → progressive/intention/proposal → conjecture → promise/formal intention
- adjective noun modifiers → present verb modifiers → past/completed verb modifiers
- simple negation/inability → quantity with 밖에 → long-form inability → prohibition
- ㄷ → ㅂ → ㄹ → ㅎ → 르 irregular families

### Lesson 10
Keep the distinction between:
- connector `-(으)ㄴ데/-는데`: background, contrast, setup/justification
- sentence-final `-(으)ㄴ데요/-는데요`: indirectness/politeness, including softened disagreement/refusal
- causal `-아/어서`
- present verb modifier `V-는 + N`

The teacher PPT explicitly treats `-는데요` as presenting background and allowing the listener to infer the intended conclusion rather than as a decorative ending.

### Lesson 11
Keep these separate concepts:
- `-고 있다` progressive, including past and honorific variants
- `-(으)ㄹ래요` intention/preference
- `-(으)ㄹ까요?` proposal/opinion/supposition family
- `N(이)나` = unexpectedly large quantity
- `N밖에 + negative` = smaller-than-expected quantity

The expectation/surprise dimension is pedagogically important and should not be reduced to only English translations like “as many as” and “only.”

### Lesson 12
Keep two distinct canonical concepts for the same surface form:
- causal `-아/어서`
- sequential `-아/어서`

The teacher PPT explicitly contrasts tightly connected sequential events with `-고`, and also contrasts sequential vs causal interpretation. Also keep:
- conjectural `-겠-`, including past conjecture
- spontaneous-reaction `-네요`
- `-겠네요`
- ㅎ irregular color/demonstrative adjectives
- past/completed verb noun modifier `V-(으)ㄴ + N`

### Lesson 13
Keep five separate core grammar concepts:
1. `-아/어 주다` benefactive
2. `-아/어야 되다/하다` obligation/necessity
3. `-(으)ㄹ게요` willingness/assurance/promise
4. `N 때문에` noun-based reason
5. intentional/formal `-겠-`

The teacher PPT directly compares `-(으)ㄹ래요` with `-(으)ㄹ게요`, and later contrasts conjectural `-겠-` with intentional `-겠-`. These should be linked, not merged.

### Lesson 14
Keep the teacher's three-way reason contrast as one Explore cluster:
- `A/V-아/어서` = because predicate
- `N(이)라서` = because it is N
- `N 때문에` = because of N

Also keep separate:
- `못 + V` vs `V-지 못하다`
- inability `-지 못하다` vs prohibition `-지 마세요`
- `X-지 말고 Y-(으)세요`
- `A-게` adverbial formation
- 르 irregular
- taxi/airport service pragmatics such as `수고하세요` / `수고하셨어요`

## 2. Canonicalization decisions

A new `content/concept-registry-v1.json` now provides stable system-level IDs. Existing lesson-local IDs should **not** be deleted yet.

Migration rule:

```text
lesson-local item
    ↓
add canonicalConceptId
    ↓
Course / Explore / Practice / Mistakes / Media Lab
all point to the same canonical concept
```

This avoids breaking the existing lesson packs while preventing future explanation duplication.

## 3. QA items that are still pending

### P0 — before wiring Lessons 1–14 into the public UI
- Validate every JSON file parses correctly.
- Check duplicate item IDs.
- Check every indexed lesson file exists.
- Check required lesson fields and practice answer fields.
- Check practice `conceptIds` resolve to a known local or canonical concept.
- Resolve current front-end stability issues before bulk-loading the packs.

### P1 — linguistic/content QA
- Continue verifying assistant-added Hanja independently before public display; keep unverified items hidden or visibly labeled.
- Continue verifying Chinese glosses for semantic fit, especially where Korean and modern Mandarin usage differ.
- Record the reference used in `content/enrichment-verification-v1.json` before promoting any Hanja, Chinese gloss, or word-origin note to `verified-enrichment`.
- Add RR only as a learner cue; do not present romanization as exact Korean phonology.
- Review examples generated by the assistant for naturalness and register.
- Standardize grammar naming across lessons (`future`, `probability`, `intention`, `conjecture`, `promise`) so one English label is not reused for distinct functions.

### P1 — source/source-boundary QA
- Keep a visible distinction between `teacher-core` and `enrichment`.
- Do not present a full Korean passive or causative system as if it were taught in the current Lesson 1–14 PPT set. The PPTs contain isolated related material, but not a complete passive/causative unit.
- A future passive/causative Explore page can be added as outside-course enrichment and should say so.

### P2 — data normalization
- Standardize `sourceRefs` so tooling accepts both `slide` and `slides`, but new content should prefer one canonical form.
- Standardize `connections` to canonical system IDs such as `system-speech-honorifics`, not free-text variants such as `speech-honorifics`.
- Add `lessonId` consistently to vocabulary/grammar/expression/practice items if the renderer needs direct reverse lookup.
- Add `canonicalConceptId` gradually instead of renaming all existing IDs at once.

## 4. Content that should be shared rather than duplicated

These explanations should live once at system level and be referenced from lessons:

| Canonical cluster | Lesson appearances |
|---|---|
| Two Korean number systems | 1, 4, 5, 9, 12, 14 |
| Speech levels + honorifics | 1, 3, 4, 8, 9, 10, 11, 13, 14 |
| `-겠-` function map | 12, 13 |
| `-(으)ㄹ 거예요 / -(으)ㄹ래요 / -(으)ㄹ까요 / -(으)ㄹ게요` | 7, 11, 13 |
| Cause/reason chooser | 10, 12, 13, 14 |
| Noun modifiers | 9, 10, 12 |
| Negation/inability/prohibition | 6, 7, 11, 14 |
| Irregular conjugations | 5, 6, 7, 8, 9, 10, 11, 12, 14 |

A lesson page should show the **lesson-sized explanation** and link to “Explore the full system,” rather than copying the full system page into every lesson.

## 5. Recommended production sequence

```text
1. Automated JSON/content validation
2. Fix any hard validation errors
3. Hanja + Chinese gloss verification pass
4. Add canonicalConceptId cross-links
5. Refactor front-end data loader
6. Load lesson packs lazily
7. Rebuild Explore from canonical concept registry
8. Usability test with teacher + 3–5 students
9. Iterate before adding more large features
```

## 6. Release gate

A lesson pack can move from `draft` to `production-ready` only when:
- source traceability passes
- JSON validation passes
- required fields pass
- generated examples are reviewed
- Hanja/Chinese enrichment is verified or hidden
- no copyrighted slide/page reproduction is included
- the live renderer can load the lesson lazily without blocking the whole site

This keeps the project usable as an HCI prototype while also making the content architecture credible enough to scale to Lessons 15–16, Media Lab, Picture Dictionary-derived visual vocabulary, and user-created study packs.
