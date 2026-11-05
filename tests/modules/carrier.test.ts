import { describe, expect, it } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import harborForm from '../../golden/harbor-form.json';
import { createCarrierModule, createInMemoryCarrierRepository } from '../../src/modules/carrier';
import { createCustomerModule } from '../../src/modules/customer';
import { FormDefinitionError } from '../../src/shared/form-schema';
import { errorHandler } from '../../src/shared/http';
import { createLogger } from '../../src/shared/logger';

const customers = createCustomerModule();

function carrierApp() {
  const app = express();
  app.use('/api/v1/carriers', createCarrierModule({ customers: customers.service }).router);
  app.use(errorHandler(createLogger(() => undefined)));
  return app;
}

describe('CarrierModule', () => {
  it('lists Harbor and the product it quotes', async () => {
    const res = await request(carrierApp()).get('/api/v1/carriers');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 'harbor', name: 'Harbor Assurance', product: 'renters' }]);
  });

  it("serves Harbor's form definition as Harbor supplied it", async () => {
    const res = await request(carrierApp()).get('/api/v1/carriers/harbor/form');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(harborForm);
  });

  it('returns 404 for an unknown carrier', async () => {
    const res = await request(carrierApp()).get('/api/v1/carriers/zz/form');

    expect(res.status).toBe(404);
  });

  it('refuses to start with a form it cannot understand', () => {
    const broken = {
      ...harborForm,
      fields: [{ key: 'phone', label: 'Phone', type: 'phone', required: true }],
    };

    expect(() =>
      createInMemoryCarrierRepository([
        {
          id: 'broken',
          name: 'Broken',
          form: broken,
          createAdapter: () => {
            throw new Error('not reached: the form is rejected first');
          },
          createRules: () => [],
        },
      ]),
    ).toThrow(FormDefinitionError);
  });
});
