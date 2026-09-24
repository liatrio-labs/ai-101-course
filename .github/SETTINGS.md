# GitHub repository settings

These files describe desired settings for `liatrio-labs/ai-101-course`; they do not change GitHub by themselves. The read-only **Detect Ruleset Drift** job compares the fields it can see on pull requests and pushes to `main`. The live branch ruleset is in `evaluate` mode, so a failing job does not yet block merges.

| File or setting | Apply with an authorized `gh api` identity | Checked by the read-only CI job? |
| --- | --- | --- |
| `.github/ruleset-config.json`: branch target, enforcement, rules, review policy, and required checks | POST a new ruleset or PUT the existing one | Yes; GitHub-added response metadata is ignored, but missing or extra rules/checks fail. |
| `.github/ruleset-config.json`: `bypass_actors` | Same ruleset POST/PUT, after reviewing the entire payload | **No.** The PR token does not reliably reveal these actors. Inspect the live ruleset with an admin identity. RepositoryRole IDs `2` and `5` are `maintain` and `admin` in GitHub's GraphQL API. |
| `.github/repository-settings.json`: `rest` fields and GraphQL merge fields | PATCH the repository using the translated REST payload below | Yes. CI reads basic fields via REST and merge policy via GraphQL because its REST token omits those fields. |
| `.github/repository-settings.json`: issue/PR creation policies and Sponsorships | GraphQL `updateRepository` mutation below | Yes, via GraphQL. |
| Release immutability | `GET`, `PUT`, or `DELETE /repos/{owner}/{repo}/immutable-releases` with appropriate admin access | **No.** The read-only Actions token received HTTP 403, so this setting is intentionally absent from the comparison JSON. |
| Visibility | REST PATCH can change it, but publication is a separate decision, not part of these JSON files | **No.** Never change it as part of a settings sync. |
| Commit comments, LFS archives, push limits, linked-issue auto-close | No verified API mapping in this guide | **No.** Do not infer that the JSON files cover the entire GitHub General page. |

## Apply the branch ruleset

Use an authorized identity, review the JSON and the live policy first, and retain `"enforcement": "evaluate"` unless a separate decision authorizes activation. PUT replaces the selected ruleset configuration, including its bypass actors. The CI job cannot validate bypass changes or guarantee that its own status remains required.

```bash
repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
gh api "repos/$repo/rulesets" --jq '[.[] | {id, name, target, enforcement}]'
# For an existing ruleset, replace RULESET_ID with the ID from the list above:
gh api -X PUT "repos/$repo/rulesets/RULESET_ID" --input .github/ruleset-config.json
gh api "repos/$repo/rulesets/RULESET_ID" --jq '{name, enforcement, rules, bypass_actors}'
```

For a repository with **no matching ruleset**, use `gh api -X POST "repos/$repo/rulesets" --input .github/ruleset-config.json` instead of PUT, then read back the returned ID. Do not create a duplicate by name. An agent should show the proposed difference and obtain human approval before either write.

Release immutability is an example of an API-managed setting that this CI identity cannot check. An admin can inspect it with `gh api "repos/$repo/immutable-releases"`; after a separate decision, `gh api -X PUT "repos/$repo/immutable-releases"` enables it and `gh api -X DELETE "repos/$repo/immutable-releases"` disables it. Neither operation is part of applying these JSON files.

## Apply tracked General settings

This JSON is a **comparison schema, not a GitHub API request body**. Its `rest` and `graphql` sections must be translated into two operations; do not pass the file directly to `gh api --input`. Check the target repository and inspect both generated payloads before running the write commands. `jq` is used here only to translate the checked-in values; it is not a project dependency.

The REST operation applies basic repository settings and the GraphQL merge fields under their REST parameter names:

```bash
repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
payload=$(jq '. as $s | $s.rest + {
  allow_merge_commit: $s.graphql.mergeCommitAllowed,
  allow_squash_merge: $s.graphql.squashMergeAllowed,
  squash_merge_commit_title: $s.graphql.squashMergeCommitTitle,
  squash_merge_commit_message: $s.graphql.squashMergeCommitMessage,
  allow_rebase_merge: $s.graphql.rebaseMergeAllowed,
  allow_auto_merge: $s.graphql.autoMergeAllowed,
  allow_update_branch: $s.graphql.allowUpdateBranch,
  delete_branch_on_merge: $s.graphql.deleteBranchOnMerge
}' .github/repository-settings.json)
printf '%s\n' "$payload" | jq .
# Only after approval: printf '%s\n' "$payload" | gh api -X PATCH "repos/$repo" --input -
```

GraphQL's `updateRepository` mutation applies the issue/PR creation policies and Sponsorships. Preview the generated JSON before piping it to `gh api graphql --input -`:

```bash
repo_id=$(gh api graphql \
  -f query='query($owner:String!,$name:String!){repository(owner:$owner,name:$name){id}}' \
  -f owner="${repo%/*}" -f name="${repo#*/}" --jq '.data.repository.id')
payload=$(jq --arg id "$repo_id" '. as $s | {
  query: "mutation($input:UpdateRepositoryInput!){updateRepository(input:$input){repository{id}}}",
  variables: {input: {
    repositoryId: $id,
    issueCreationPolicy: $s.graphql.issueCreationPolicy,
    pullRequestCreationPolicy: $s.graphql.pullRequestCreationPolicy,
    hasSponsorshipsEnabled: $s.graphql.hasSponsorshipsEnabled
  }}
}' .github/repository-settings.json)
printf '%s\n' "$payload" | jq .
# Only after approval: printf '%s\n' "$payload" | gh api graphql --input -
```

Read back `gh api "repos/$repo"` and the relevant GraphQL repository fields, then rerun CI. A successful API write alone is not verification. These commands do not manage visibility, release immutability, or the UI controls excluded above; review those separately. An agent must explain the intended changes and permission scope, ask before applying them, and never activate the ruleset or make the repository public as a side effect of a settings sync.
