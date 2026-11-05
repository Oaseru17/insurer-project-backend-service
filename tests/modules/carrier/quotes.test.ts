import { describe, expect, it } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import quoteCases from '../../../golden/maya.quote-requests.json';
import { createCarrierModule } from '../../../src/modules/carrier';
import { createCustomerModule, seedCustomers } from '../../../src/modules/customer';
import { errorHandler } from '../../../src/shared/http';
import { createLogger } from '../../../src/shared/logger';

const AS_OF = '2026-11-05';
const mayaAnswers = quoteCases[0]?.answers ?? {};

function quoteApp() {
  const customers = createCustomerModule();
  seedCustomers(customers.service);
  const app = express();
  app.use(express.json());
  app.use('/api/carriers', createCarrierModule({ customers: customers.service }).router);
  app.use(errorHandler(createLogger(() => undefined)));
  return app;
}

const createQuote = (body: object) =>
  request(quoteApp()).post('/api/carriers/harbor/quotes').send(body);

describe('Harbor quotes', () => {
  it.each(quoteCases)(
    "returns Harbor's exact request: $name",
    async ({ answers, expectedRequest }) => {
      const res = await createQuote({ customerId: 'a', asOf: AS_OF, answers });

      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        carrierId: 'harbor',
        request: expectedRequest,
        sent: false,
      });
    },
  );

  it('refuses with the reasons when Harbor cannot quote the customer', async () => {
    const res = await createQuote({ customerId: 'b', asOf: AS_OF, answers: {} });

    expect(res.status).toBe(422);
    expect(res.body.error.reasons.map((reason: { code: string }) => reason.code)).toEqual([
      'min_age',
      'state_not_served',
    ]);
  });

  it('names the missing field when an answer is required', async () => {
    const withoutPhone = Object.fromEntries(
      Object.entries(mayaAnswers).filter(([key]) => key !== 'phone'),
    );
    const res = await createQuote({ customerId: 'a', asOf: AS_OF, answers: withoutPhone });

    expect(res.status).toBe(400);
    expect(res.body.error.issues).toEqual([
      expect.objectContaining({ path: 'phone', code: 'required' }),
    ]);
  });
});
