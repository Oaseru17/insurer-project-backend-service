import { describe, expect, it } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import cases from '../../../golden/eligibility.json';
import { createCarrierModule } from '../../../src/modules/carrier';
import { createCustomerModule, seedCustomers } from '../../../src/modules/customer';
import { errorHandler } from '../../../src/shared/http';
import { createLogger } from '../../../src/shared/logger';

function eligibilityApp() {
  const customers = createCustomerModule();
  seedCustomers(customers.service);
  const app = express();
  app.use(express.json());
  app.use('/api/carriers', createCarrierModule({ customers: customers.service }).router);
  app.use(errorHandler(createLogger(() => undefined)));
  return app;
}

describe('Harbor eligibility', () => {
  it.each(cases)('$name', async ({ customerId, asOf, expected }) => {
    const res = await request(eligibilityApp())
      .post('/api/carriers/harbor/eligibility')
      .send({ customerId, asOf });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(expected);
  });

  it('re-checks with the answers the customer gave, not only the profile', async () => {
    const res = await request(eligibilityApp())
      .post('/api/carriers/harbor/eligibility')
      .send({ customerId: 'a', asOf: '2026-11-05', answers: { date_of_birth: '01/01/2010' } });

    expect(res.body).toMatchObject({ status: 'ineligible', reasons: [{ code: 'min_age' }] });
  });
});
