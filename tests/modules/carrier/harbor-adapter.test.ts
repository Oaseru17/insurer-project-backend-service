import { describe, expect, it } from '@jest/globals';
import prefill from '../../../golden/maya.prefill.json';
import quoteCases from '../../../golden/maya.quote-requests.json';
import { createCarrierModule } from '../../../src/modules/carrier';
import { createCustomerModule, seedCustomers } from '../../../src/modules/customer';

const customers = createCustomerModule();
seedCustomers(customers.service);
const maya = customers.service.getCustomer('a');
const harbor = createCarrierModule({ customers: customers.service }).service.getCarrier(
  'harbor',
).adapter;

describe('HarborAdapter', () => {
  it("resolves each of Harbor's fields from Maya's profile as the brief expects", () => {
    const resolved = harbor
      .resolve(maya)
      .map(({ key, source, value }) =>
        value === undefined ? { key, source } : { key, source, value },
      );

    expect(resolved).toEqual(prefill.resolutions);
  });

  it("pages Harbor's questions into its sections", () => {
    expect(harbor.sections).toEqual(prefill.sections);
  });

  it.each(quoteCases)(
    "builds Harbor's exact quote request: $name",
    ({ answers, expectedRequest }) => {
      expect(harbor.toQuoteRequest(answers)).toEqual(expectedRequest);
    },
  );
});
