import { ageOn } from '../../../../shared/dates';
import type { EligibilityFacts, EligibilityRule } from './eligibility.types';

interface MinAgeRule {
  field: string;
  minAge: number;
  carrierName: string;
  birthDate: (facts: EligibilityFacts) => Date | null;
}

interface AllowedValueRule {
  field: string;
  code: string;
  allowed: readonly string[];
  value: (facts: EligibilityFacts) => string | null;
  message: (value: string) => string;
}

function minAge({ field, minAge: min, carrierName, birthDate }: MinAgeRule): EligibilityRule {
  return (facts) => {
    const birth = birthDate(facts);
    if (!birth) return { status: 'unknown', fields: [field] };
    const age = ageOn(birth, facts.asOf);
    return age >= min
      ? { status: 'pass' }
      : {
          status: 'fail',
          reason: {
            code: 'min_age',
            field,
            message: `${carrierName} requires applicants to be ${min} or older; you are ${age}.`,
          },
        };
  };
}

function allowedValue({ field, code, allowed, value, message }: AllowedValueRule): EligibilityRule {
  return (facts) => {
    const actual = value(facts);
    if (!actual) return { status: 'unknown', fields: [field] };
    return allowed.includes(actual)
      ? { status: 'pass' }
      : { status: 'fail', reason: { code, field, message: message(actual) } };
  };
}

export { type MinAgeRule, type AllowedValueRule, minAge, allowedValue };
