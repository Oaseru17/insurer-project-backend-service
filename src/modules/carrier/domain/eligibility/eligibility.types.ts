import type { CustomerDocument } from '../../../customer';
import type { Answers, Reason } from '../../../../shared/schemas';

interface EligibilityFacts {
  customer: CustomerDocument;
  answers: Answers;
  asOf: Date;
}

type RuleOutcome =
  { status: 'pass' } | { status: 'fail'; reason: Reason } | { status: 'unknown'; fields: string[] };

type EligibilityRule = (facts: EligibilityFacts) => RuleOutcome;

export type { EligibilityFacts, RuleOutcome, EligibilityRule };
