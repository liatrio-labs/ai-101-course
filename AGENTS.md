# AGENTS.md

## Project

- This is a standalone static AI-101 course. Keep it dependency-free unless a change explicitly requires otherwise.
- The hosted entry point is `ai-101-course.html`; the container serves it as `/`.
- `support.js` is generated runtime code. Do not edit it directly.
- Keep learner state in `course-state.js` and browser `localStorage`; do not add server-side identity, verification, analytics, or sync without explicit approval.

## Slide references

Refer to course slides by **section.slide** number: `01.03`, `07.04`, or `12.02`.

This identifier is shown at the bottom left of each course slide. The first two digits identify the course section; the final two digits identify the slide within that section. Use this format in issues, reviews, documentation, and code comments when pointing to course content.

## Validation

Run these after behavior changes:

```sh
node --test tests/course-state.test.mjs
node --check course-state.js
node --check support.js
git diff --check
```

For UI changes, also verify desktop and a 390px-wide mobile viewport. Do not commit browser QA scratch output.
