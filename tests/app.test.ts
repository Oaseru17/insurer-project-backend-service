import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import quoteCases from '../golden/maya.quote-requests.json';
import { createApp } from '../src/app';
import { createLogger } from '../src/shared/logger';

const app = createApp({ logger: createLogger(() => undefined) });

describe('createApp', () => {
  it('reports health', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('serves the OpenAPI document generated from the schemas', async () => {
    const res = await request(app).get('/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.1.0');
  });

  it('seeds the sample customers at startup', async () => {
    const res = await request(app).get('/api/v1/customers/a');

    expect(res.status).toBe(200);
    expect(res.body.first_name).toBe('Maya');
  });

  it('wires the modules together end to end', async () => {
    const res = await request(app)
      .post('/api/v1/carriers/harbor/quotes')
      .send({ customerId: 'a', asOf: '2026-11-05', answers: quoteCases[0]?.answers });

    expect(res.status).toBe(201);
    expect(res.body.request).toEqual(quoteCases[0]?.expectedRequest);
  });

  it('serves the API under /api/v1 only', async () => {
    expect((await request(app).get('/api/carriers')).status).toBe(404);
    expect((await request(app).get('/api/v1/carriers')).status).toBe(200);
  });

  it('answers unknown routes with a JSON 404', async () => {
    const res = await request(app).get('/api/v1/nope');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not_found');
  });
});
