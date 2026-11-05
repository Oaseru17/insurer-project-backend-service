import { type EligibilityResult, EligibilityStatus } from '../../schemas';
import { type EligibilityFacts, type EligibilityRule, RuleStatus } from './eligibility.types';

// Every rule runs, so the customer sees all the reasons at once. Any failure wins; otherwise a
// rule that needs an unanswered field makes the result "unknown".
function runRules(rules: readonly EligibilityRule[], facts: EligibilityFacts): EligibilityResult {
  const outcomes = rules.map((rule) => rule(facts));
  const reasons = outcomes.flatMap((outcome) =>
    outcome.status === RuleStatus.Fail ? [outcome.reason] : [],
  );
  if (reasons.length > 0) return { status: EligibilityStatus.Ineligible, reasons };
  const pendingFields = outcomes.flatMap((outcome) =>
    outcome.status === RuleStatus.Unknown ? outcome.fields : [],
  );
  if (pendingFields.length > 0) return { status: EligibilityStatus.Unknown, pendingFields };
  return { status: EligibilityStatus.Eligible };
}

export { runRules };
