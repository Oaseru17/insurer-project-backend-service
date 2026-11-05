import type { CustomerService } from '../customer';
import type { FormDefinition } from '../../shared/form-schema';
import { NotFoundError } from '../../shared/http';
import type { Answers } from '../../shared/schemas';
import type { CarrierRepository } from './carrier.repository';
import type { CarrierProvider } from './carrier.types';
import { runRules } from './domain/eligibility';
import type { CarrierSummary, EligibilityResult } from './schemas';

interface CarrierService {
  listCarriers(): CarrierSummary[];
  getCarrier(id: string): CarrierProvider;
  getForm(id: string): FormDefinition;
  checkEligibility(
    carrierId: string,
    customerId: string,
    asOf: Date,
    answers?: Answers,
  ): EligibilityResult;
}

function createCarrierService(
  repository: CarrierRepository,
  customers: CustomerService,
): CarrierService {
  const getCarrier = (id: string): CarrierProvider => {
    const carrier = repository.findById(id);
    if (!carrier) throw new NotFoundError(`Carrier "${id}"`);
    return carrier;
  };
  return {
    listCarriers: () =>
      repository.list().map(({ id, name, form }) => ({ id, name, product: form.product })),
    getCarrier,
    getForm: (id) => getCarrier(id).form,
    checkEligibility: (carrierId, customerId, asOf, answers = {}) =>
      runRules(getCarrier(carrierId).rules, {
        customer: customers.getCustomer(customerId),
        answers,
        asOf,
      }),
  };
}

export { type CarrierService, createCarrierService };
