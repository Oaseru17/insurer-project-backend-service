import type { CustomerDocument } from '../../../customer';
import type { FieldDef, FormDefinition } from '../../../../shared/form-schema';
import { visibleAnswers } from '../../../../shared/form-rules';
import type { Answers } from '../../../../shared/schemas';
import type { CarrierAdapter } from '../../carrier.types';
import type { FieldResolution } from '../../schemas';
import { concat, matchOption, reformatDate, stateName } from '../../transforms';
import { harborSections } from './harbor.sections';

type Resolution = Omit<FieldResolution, 'key'>;
type Resolver = (customer: CustomerDocument, field: FieldDef) => Resolution;

const ask = (reason: string, hint?: string): Resolution =>
  hint === undefined ? { source: 'ask', reason } : { source: 'ask', reason, hint };

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

function textOptions(field: FieldDef): string[] {
  if (!('options' in field)) return [];
  const options: readonly (string | number)[] = field.options;
  return options.filter((option): option is string => typeof option === 'string');
}

// One entry per Harbor field: how our profile answers it, or why it has to be asked.
const harborMapping: Record<string, Resolver> = {
  applicant_full_name: (customer) => {
    const name = concat([customer.first_name, customer.last_name]);
    return name
      ? {
          source: 'converted',
          value: name,
          reason: 'first_name + last_name; editable, as a legal name may differ',
        }
      : ask('The profile has no full name');
  },
  date_of_birth: (customer, field) =>
    field.type === 'date'
      ? {
          source: 'converted',
          value: reformatDate(customer.date_of_birth, field.format),
          reason: `date_of_birth in Harbor's ${field.format} format`,
        }
      : ask('Unexpected field type'),
  contact_email: (customer) => ({
    source: 'profile',
    value: customer.email,
    reason: 'email, copied',
  }),
  phone: () => ask('The profile has no phone number'),
  residence_state: (customer) => {
    const name = stateName(customer.state);
    return name
      ? { source: 'converted', value: name, reason: `state code ${customer.state} → ${name}` }
      : ask(`Unknown state code ${customer.state}`);
  },
  postal_code: (customer) => ({ source: 'profile', value: customer.zip, reason: 'zip, copied' }),
  contents_coverage: (customer) =>
    ask(
      "Property value isn't coverage: the customer picks one of Harbor's amounts",
      `Your belongings are worth about ${usd.format(customer.personal_property_value)}`,
    ),
  pets: (customer) =>
    customer.has_dog
      ? {
          source: 'suggested',
          value: ['Dog'],
          reason: 'has_dog shows a dog, not that it is the only pet',
        }
      : ask("has_dog: false doesn't rule out other pets"),
  dog_breed: (customer, field) => {
    if (!customer.has_dog || !customer.dog_breed) return ask('The profile has no dog breed');
    const match = matchOption(customer.dog_breed, textOptions(field), 'Other');
    if (!match) return ask(`"${customer.dog_breed}" isn't one of Harbor's breeds`);
    return match.exact && match.option === customer.dog_breed
      ? { source: 'profile', value: match.option, reason: "dog_breed matches Harbor's option" }
      : {
          source: 'converted',
          value: match.option,
          reason: `"${customer.dog_breed}" → ${match.option}`,
        };
  },
  claims_last_5_years: (customer) =>
    ask(
      "A 3-year claim count can't answer a 5-year question",
      `Your profile shows ${customer.claims_last_3_years} claim(s) in the last 3 years`,
    ),
  building_has_sprinklers: () => ask('The profile says nothing about sprinklers'),
};

function createHarborAdapter(form: FormDefinition): CarrierAdapter {
  return {
    sections: harborSections,
    resolve: (customer) =>
      form.fields.map((field) => {
        const resolver = harborMapping[field.key];
        return {
          key: field.key,
          ...(resolver ? resolver(customer, field) : ask('No mapping for this field')),
        };
      }),
    toQuoteRequest: (answers: Answers) => visibleAnswers(form, answers),
  };
}

export { createHarborAdapter, harborMapping };
