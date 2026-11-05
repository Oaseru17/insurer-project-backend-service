import type { FormDefinition } from '../../shared/form-schema';

// What a carrier supplies before it is validated: its identity and its quote form as raw JSON.
interface CarrierDefinition {
  id: string;
  name: string;
  form: unknown;
}

// A carrier the platform can quote with. The adapter (OLLI-BE-007) and eligibility rules
// (OLLI-BE-008) join this as those tickets land.
interface CarrierProvider {
  id: string;
  name: string;
  form: FormDefinition;
}

export type { CarrierDefinition, CarrierProvider };
