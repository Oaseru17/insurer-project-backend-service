import { describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { createApp } from './app';

describe('createApp', () => {
  const app = createApp();

  it('reports health', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('serves the OpenAPI document generated from the schemas', async () => {
    const res = await request(app).get('/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.1.0');
    expect(Object.keys(res.body.components.schemas)).toEqual(
      expect.arrayContaining(['Customer', 'FormDefinition', 'EligibilityResult', 'ErrorResponse']),
    );
  });
});
