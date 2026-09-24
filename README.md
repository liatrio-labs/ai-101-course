# AI 101: How AI Works

A standalone interactive course for learning how modern AI systems behave. It covers five conceptual areas:

1. **Getting oriented** — the core terms and the course map.
2. **What the model is** — messages, tokens, and the context window.
3. **What it cannot do on its own** — next-token prediction, hallucinations, and the limits of recall.
4. **Reaching the world** — harnesses, tools, documents, skills, and plugins.
5. **Agents at work** — loops, sub-agents, durable artifacts, and the choices people control.

## Referencing slides

Refer to a course slide by its **section.slide** number, such as `01.03`, `07.04`, or `12.02`. This identifier appears at the bottom left of every slide. The first two digits identify the course section, and the final two digits identify the slide within that section.

Use this format when sharing feedback, discussing a lesson, or linking a change to a specific piece of course content.

## Preview locally with hot reload

From this repository, run:

```sh
npx --yes browser-sync start --server --files "**/*" --ignore ".git/**" --startPath /ai-101-course.html --host 127.0.0.1 --port 8090 --no-open
```

Then open [http://127.0.0.1:8090/ai-101-course.html](http://127.0.0.1:8090/ai-101-course.html). BrowserSync watches the project files (excluding `.git/`) and reloads connected browsers whenever a file changes.

## Local learner progress

The course saves progress locally in your browser using `localStorage`. It survives browser restarts in the same browser on the same device. It is cleared by private browsing or clearing site data, and it does not sync across devices or browsers.

At completion, you may optionally add a name to a local personal completion record. The browser generates its UUID and timestamp; use the native **Print / save as PDF** action to keep a copy. This record is not independently verified, Liatrio-issued, or a formal credential.

Choose **Reset Progress & Restart** to clear the local course position, name, and completion record.

## Checks and releases

Install [pre-commit](https://pre-commit.com/) once on your machine (for example, `pipx install pre-commit`), then enable both hook stages in this clone:

```sh
pre-commit install --hook-type pre-commit --hook-type commit-msg
pre-commit run --all-files
```

The hooks check file hygiene, scan for secrets with Betterleaks, format the maintained Markdown files, enforce Conventional Commit messages, and run the course's fast Node checks. Review and restage any Markdown fixes before committing. Pull requests and pushes to `main` also run the same pre-commit checks in GitHub Actions, even when hooks were not installed locally; PR titles are checked as the prospective squash-merge subject. The `Pre-commit checks` status is listed in the branch ruleset. Run the course checks directly with:

```sh
node --test tests/course-state.test.mjs
node --test tests/course-template.test.mjs
node --check course-state.js
node --check support.js
git diff --check
```

After checks pass on `main`, [Python Semantic Release](https://python-semantic-release.readthedocs.io/) reads [Conventional Commits](https://www.conventionalcommits.org/) to create a `v*` tag, `CHANGELOG.md`, and a GitHub Release. Use `feat:` for a minor release and `fix:` for a patch; breaking changes in `0.x` also produce a minor release. A `1.0.0` release requires a deliberate major-version override. Commits that do not warrant a release (for example, `docs:` or `chore:`) do not bump the version. There is no Python package or application version file: Git tags are the source of truth. The release job uses a short-lived Octo STS GitHub App token, scoped to pushes from this repository's `main` branch by `.github/chainguard/main-semantic-release.sts.yaml`.

## Development note

`support.js` is generated runtime source and should not be edited. The page behavior together with `course-state.js` owns learner state.
