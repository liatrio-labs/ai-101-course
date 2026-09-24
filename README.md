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

Pull requests and pushes to `main` run the course's Node tests and syntax checks in GitHub Actions. Run the same checks locally with:

```sh
node --test tests/course-state.test.mjs
node --test tests/course-template.test.mjs
node --check course-state.js
node --check support.js
git diff --check
```

After checks pass on `main`, [Python Semantic Release](https://python-semantic-release.readthedocs.io/) reads [Conventional Commits](https://www.conventionalcommits.org/) to create a `v*` tag, `CHANGELOG.md`, and a GitHub Release. Use `feat:` for a minor release and `fix:` for a patch; breaking changes in `0.x` also produce a minor release. A `1.0.0` release requires a deliberate major-version override. Commits that do not warrant a release (for example, `docs:` or `chore:`) do not bump the version. There is no Python package or application version file: Git tags are the source of truth. The release job uses a short-lived Octo STS GitHub App token, scoped to pushes from this repository's `main` branch by `.github/chainguard/main-semantic-release.sts.yaml`.

### Branch protection rollout

`.github/ruleset-config.json` describes the **non-enforcing** (`evaluate`) ruleset now present in GitHub. It proposes squash-only merges, fresh approval after changes, code-owner review, and only the Octo STS GitHub App as a bypass actor—not maintainers or owners. The `Detect Ruleset Drift` PR job compares it with GitHub's API and fails if the ruleset is missing or differs. It ignores API-added defaults and field order; GitHub redacts bypass actors from a read-only PR token, so **this job cannot audit bypass permissions**. The drift job only blocks merges once an active ruleset requires its status. The repository remains internal. The `liatrio-labs-maintainers` team has explicit write access, but CODEOWNERS does not take effect until this file lands on the default branch. Before enforcing the ruleset:

1. The Octo STS GitHub App is installed for all `liatrio-labs` repositories with `contents: write` available. Its `main-semantic-release` identity cannot be exercised until this trust policy is on the default branch. Merging this workflow to `main` may produce the first `v0.1.0` release; approve that separately before merging.
2. Verify a real release run. Audit the live Octo STS bypass with an appropriately authorized identity. Coordinate the committed config and live ruleset when switching from `evaluate` to `active`, then verify both checks are required. The JSON file does not synchronize GitHub settings by itself, and CI cannot force GitHub to require a check if someone removes that requirement.
3. Public visibility requires a separate review of license, assets, and repository history.

## Development note

`support.js` is generated runtime source and should not be edited. The page behavior together with `course-state.js` owns learner state.
