import { describe, expect, it } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import { z } from 'zod';
import { errorHandler, IneligibleError, validateBody } from '../../src/shared/http';
import { createLogger } from '../../src/shared/logger';

const PII = { email: 'maya@example.com', first_name: 'Maya', date_of_birth: '1994-03-12' };

function harness() {
  const lines: string[] = [];
  const logger = createLogger((line) => lines.push(line));
  const app = express();
  app.use(express.json());

  app.post(
    '/validated',
    validateBody(z.object({ customerId: z.string(), asOf: z.string() })),
    (_req, res) => {
      res.json({ ok: true });
    },
  );
  app.post('/ineligible', () => {
    throw new IneligibleError([{ code: 'min_age', field: 'date_of_birth', message: 'Too young' }]);
  });
  app.post('/boom', () => {
    throw new Error('database exploded');
  });

  app.use(errorHandler(logger));
  return { app, lines };
}

describe('shared HTTP kernel', () => {
  it('rejects an invalid body with 400 and the fields at fault', async () => {
    const { app } = harness();
    const res = await request(app).post('/validated').send({ customerId: 42 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('invalid_request');
    expect(res.body.error.issues.map((issue: { path: string }) => issue.path)).toEqual([
      'customerId',
      'asOf',
    ]);
  });

  it('returns 422 with the reasons when the carrier cannot quote', async () => {
    const { app } = harness();
    const res = await request(app).post('/ineligible').send({});

    expect(res.status).toBe(422);
    expect(res.body.error).toMatchObject({ code: 'ineligible', reasons: [{ code: 'min_age' }] });
  });

  it('hides unexpected errors behind a generic 500 and keeps PII out of the logs', async () => {
    const { app, lines } = harness();
    const res = await request(app).post('/boom').send(PII);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: { code: 'internal_error', message: 'Something went wrong' },
    });
    expect(lines.length).toBeGreaterThan(0);
    for (const value of Object.values(PII)) {
      expect(lines.join('\n')).not.toContain(value);
    }
  });

  it('redacts customer fields from logged context', () => {
    const lines: string[] = [];
    createLogger((line) => lines.push(line)).info('prefill', {
      customer: PII,
      carrierId: 'harbor',
    });

    expect(JSON.parse(lines[0] ?? '{}')).toMatchObject({
      msg: 'prefill',
      carrierId: 'harbor',
      customer: { email: '[redacted]', first_name: '[redacted]', date_of_birth: '[redacted]' },
    });
  });
});
