import type { EligibilityResult } from '../../schemas';
import type { EligibilityFacts, EligibilityRule } from './eligibility.types';

// Every rule runs, so the customer sees all the reasons at once. Any failure wins; otherwise a
// rule that needs an unanswered field makes the result "unknown".
function runRules(rules: readonly EligibilityRule[], facts: EligibilityFacts): EligibilityResult {
  const outcomes = rules.map((rule) => rule(facts));
  const reasons = outcomes.flatMap((outcome) =>
    outcome.status === 'fail' ? [outcome.reason] : [],
  );
  if (reasons.length > 0) return { status: 'ineligible', reasons };
  const pendingFields = outcomes.flatMap((outcome) =>
    outcome.status === 'unknown' ? outcome.fields : [],
  );
  if (pendingFields.length > 0) return { status: 'unknown', pendingFields };
  return { status: 'eligible' };
}

export { runRules };
