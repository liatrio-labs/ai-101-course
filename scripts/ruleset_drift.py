"""Compare committed branch rules with GitHub's read-only ruleset response."""

import difflib
import json
import os
import re
import sys
from pathlib import Path
from urllib.request import Request, urlopen


CONFIG = Path(__file__).resolve().parents[1] / ".github" / "ruleset-config.json"


def ruleset_id(desired, listing):
    matches = [item["id"] for item in listing
               if item["name"] == desired["name"] and item["target"] == desired["target"]]
    if len(matches) != 1:
        raise ValueError(f"Expected one matching live ruleset, found {len(matches)}")
    return matches[0]


def project(value, expected):
    """Keep desired keys, but retain every live array item to detect additions."""
    if isinstance(expected, dict):
        if not isinstance(value, dict):
            return value
        return {key: project(value.get(key), item) for key, item in expected.items()}
    if isinstance(expected, list):
        if not isinstance(value, list):
            return value
        if expected and all(isinstance(item, dict) and "type" in item for item in expected):
            specs = {item["type"]: item for item in expected}
            values = [project(item, specs.get(item.get("type"), {"type": None}))
                      if isinstance(item, dict) else item for item in value]
        elif expected and isinstance(expected[0], dict):
            values = [project(item, expected[0]) for item in value]
        else:
            values = value
        return sorted(values, key=lambda item: json.dumps(item, sort_keys=True))
    return value


def normalized(value, desired):
    # GitHub redacts bypass_actors from read-only PR tokens; audit those separately.
    schema = {key: item for key, item in desired.items() if key != "bypass_actors"}
    return project(value, schema)


def equivalent_rulesets(desired, live):
    return normalized(desired, desired) == normalized(live, desired)


def github_json(url, token):
    request = Request(url, headers={
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "X-GitHub-Api-Version": "2022-11-28",
    })
    with urlopen(request, timeout=15) as response:
        return json.load(response)


def main():
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    token = os.environ.get("GH_TOKEN", "")
    if not re.fullmatch(r"[\w.-]+/[\w.-]+", repo) or not token:
        print("GITHUB_REPOSITORY and GH_TOKEN are required", file=sys.stderr)
        return 1
    try:
        desired = json.loads(CONFIG.read_text())
        endpoint = f"https://api.github.com/repos/{repo}/rulesets"
        identity = ruleset_id(desired, github_json(endpoint, token))
        live = github_json(f"{endpoint}/{identity}", token)
        wanted = normalized(desired, desired)
        actual = normalized(live, desired)
    except (OSError, ValueError, KeyError) as exc:
        print(f"Ruleset comparison failed: {exc}", file=sys.stderr)
        return 1
    if wanted != actual:
        print("Ruleset drift detected (excluding bypass actors):", file=sys.stderr)
        print("\n".join(difflib.unified_diff(
            json.dumps(wanted, indent=2, sort_keys=True).splitlines(),
            json.dumps(actual, indent=2, sort_keys=True).splitlines(),
            fromfile="committed", tofile="GitHub", lineterm="",
        )), file=sys.stderr)
        return 1
    print("Ruleset matches committed config (excluding bypass actors).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
