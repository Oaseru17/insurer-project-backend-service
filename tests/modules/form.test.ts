import { describe, expect, it } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import prefill from '../../golden/maya.prefill.json';
import { createCarrierModule } from '../../src/modules/carrier';
import { createCustomerModule, seedCustomers } from '../../src/modules/customer';
import { createFormModule } from '../../src/modules/form';
import { errorHandler } from '../../src/shared/http';
import { createLogger } from '../../src/shared/logger';

function formApp() {
  const customers = createCustomerModule();
  seedCustomers(customers.service);
  const carriers = createCarrierModule({ customers: customers.service });
  const app = express();
  app.use(
    '/api/v1/forms',
    createFormModule({ customers: customers.service, carriers: carriers.service }).router,
  );
  app.use(errorHandler(createLogger(() => undefined)));
  return app;
}

describe('FormModule', () => {
  it("returns Maya's pre-filled and asked Harbor fields, page by page", async () => {
    const res = await request(formApp()).get('/api/v1/forms/harbor/prefill?customerId=a');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ carrierId: 'harbor', customerId: 'a' });
    expect(
      res.body.resolutions.map(({ key, source, value }: Record<string, unknown>) =>
        value === undefined ? { key, source } : { key, source, value },
      ),
    ).toEqual(prefill.resolutions);
    expect(res.body.sections).toEqual(prefill.sections);
  });

  it('returns 404 for an unknown customer', async () => {
    const res = await request(formApp()).get('/api/v1/forms/harbor/prefill?customerId=zz');

    expect(res.status).toBe(404);
  });

  it('requires a customerId', async () => {
    const res = await request(formApp()).get('/api/v1/forms/harbor/prefill');

    expect(res.status).toBe(400);
    expect(res.body.error.issues).toEqual([expect.objectContaining({ path: 'customerId' })]);
  });
});
