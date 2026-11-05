import { type FieldIssue, validateAnswers } from '../../../../shared/form-rules';
import type { Answers, Reason } from '../../../../shared/schemas';
import type { CarrierProvider } from '../../carrier.types';
import { EligibilityStatus } from '../../schemas';
import { type EligibilityFacts, runRules } from '../eligibility';

const QuoteStatus = {
  Ineligible: 'ineligible',
  Invalid: 'invalid',
  Ready: 'ready',
} as const;
type QuoteStatus = (typeof QuoteStatus)[keyof typeof QuoteStatus];

type QuoteOutcome =
  | { status: typeof QuoteStatus.Ineligible; reasons: Reason[] }
  | { status: typeof QuoteStatus.Invalid; issues: FieldIssue[] }
  | { status: typeof QuoteStatus.Ready; request: Answers };

// Eligibility first: an ineligible customer may not even be able to give a valid answer
// (Nevada isn't one of Harbor's states), and the reasons matter more than field errors.
function buildQuote(carrier: CarrierProvider, facts: EligibilityFacts): QuoteOutcome {
  const eligibility = runRules(carrier.rules, facts);
  if (eligibility.status === EligibilityStatus.Ineligible) {
    return { status: QuoteStatus.Ineligible, reasons: eligibility.reasons };
  }
  const issues = validateAnswers(carrier.form, facts.answers);
  if (issues.length > 0) return { status: QuoteStatus.Invalid, issues };
  return { status: QuoteStatus.Ready, request: carrier.adapter.toQuoteRequest(facts.answers) };
}

export { type QuoteOutcome, QuoteStatus, buildQuote };
