import { parseDate } from '../../../../shared/dates';
import type { FormDefinition } from '../../../../shared/form-schema';
import { allowedValue, type EligibilityRule, minAge } from '../../domain/eligibility';
import { stateName } from '../../transforms';

// Only the rules Harbor's form states: a minimum age and the states it lists. Thresholds come
// from the form, so a new form version updates the rules. Coverage options are a choice, not a rule.
function createHarborRules(form: FormDefinition): EligibilityRule[] {
  const rules: EligibilityRule[] = [];

  const dob = form.fields.find((field) => field.key === 'date_of_birth');
  if (dob?.type === 'date' && dob.validation?.minAge !== undefined) {
    rules.push(
      minAge({
        field: dob.key,
        minAge: dob.validation.minAge,
        carrierName: 'Harbor',
        birthDate: ({ answers, customer }) => {
          const answered = answers[dob.key];
          return typeof answered === 'string'
            ? parseDate(answered, dob.format)
            : customer.date_of_birth;
        },
      }),
    );
  }

  const state = form.fields.find((field) => field.key === 'residence_state');
  if (state?.type === 'select') {
    rules.push(
      allowedValue({
        field: state.key,
        code: 'state_not_served',
        allowed: state.options.map(String),
        value: ({ answers, customer }) => {
          const answered = answers[state.key];
          return typeof answered === 'string'
            ? answered
            : (stateName(customer.state) ?? customer.state);
        },
        message: (name) => `Harbor doesn't quote in ${name}.`,
      }),
    );
  }

  return rules;
}

export { createHarborRules };
