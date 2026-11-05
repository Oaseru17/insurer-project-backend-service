import type { CustomerDocument, CustomerService } from '../customer';
import type { FormDefinition } from '../../shared/form-schema';
import { randomUUID } from 'node:crypto';
import { IneligibleError, NotFoundError, ValidationError } from '../../shared/http';
import type { Answers } from '../../shared/schemas';
import type { CarrierRepository } from './carrier.repository';
import type { CarrierProvider } from './carrier.types';
import { runRules } from './domain/eligibility';
import { buildQuote, QuoteStatus } from './domain/quote';
import type { QuoteDocument } from './quote.model';
import type { QuoteRepository } from './quote.repository';
import type { CarrierSection, CarrierSummary, EligibilityResult, FieldResolution } from './schemas';

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
  createQuote(carrierId: string, customerId: string, asOf: Date, answers: Answers): QuoteDocument;
  resolveFields(
    carrierId: string,
    customer: CustomerDocument,
  ): { resolutions: FieldResolution[]; sections: readonly CarrierSection[] };
}

function createCarrierService(
  repository: CarrierRepository,
  quotes: QuoteRepository,
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
    resolveFields: (carrierId, customer) => {
      const { adapter } = getCarrier(carrierId);
      return { resolutions: adapter.resolve(customer), sections: adapter.sections };
    },
    checkEligibility: (carrierId, customerId, asOf, answers = {}) =>
      runRules(getCarrier(carrierId).rules, {
        customer: customers.getCustomer(customerId),
        answers,
        asOf,
      }),
    createQuote: (carrierId, customerId, asOf, answers) => {
      const carrier = getCarrier(carrierId);
      const outcome = buildQuote(carrier, {
        customer: customers.getCustomer(customerId),
        answers,
        asOf,
      });
      if (outcome.status === QuoteStatus.Ineligible) throw new IneligibleError(outcome.reasons);
      if (outcome.status === QuoteStatus.Invalid) {
        throw new ValidationError(
          outcome.issues.map(({ field, code, message }) => ({ path: field, code, message })),
          'Some answers need attention',
        );
      }
      const quote: QuoteDocument = {
        _id: randomUUID(),
        carrierId: carrier.id,
        customerId,
        request: outcome.request,
        createdAt: new Date(),
      };
      quotes.insert(quote);
      return quote;
    },
  };
}

export { type CarrierService, createCarrierService };
