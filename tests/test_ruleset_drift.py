import copy
import importlib.util
import unittest
from pathlib import Path


DESIRED = {
    "name": "main branch protection",
    "target": "branch",
    "enforcement": "evaluate",
    "conditions": {"ref_name": {"include": ["~DEFAULT_BRANCH"], "exclude": []}},
    "rules": [
        {"type": "pull_request", "parameters": {"dismiss_stale_reviews_on_push": True}},
        {"type": "required_status_checks", "parameters": {"required_status_checks": [
            {"context": "Course checks"}, {"context": "Detect Ruleset Drift"}
        ]}},
    ],
    "bypass_actors": [],
}


class RulesetDriftTests(unittest.TestCase):
    def checker(self):
        path = Path(__file__).resolve().parents[1] / "scripts" / "ruleset_drift.py"
        self.assertTrue(path.is_file(), "ruleset checker missing")
        spec = importlib.util.spec_from_file_location("ruleset_drift", path)
        assert spec is not None and spec.loader is not None
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        return module

    def test_ignores_api_metadata_order_and_redacted_bypass_actors(self):
        checker = self.checker()
        live = copy.deepcopy(DESIRED)
        live["id"] = 42
        live["bypass_actors"] = [{"actor_type": "Integration", "actor_id": 123}]
        live["rules"].reverse()
        live["rules"][0]["parameters"]["required_status_checks"].reverse()
        live["rules"][0]["parameters"]["required_status_checks"][0]["integration_id"] = None
        live["rules"][1]["parameters"]["new_api_default"] = False
        self.assertTrue(checker.equivalent_rulesets(DESIRED, live))

    def test_detects_changed_review_policy_and_missing_status(self):
        checker = self.checker()
        live = copy.deepcopy(DESIRED)
        live["rules"][0]["parameters"]["dismiss_stale_reviews_on_push"] = False
        self.assertFalse(checker.equivalent_rulesets(DESIRED, live))
        live = copy.deepcopy(DESIRED)
        live["rules"][1]["parameters"]["required_status_checks"].pop()
        self.assertFalse(checker.equivalent_rulesets(DESIRED, live))

    def test_detects_extra_live_rule_and_enforcement_change(self):
        checker = self.checker()
        live = copy.deepcopy(DESIRED)
        live["rules"].append({"type": "creation"})
        self.assertFalse(checker.equivalent_rulesets(DESIRED, live))
        live = copy.deepcopy(DESIRED)
        live["enforcement"] = "active"
        self.assertFalse(checker.equivalent_rulesets(DESIRED, live))

    def test_missing_or_ambiguous_named_ruleset_fails_closed(self):
        checker = self.checker()
        listing = [{"name": "other", "target": "branch", "id": 1}]
        with self.assertRaises(ValueError):
            checker.ruleset_id(DESIRED, listing)
        listing = [{"name": DESIRED["name"], "target": "branch", "id": 1},
                   {"name": DESIRED["name"], "target": "branch", "id": 2}]
        with self.assertRaises(ValueError):
            checker.ruleset_id(DESIRED, listing)


if __name__ == "__main__":
    unittest.main()
