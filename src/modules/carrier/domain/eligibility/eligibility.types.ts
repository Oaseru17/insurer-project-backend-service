import type { CustomerDocument } from '../../../customer';
import type { Answers, Reason } from '../../../../shared/schemas';

const RuleStatus = {
  Pass: 'pass',
  Fail: 'fail',
  Unknown: 'unknown',
} as const;
type RuleStatus = (typeof RuleStatus)[keyof typeof RuleStatus];

interface EligibilityFacts {
  customer: CustomerDocument;
  answers: Answers;
  asOf: Date;
}

type RuleOutcome =
  | { status: typeof RuleStatus.Pass }
  | { status: typeof RuleStatus.Fail; reason: Reason }
  | { status: typeof RuleStatus.Unknown; fields: string[] };

type EligibilityRule = (facts: EligibilityFacts) => RuleOutcome;

export { type EligibilityFacts, type RuleOutcome, type EligibilityRule, RuleStatus };
