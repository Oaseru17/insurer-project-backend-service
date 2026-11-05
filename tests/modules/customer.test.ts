import { describe, expect, it } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import profiles from '../../golden/profiles.json';
import { createCustomerModule, seedCustomers } from '../../src/modules/customer';
import { errorHandler } from '../../src/shared/http';
import { createLogger } from '../../src/shared/logger';

function seededApp() {
  const module = createCustomerModule();
  seedCustomers(module.service);
  const app = express();
  app.use('/api/customers', module.router);
  app.use(errorHandler(createLogger(() => undefined)));
  return app;
}

describe('CustomerModule', () => {
  it('returns Maya exactly as the brief gives her', async () => {
    const res = await request(seededApp()).get('/api/customers/a');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 'a',
      ...profiles.a,
      date_of_birth: '1994-03-12T00:00:00.000Z',
    });
  });

  it('returns 404 for an unknown customer', async () => {
    const res = await request(seededApp()).get('/api/customers/zz');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not_found');
  });

  it('rejects a seed record with a malformed birth date', () => {
    const { service } = createCustomerModule();
    const records = [{ _id: 'broken', ...profiles.a, date_of_birth: '12/03/1994' }];

    expect(() => seedCustomers(service, records)).toThrow('date_of_birth');
  });
});
