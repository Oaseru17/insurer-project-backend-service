import type { CarrierService } from '../carrier';
import type { CustomerService } from '../customer';
import type { PrefillResponse } from './schemas';

// One carrier today. With many carriers this is where questions are merged across carriers
// and asked once (the Questionnaire Service).
interface FormService {
  prefill(carrierId: string, customerId: string): PrefillResponse;
}

interface FormServiceDeps {
  customers: CustomerService;
  carriers: CarrierService;
}

function createFormService({ customers, carriers }: FormServiceDeps): FormService {
  return {
    prefill: (carrierId, customerId) => {
      const customer = customers.getCustomer(customerId);
      const { resolutions, sections } = carriers.resolveFields(carrierId, customer);
      return { carrierId, customerId, resolutions, sections: [...sections] };
    },
  };
}

export { type FormService, type FormServiceDeps, createFormService };
