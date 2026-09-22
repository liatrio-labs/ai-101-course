# Course Audit Remediation Plan (Content, UX, and State Machine)

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Remediate all critical and high-priority findings from the "How AI Works" course audit across input capture (1.1), content discrepancies (2.1), pedagogical framing (2.2), desktop/styling polish (3.2), and state machine lifecycle (4.1, 4.2, 4.3, 4.4).

**Architecture:** Maintain the zero-external-dependency static architecture. Preserve pure state logic in `course-state.js` and presentation/event orchestration in `Component` (`ai-101-course.html`). Validate all behavioral invariants with automated tests in `tests/course-state.test.mjs` and `tests/course-template.test.mjs`.

**Tech Stack:** Static HTML, Vanilla JavaScript, CSS3, `support.js` runtime, `localStorage`, Web Crypto API with fallback, Node.js built-in `node:test`.

---

## Locked Contract

1. **Input Isolation (1.1):** When a learner is typing inside any form input (such as `#completion-name`), Left and Right arrow key presses must be ignored by course navigation and preserved for text editing.
2. **Content Accuracy (2.1 & 2.2):**
   - Lesson 13 captions (`13.02`, `13.03`) must describe requesting `get_current_time()` and asking for today's date, matching the visual diagram and recap.
   - Reactive variables `resendC` (Messages, `04.05`), `flow1` (The round trip, `09.02`), and `loopArrow`/`loopJustify` (The loop, `20.06`) must check the current lesson positions in `ORDER` (`d === 3`, `d === 8`, and `st === 5` forward direction).
   - The phantom 5th message bar in Lesson 04 must be removed so context sent matches the 4 chat cards.
   - Deduplicate items in `RECAP[11]` (Math).
   - Brand references ("Claude" -> "Claude.ai") and informal headers ("the point:" -> "Document retrieval:") must be standardized.
   - Act 1 (Sections 02 & 03) must frame early terminology as a glossary preview/orientation, and Slide `06.04` must clarify context dropping as a host harness behavior.
3. **Design System & Visual Polish (3.2):**
   - Invalid 9-digit hex `#F2F5F6fff` must be corrected to `#F2F5F6`.
   - Completion canvas height must accommodate the 625px certificate card without an internal 5px desktop scrollbar (increase to 640px).
   - Desktop zoom must not cause unnecessary vertical overflow on sub-900px viewport heights.
4. **State Machine & Lifecycle (4.1 – 4.4):**
   - `this.persistProgress()` must only run when slide/lesson changes (`key !== this._key`) or when name/completion changes—never on every 34ms typing animation frame.
   - Autoplay interval must be calculated dynamically based on caption length and must be cleared when reaching completion (`finished === true`).
   - Post-completion navigation must allow viewing Lesson 22's outro recap slide without locking out the learner.
   - `defaultUuidFactory()` in `course-state.js` must safely fall back to a random UUID generator if `root.crypto?.randomUUID` is unavailable.

---

### Task 1: Fix Input Event Capture (1.1) and Web Crypto Fallback (4.4)

**Objective:** Prevent arrow keys from hijacking course navigation while typing in form inputs, and provide a secure fallback UUID generator when `crypto.randomUUID()` is missing.

**Files:**
- Modify: `ai-101-course.html:1311-1315`
- Modify: `course-state.js:88-90`
- Test: `tests/course-state.test.mjs`
- Test: `tests/course-template.test.mjs`

**Step 1: Write failing tests**
- In `tests/course-state.test.mjs`, test `CourseState.complete()` in an environment without `root.crypto.randomUUID` to assert it generates a valid UUID v4 format string.
- In `tests/course-template.test.mjs`, test that `this.onKey` in `ai-101-course.html` contains an editable element guard (`e.target.matches("input, textarea, [contenteditable]")` or tag check).

**Step 2: Run test to verify failure**
Run: `node --test tests/course-state.test.mjs tests/course-template.test.mjs`
Expected: FAIL

**Step 3: Implement minimal code**
- In `ai-101-course.html`, update `this.onKey`:
  ```javascript
  this.onKey = (e) => {
    if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable)) return;
    if (e.key === "ArrowRight") this.go(1);
    if (e.key === "ArrowLeft") this.go(-1);
  };
  ```
- In `course-state.js`, implement fallback in `defaultUuidFactory`:
  ```javascript
  function defaultUuidFactory() {
    if (root.crypto && typeof root.crypto.randomUUID === 'function') {
      return root.crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  ```

**Step 4: Run tests to verify pass**
Run: `node --test tests/course-state.test.mjs tests/course-template.test.mjs`
Expected: PASS

**Step 5: Commit**
```bash
git add ai-101-course.html course-state.js tests/course-state.test.mjs tests/course-template.test.mjs
git commit -m "fix(course): guard arrow keys in input and add crypto fallback

Co-Authored-By: OpenAI <no-reply@example.com>"
```

---

### Task 2: Remediate Content Discrepancies (2.1) and Pedagogical Framing (2.2)

**Objective:** Synchronize captions, diagrams, recaps, and reactive visual states across all affected slides.

**Files:**
- Modify: `ai-101-course.html` (lines 420-950 for HTML copy, lines 1025-1230 for `D` and `RECAP`, lines 1450-1560 for reactive variables)
- Test: `tests/course-template.test.mjs`

**Step 1: Write failing tests**
- In `tests/course-template.test.mjs`, add assertions verifying:
  - Lesson 13 caption references `today's date` and `get_current_time()` rather than `today's weather`.
  - `resendC` checks `d === 3`.
  - `flow1` checks `d === 8`.
  - Turn 2 loop wire on step 5 sets `this example sends context →` and `flex-end`.
  - 4 context bars in Turn 2 Messages (`04.05`) instead of 5.
  - `RECAP[11]` deduplicated.
  - "Claude.ai" used in harness description.
  - Slide `17.01` header uses clean title casing without "the point:".
  - Slide `21.05` footer mentions non-text runtime levers accurately.
  - Slide `06.04` and Act 1 glossary framing updates are present.

**Step 2: Run test to verify failure**
Run: `node --test tests/course-template.test.mjs`
Expected: FAIL

**Step 3: Implement minimal code**
- Update captions in `D[4]` (Tool calls) to:
  `"You ask something the model can't possibly know, like today's date."`
  `"Rather than guess, the model sends back a request: 'run get_current_time() for me'."`
- In `renderVals()`:
  - Fix `resendC`: `v.resendC = (d === 3 && st >= 4) ? acc : "transparent";`
  - Fix `flow1`: `v.flow1 = d === 8 && st === 1;`
  - Fix Turn 2 wire on step 5: ensure `v.loopArrow` and `v.loopJustify` point forward (`→`) on `st === 5`.
  - Adjust `sentMsgs` and `sentBars` in Lesson 04 (`d === 3`) so step 4 sends only the 4 messages present in the conversation box.
- In `RECAP[11]`, update point 4 to contrast pattern matching with exact calculation tools.
- In Slide `12.03`, change "Claude" to "Claude.ai".
- In Slide `17.01` (`d8`), update heading to `DOCUMENT RETRIEVAL: SEARCHING LARGE FILES INSTEAD OF SENDING EVERYTHING`.
- In Slide `21.05` (`d14`), update footer text.
- In Act 1 (`d16` & `d17`), frame early terms as a quick glossary preview.
- In Slide `06.04` (`d3`), clarify that oldest messages falling out is a harness context-management rule.

**Step 4: Run tests to verify pass**
Run: `node --test tests/course-template.test.mjs`
Expected: PASS

**Step 5: Commit**
```bash
git add ai-101-course.html tests/course-template.test.mjs
git commit -m "fix(course): align lesson content, reactive bindings, and pedagogical framing

Co-Authored-By: OpenAI <no-reply@example.com>"
```

---

### Task 3: Fix Desktop & Design System Styling Polish (3.2)

**Objective:** Correct invalid hex syntax, prevent completion canvas scrollbars, and optimize desktop zoom responsiveness.

**Files:**
- Modify: `ai-101-course.html:17, 35, 109, 114`
- Test: `tests/course-template.test.mjs`

**Step 1: Write failing tests**
- In `tests/course-template.test.mjs`, verify:
  - Source has no `#F2F5F6fff`.
  - Completion canvas height is set to `640px!important`.
  - Responsive desktop zoom rule or adjusted desktop scaling.

**Step 2: Run test to verify failure**
Run: `node --test tests/course-template.test.mjs`
Expected: FAIL

**Step 3: Implement minimal code**
- Replace `#F2F5F6fff` with `#F2F5F6` at lines 17 and 114.
- Update line 35 to set completion canvas height to `640px!important` (accommodating the 625px card with breathing room).
- In desktop styles, adjust zoom so viewports with height < 900px scale gracefully without clipping or excessive scrolling.

**Step 4: Run tests to verify pass**
Run: `node --test tests/course-template.test.mjs`
Expected: PASS

**Step 5: Commit**
```bash
git add ai-101-course.html tests/course-template.test.mjs
git commit -m "fix(course): polish design system tokens, canvas height, and desktop scaling

Co-Authored-By: OpenAI <no-reply@example.com>"
```

---

### Task 4: Fix State Management, Persistence Throttling, and Lifecycle (4.1 – 4.3)

**Objective:** Throttle `localStorage` writes away from the 34ms typing loop, synchronize autoplay pacing and timer cleanup, and preserve Lesson 22 outro visibility after completion.

**Files:**
- Modify: `ai-101-course.html:1325-1365`
- Test: `tests/course-template.test.mjs`

**Step 1: Write failing tests**
- In `tests/course-template.test.mjs`, add tests verifying:
  - `persistProgress` is only called when position or completion/name changes, not on typing ticks.
  - Autoplay duration is calculated dynamically based on caption length and clears when `finished === true`.
  - Navigating back from completion does not permanently suppress Lesson 22 outro recap.

**Step 2: Run test to verify failure**
Run: `node --test tests/course-template.test.mjs`
Expected: FAIL

**Step 3: Implement minimal code**
- In `componentDidUpdate()`, gate `this.persistProgress()`:
  ```javascript
  componentDidUpdate() {
    const key = this.state.d + ":" + this.state.step;
    if (key !== this._key) {
      this._key = key;
      this.startType();
      this.persistProgress();
    }
    this.setAuto();
  }
  ```
  And call `this.persistProgress()` explicitly in `setLearnerName()` and `complete()`.
- In `setAuto()`:
  - If `this.state.finished`, clear `this.timer` immediately and return.
  - Dynamically compute duration from current caption length.
- In `renderVals()` & `go(dir)`:
  - Do not automatically collapse `finished` to true when `step === steps.length` if user explicitly navigated back into lesson 22.

**Step 4: Run tests to verify pass**
Run: `node --test tests/course-template.test.mjs tests/course-state.test.mjs`
Expected: PASS

**Step 5: Commit**
```bash
git add ai-101-course.html tests/course-template.test.mjs
git commit -m "fix(course): throttle storage writes, optimize autoplay, and fix completion navigation

Co-Authored-By: OpenAI <no-reply@example.com>"
```

---

## Acceptance Verification

Run the full project test suite after all tasks complete:

```sh
node --test tests/course-state.test.mjs
node --test tests/course-template.test.mjs
node --check course-state.js
node --check support.js
git diff --check
```
All tests must pass with zero syntax or whitespace errors.
