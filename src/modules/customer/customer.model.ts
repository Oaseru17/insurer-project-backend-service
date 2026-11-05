import { parseIsoDate } from '../../shared/dates';
import type { Customer, CustomerResponse } from './schemas';

// Stored shape, as a MongoDB document would hold it: typed values (a real Date), not API strings.
interface CustomerDocument {
  _id: string;
  first_name: string;
  last_name: string;
  date_of_birth: Date;
  email: string;
  state: string;
  zip: string;
  personal_property_value: number;
  has_dog: boolean;
  dog_breed: string | null;
  claims_last_3_years: number;
}

function toCustomerDocument(id: string, customer: Customer): CustomerDocument {
  const dateOfBirth = parseIsoDate(customer.date_of_birth);
  if (!dateOfBirth)
    throw new Error(`Customer "${id}": date_of_birth passed validation but did not parse`);
  return { _id: id, ...customer, date_of_birth: dateOfBirth };
}

function toCustomerResponse({ _id, ...rest }: CustomerDocument): CustomerResponse {
  return { id: _id, ...rest };
}

export { type CustomerDocument, toCustomerDocument, toCustomerResponse };
