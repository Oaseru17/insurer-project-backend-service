import type { CustomerDocument } from '../customer';
import type { FormDefinition } from '../../shared/form-schema';
import type { Answers } from '../../shared/schemas';
import type { EligibilityRule } from './domain/eligibility';
import type { CarrierSection, FieldResolution } from './schemas';

// The brief's "adapter": turns our customer into the carrier's fields and request format.
interface CarrierAdapter {
  readonly sections: readonly CarrierSection[];
  resolve(customer: CustomerDocument): FieldResolution[];
  toQuoteRequest(answers: Answers): Answers;
}

// What a carrier supplies before validation: identity, raw form JSON and how to build its adapter.
interface CarrierDefinition {
  id: string;
  name: string;
  form: unknown;
  createAdapter: (form: FormDefinition) => CarrierAdapter;
  createRules: (form: FormDefinition) => EligibilityRule[];
}

// A validated carrier the platform can quote with.
interface CarrierProvider {
  id: string;
  name: string;
  form: FormDefinition;
  adapter: CarrierAdapter;
  rules: EligibilityRule[];
}

export type { CarrierSection, CarrierAdapter, CarrierDefinition, CarrierProvider };
