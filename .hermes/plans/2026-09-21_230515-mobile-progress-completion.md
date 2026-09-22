# Mobile Course, Persistent Progress, and Completion Record Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Make the standalone AI 101 course usable on mobile, persist learner progress in browser `localStorage`, and provide a local-only completion experience with a printable personal completion record.

**Architecture:** Keep the course as a static browser artifact with no server, account, API, or new runtime dependency. Extract only storage/state transitions into a small browser-global helper that can be exercised with Node’s built-in test runner; keep the existing `DCLogic` component responsible for rendering and events. On completion, create a UUID locally with `crypto.randomUUID()`, retain it in `localStorage`, render a certificate view, and use the browser print dialog for PDF saving.

**Tech Stack:** Static HTML, existing DC runtime in `support.js`, browser `localStorage`, Web Crypto, CSS media queries, Node built-in `node:test`, Playwright CLI.

---

## Locked Contract

- **Learner outcome:** A learner can complete all 22 lessons on desktop or a 390px-wide mobile screen, close the browser, reopen the same URL, resume at the persisted position, and print a named personal completion record.
- **Storage:** Use `localStorage` under a versioned course-specific key. Persist position, local completion record, and optional display name only. Storage stays on the learner’s browser/device and is not transmitted.
- **Completion record:** A browser-generated UUID and local timestamp are personal-record metadata only. The UI must explicitly state that it is not independently verified or a formal credential.
- **Certificate output:** Open the native browser print dialog; user saves the PDF. No PDF library, download service, external sharing flow, or server verification.
- **Mobile contract:** At a 390px viewport, primary navigation and certificate actions remain reachable, lesson content is readable, and `document.documentElement.scrollWidth === clientWidth`.
- **Non-goals:** User accounts, cross-device sync, public verification, anti-fraud controls, analytics, email, QR validation, or a certificate registry.

## Existing Context

- `ai-101-course.html:929-1445` contains the course content, `DCLogic` state, navigation, and inline layouts.
- `ai-101-course.html:930-940` currently restores `{ d, step }` from `sessionStorage` under `howAIWorks.progress`.
- `ai-101-course.html:1172-1177` currently writes that position to `sessionStorage`.
- `ai-101-course.html:1184-1192` wraps at the final lesson. The new completion behavior must replace this final automatic wrap.
- The repo has no manifest or existing test runner. Do not add a dependency merely to support these features.

---

### Task 1: Add a pure, versioned course-state helper and its RED tests

**Objective:** Define the durable, testable contract for course progression and local-only completion metadata before altering the UI.

**Files:**
- Create: `course-state.js`
- Create: `tests/course-state.test.mjs`
- Modify: `ai-101-course.html:6-7` to load the helper before the course component executes

**Step 1: Write failing tests**

Use Node’s built-in test runner to cover:

```javascript
import test from 'node:test';
import assert from 'node:assert/strict';
import { CourseState } from '../course-state.js';

test('restores a valid persisted position from localStorage-shaped data', () => {
  const result = CourseState.restore('{"version":1,"position":{"lesson":3,"step":2}}', { lessonCount: 22, stepCounts: [5] });
  assert.deepEqual(result.position, { lesson: 3, step: 2 });
});

test('rejects malformed, stale, and out-of-range saved data safely', () => {
  // malformed JSON, unknown version, and invalid positions all return the default state
});

test('creates one stable personal completion record without claiming verification', () => {
  // inject a deterministic UUID factory and clock; repeat completion and assert UUID is unchanged
});

test('reset clears course position, name, and completion record', () => {
  // verify a fresh default record
});
```

**Step 2: Run the test to verify RED**

Run:

```bash
node --test tests/course-state.test.mjs
```

Expected: FAIL because `course-state.js` does not exist.

**Step 3: Implement the smallest helper**

Create a dependency-free module that exports for Node and attaches the same API at `window.HowAiWorksCourseState` for the page. Keep its responsibilities strictly limited to:

- storage key and schema version;
- default state;
- parsing/validation/clamping of persisted data;
- serializing state for `localStorage`;
- one-time local completion creation using injected `uuidFactory` / `clock` dependencies for tests;
- explicit reset.

State shape:

```javascript
{
  version: 1,
  position: { lesson: 0, step: 0 },
  completion: null | { id: 'UUID', completedAt: 'ISO-8601 local timestamp' },
  learnerName: ''
}
```

Do not put course lesson content, DOM logic, certificate markup, or browser storage side effects into this helper.

**Step 4: Run GREEN checks**

Run:

```bash
node --test tests/course-state.test.mjs
node --check course-state.js
```

Expected: all state tests pass and syntax validation exits 0.

**Step 5: Commit**

```bash
git add course-state.js tests/course-state.test.mjs ai-101-course.html
git commit -m "feat(progress): add persistent course-state helper" \
  -m "Co-Authored-By: OpenAI <no-reply@example.com>"
```

---

### Task 2: Migrate progress from session-only state to validated localStorage state

**Objective:** Resume a learner’s position after closing and reopening the browser without breaking existing in-session navigation.

**Files:**
- Modify: `ai-101-course.html:929-940, 1160-1177, 1184-1192, 1194-1240`
- Test: `tests/course-state.test.mjs`

**Step 1: Add failing integration-oriented state tests**

Add cases that prove:

- a valid persisted position restores;
- an existing legacy `sessionStorage` position can be adopted once if no local record exists, then written to `localStorage`;
- all ordinary lesson/step transitions persist the new state;
- a storage exception leaves navigation functional in memory.

**Step 2: Run RED**

```bash
node --test tests/course-state.test.mjs
```

Expected: new migration/persistence tests fail.

**Step 3: Wire the helper into `Component`**

- Replace direct `sessionStorage` reads/writes with the helper and `localStorage`.
- Keep `d`/`step` as renderer-facing state only if that is the least disruptive integration; retain the broader persisted record separately or derive it safely.
- Read old `sessionStorage` only as a one-time migration fallback; remove it after successfully saving the new record.
- Bound restored position against actual `ORDER` and lesson step counts after component mount.
- Preserve the current ArrowLeft/ArrowRight and Back/Next behavior until the terminal-completion task changes only the final transition.

**Step 4: Run GREEN checks**

```bash
node --test tests/course-state.test.mjs
node --check support.js
```

Then manually prove persistence in a fresh browser context:

```bash
python3 -m http.server 8765 --directory .
# In a separate terminal: open the course, advance, close the browser context, reopen the same URL, and assert the same lesson/step.
```

**Step 5: Commit**

```bash
git add ai-101-course.html course-state.js tests/course-state.test.mjs
git commit -m "feat(progress): persist course position locally" \
  -m "Co-Authored-By: OpenAI <no-reply@example.com>"
```

---

### Task 3: Make the final course transition explicit and record completion

**Objective:** Replace the current final modulo wraparound with a terminal completion state that preserves a learner’s completed status.

**Files:**
- Modify: `course-state.js`
- Modify: `tests/course-state.test.mjs`
- Modify: `ai-101-course.html:1184-1192, 1202-1229`

**Step 1: Add failing tests**

Add tests that assert:

- advancing from the final outro creates a completion record exactly once;
- the record receives a UUID and timestamp;
- subsequent visits keep the record unchanged;
- reset is the only behavior that clears it;
- backwards navigation from completion remains defined and does not accidentally clear the record.

**Step 2: Run RED**

```bash
node --test tests/course-state.test.mjs
```

Expected: completion-transition cases fail.

**Step 3: Implement terminal-state behavior**

- Detect the final lesson/outro before applying modulo arithmetic.
- Call the state helper to create the local record on first completion.
- Render a completion state rather than returning to lesson one.
- Add an explicit “Start again” control that uses the helper reset operation and returns to the first lesson.
- Never describe the UUID as verifiable proof or a Liatrio-issued credential.

**Step 4: Run GREEN checks**

```bash
node --test tests/course-state.test.mjs
```

Use Playwright CLI to advance through a controlled end-state fixture or state seed and confirm that completion appears once, refresh retains it, and Start again resets it.

**Step 5: Commit**

```bash
git add ai-101-course.html course-state.js tests/course-state.test.mjs
git commit -m "feat(completion): record local course completion" \
  -m "Co-Authored-By: OpenAI <no-reply@example.com>"
```

---

### Task 4: Add the completion view and printable personal record

**Objective:** Let a completed learner optionally add a display name, review a personal completion record, and save it as PDF through native browser printing.

**Files:**
- Modify: `ai-101-course.html:13-927` (course CSS/template) and `1194-1445` (render values)
- Modify: `course-state.js`
- Modify: `tests/course-state.test.mjs`

**Step 1: Add failing tests**

Cover the non-visual contract:

- a trimmed learner name persists in the existing local record;
- an omitted name renders the neutral fallback `Course learner`;
- certificate values use the stable completion ID and completion timestamp rather than a new value per render;
- reset removes the name and completion record.

**Step 2: Run RED**

```bash
node --test tests/course-state.test.mjs
```

Expected: name and certificate-field tests fail.

**Step 3: Implement the completion and print view**

- Add a celebratory but reduced-motion-safe final screen.
- Add one optional name input with a visible local-only privacy note.
- Show a compact certificate/record containing: course title, learner display name/fallback, completion date, UUID, and a plain-language local-record disclaimer.
- Add “Print / save as PDF” using `window.print()`.
- Add print CSS that shows the certificate cleanly, omits interactive controls, avoids unwanted page splitting, and remains legible if background graphics are disabled.
- Do not add a QR code, social sharing, server call, or a claim of verified certification.

**Step 4: Run GREEN checks**

```bash
node --test tests/course-state.test.mjs
```

Manual browser proof:

1. Seed or complete the terminal state.
2. Enter a name, reload, and confirm it remains.
3. Trigger Print / save as PDF and inspect the print preview: full name/fallback, date, UUID, disclaimer, and no clipped controls.

**Step 5: Commit**

```bash
git add ai-101-course.html course-state.js tests/course-state.test.mjs
git commit -m "feat(completion): add printable personal record" \
  -m "Co-Authored-By: OpenAI <no-reply@example.com>"
```

---

### Task 5: Create a purpose-built mobile reader layout

**Objective:** Make all course controls and lesson content usable at narrow widths without duplicating the course model or desktop content.

**Files:**
- Modify: `ai-101-course.html:13-927`
- Test: browser QA evidence under `/tmp/browser-qa-reports/` only; do not commit browser scratch output

**Step 1: Define failing browser assertions**

Create a bounded Playwright CLI run plan that asserts at a 390×844 viewport:

```javascript
({
  noDocumentOverflow: document.documentElement.scrollWidth === document.documentElement.clientWidth,
  allPrimaryControlsReachable: /* nav, Back/Next, and completion controls have visible client rects */,
  activeLessonVisible: /* title/caption has non-zero bounding box */
})
```

Capture the current failure before CSS changes: document overflow and clipped header/nav.

**Step 2: Implement mobile-specific composition**

At a narrow breakpoint:

- compact the logo/title/progress header into a single readable row;
- replace five desktop-style act buttons with an explicit act selector or an intentionally scrollable control with clear affordance; prefer the selector;
- retain lesson dots/progress in a compact accessible form;
- make the lesson canvas one-column, with scaled typography and spacing;
- reflow wide diagrams into vertical sequences rather than shrinking labels below readability;
- add touch-sized Back/Next controls in a sticky bottom area without obscuring content;
- preserve the current desktop composition at desktop widths;
- provide `prefers-reduced-motion` behavior that disables or shortens nonessential animation.

**Step 3: Run desktop and mobile browser QA**

```bash
python3 -m http.server 8765 --directory .
playwright-cli -s=ai101-mobile open http://127.0.0.1:8765/ai-101-course.html
playwright-cli -s=ai101-mobile resize 390 844
playwright-cli -s=ai101-mobile --raw eval "JSON.stringify({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth})"
playwright-cli -s=ai101-mobile screenshot --filename=/tmp/browser-qa-reports/<run-id>/mobile.png
playwright-cli -s=ai101-mobile resize 1366 900
playwright-cli -s=ai101-mobile screenshot --filename=/tmp/browser-qa-reports/<run-id>/desktop.png
playwright-cli -s=ai101-mobile close
```

Expected: mobile `scrollWidth` equals `clientWidth`; desktop remains visually coherent; no target-origin failed assets or application console errors.

**Step 4: Commit**

```bash
git add ai-101-course.html
git commit -m "feat(mobile): add responsive course reader layout" \
  -m "Co-Authored-By: OpenAI <no-reply@example.com>"
```

---

### Task 6: Run final end-to-end validation and document local behavior

**Objective:** Prove the completed user flow and make the browser-only data semantics clear to future maintainers.

**Files:**
- Create: `README.md`
- Modify: `tests/course-state.test.mjs` only if a discovered state invariant lacks coverage

**Step 1: Add README content**

Document:

- what the course is;
- local preview command (`python3 -m http.server 8765 --directory .`);
- local-only browser persistence behavior and reset behavior;
- local personal-record limitation (not independently verified);
- browser print/save-as-PDF flow;
- source/runtime note for generated `support.js`.

**Step 2: Run all deterministic checks**

```bash
node --test tests/course-state.test.mjs
node --check course-state.js
node --check support.js
git diff --check
```

Expected: all commands exit 0.

**Step 3: Run focused browser acceptance pass**

Verify in a fresh browser storage context:

1. Advance into a non-initial lesson, close browser, reopen the URL, and confirm exact resumption.
2. Reach course completion and confirm a stable UUID is shown.
3. Enter a name, reload, and confirm certificate values persist locally.
4. Print/save the certificate and inspect the preview for clipping, theme/contrast, UUID, disclaimer, and absence of interactive controls.
5. Use Start again and confirm position, name, and completion record reset.
6. Re-run the same smoke path at 390×844 and 1366×900.

Write validated findings under `/tmp/browser-qa-reports/<run-id>/findings.json`; do not commit `.playwright-cli/` or QA scratch output.

**Step 4: Commit**

```bash
git add README.md tests/course-state.test.mjs
git commit -m "docs(course): document local learner experience" \
  -m "Co-Authored-By: OpenAI <no-reply@example.com>"
```

---

## Risks and Guardrails

- **`localStorage` is browser/device-local:** It survives browser restarts but not private browsing cleanup, site-data clearing, or moving to another browser/device. State this plainly in the UI/README; do not imply cross-device continuity.
- **UUID validity:** A UUID identifies a locally generated record. It must never be phrased as an issuer-validated certificate, verification code, or official credential.
- **Print behavior varies by browser:** Validate print preview in the target browser; retain readable borders and text when background graphics are disabled.
- **Static artifact constraints:** Avoid build tools, frameworks, a server, and external storage. Browser-native APIs are sufficient for this slice.
- **Generated runtime:** Do not modify `support.js` unless a verified runtime defect requires it; course behavior belongs in the page and narrow helper.

## Scope-Governor Review

**Verdict:** proceed.

**Keep:** responsive reader layout, `localStorage` state, local UUID/timestamp/name, completion UI, native print-to-PDF, unit tests, focused browser QA, README.

**Delete:** accounts, cloud synchronization, remote UUID lookup, public verification, PDF-generation library, QR codes, email/share integrations, analytics, and a separate mobile application.

**Defer:** Future credentials/verification, cross-device identity, richer share flows, accessibility certification, and any additional learner features the user introduces after this slice.

**Product decisions resolved:** Browser-only personal completion record; persistent `localStorage`; native print-to-PDF.

**Recommended next proof:** Implement through Task 6, then stop at the completed mobile/local-record acceptance pass before admitting further nice-to-haves.
