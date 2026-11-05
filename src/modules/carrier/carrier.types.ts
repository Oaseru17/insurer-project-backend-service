import type { CustomerDocument } from '../customer';
import type { FormDefinition } from '../../shared/form-schema';
import type { Answers } from '../../shared/schemas';
import type { FieldResolution } from './schemas';

interface CarrierSection {
  id: string;
  title: string;
  fields: string[];
}

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
}

// A validated carrier the platform can quote with. Eligibility rules join in OLLI-BE-008.
interface CarrierProvider {
  id: string;
  name: string;
  form: FormDefinition;
  adapter: CarrierAdapter;
}

export type { CarrierSection, CarrierAdapter, CarrierDefinition, CarrierProvider };
