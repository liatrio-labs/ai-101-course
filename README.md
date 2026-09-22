# AI-101: How AI works

A standalone interactive course for learning how modern AI systems behave. It covers five conceptual areas:

1. **Getting oriented** — the core terms and the course map.
2. **What the model is** — messages, tokens, and the context window.
3. **What it cannot do on its own** — next-token prediction, hallucinations, and the limits of recall.
4. **Reaching the world** — harnesses, tools, documents, skills, and plugins.
5. **Agents at work** — loops, sub-agents, durable artifacts, and the choices people control.

## Referencing slides

Refer to a course slide by its **section.slide** number, such as `01.03`, `07.04`, or `12.02`. This identifier appears at the bottom left of every slide. The first two digits identify the course section, and the final two digits identify the slide within that section.

Use this format when sharing feedback, discussing a lesson, or linking a change to a specific piece of course content.

## Preview locally

From this repository, run:

```sh
python3 -m http.server 8765 --directory .
```

Then open [http://127.0.0.1:8765/ai-101-course.html](http://127.0.0.1:8765/ai-101-course.html).

## Local learner progress

The course saves progress locally in your browser using `localStorage`. It survives browser restarts in the same browser on the same device. It is cleared by private browsing or clearing site data, and it does not sync across devices or browsers.

At completion, you may optionally add a name to a local personal completion record. The browser generates its UUID and timestamp; use the native **Print / save as PDF** action to keep a copy. This record is not independently verified, Liatrio-issued, or a formal credential.

Choose **Start again** to clear the local course position, name, and completion record.

## Development note

`support.js` is generated runtime source and should not be edited. The page behavior together with `course-state.js` owns learner state.
