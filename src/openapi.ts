import { z } from 'zod';
// Importing each schema file registers its schemas (via `.meta({ id })`) in zod's global registry.
import './shared/form-schema';
import './shared/schemas';
import './modules/customer';
import './modules/carrier';
import './modules/form';

// Component schemas come straight from the zod schemas,
// so the contract olli-web generates its types from is the one requests are validated with.

const API_V1 = '/api/v1';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

interface Operation {
  method: Method;
  path: string;
  summary: string;
  tag: string;
  body?: string;
  query?: string[];
  ok: { status: number; schema: string; array?: boolean };
  errors: number[];
}

const ERROR_DESCRIPTIONS: Record<number, string> = {
  400: 'Invalid request',
  404: 'Customer or carrier not found',
  422: 'Carrier cannot quote this customer',
  500: 'Unexpected error',
};

const OPERATIONS: Operation[] = [
  {
    method: 'get',
    path: `${API_V1}/customers/{id}`,
    summary: 'Get a customer profile',
    tag: 'Customers',
    ok: { status: 200, schema: 'CustomerResponse' },
    errors: [404, 500],
  },
  {
    method: 'get',
    path: `${API_V1}/carriers`,
    summary: 'List carriers and the product each quotes',
    tag: 'Carriers',
    ok: { status: 200, schema: 'CarrierSummary', array: true },
    errors: [500],
  },
  {
    method: 'get',
    path: `${API_V1}/carriers/{id}/form`,
    summary: "Get a carrier's quote form definition",
    tag: 'Carriers',
    ok: { status: 200, schema: 'FormDefinition' },
    errors: [404, 500],
  },
  {
    method: 'post',
    path: `${API_V1}/carriers/{id}/eligibility`,
    summary: 'Check whether the carrier can quote this customer',
    tag: 'Carriers',
    body: 'EligibilityRequest',
    ok: { status: 200, schema: 'EligibilityResult' },
    errors: [400, 404, 500],
  },
  {
    method: 'post',
    path: `${API_V1}/carriers/{id}/quotes`,
    summary: "Validate answers, re-check eligibility and build the carrier's quote request",
    tag: 'Carriers',
    body: 'QuoteCreateRequest',
    ok: { status: 201, schema: 'QuoteResponse' },
    errors: [400, 404, 422, 500],
  },
  {
    method: 'get',
    path: `${API_V1}/forms/{carrierId}/prefill`,
    summary:
      "Each of the carrier's fields resolved from the profile — pre-filled or asked — plus its pages",
    tag: 'Forms',
    query: ['customerId'],
    ok: { status: 200, schema: 'PrefillResponse' },
    errors: [400, 404, 500],
  },
];

const ref = (id: string) => ({ $ref: `#/components/schemas/${id}` });

function parameters(path: string, query: string[] = []) {
  const inPath = [...path.matchAll(/\{(\w+)\}/g)].map(([, name]) => ({
    name,
    in: 'path',
    required: true,
    schema: { type: 'string' },
  }));
  const inQuery = query.map((name) => ({
    name,
    in: 'query',
    required: true,
    schema: { type: 'string' },
  }));
  return [...inPath, ...inQuery];
}

function toOperation(op: Operation) {
  const okSchema = op.ok.array ? { type: 'array', items: ref(op.ok.schema) } : ref(op.ok.schema);
  return {
    summary: op.summary,
    tags: [op.tag],
    operationId: `${op.method}${op.path.replace(/[{}]/g, '').replace(/\/(\w)/g, (_, c: string) => c.toUpperCase())}`,
    parameters: parameters(op.path, op.query),
    ...(op.body && {
      requestBody: { required: true, content: { 'application/json': { schema: ref(op.body) } } },
    }),
    responses: {
      [op.ok.status]: { description: 'OK', content: { 'application/json': { schema: okSchema } } },
      ...Object.fromEntries(
        op.errors.map((status) => [
          status,
          {
            description: ERROR_DESCRIPTIONS[status],
            content: { 'application/json': { schema: ref('ErrorResponse') } },
          },
        ]),
      ),
    },
  };
}

function buildOpenApiDocument() {
  const { schemas } = z.toJSONSchema(z.globalRegistry, {
    uri: (id) => `#/components/schemas/${id}`,
    unrepresentable: 'any',
    // A Date leaves the API through res.json() as an ISO timestamp string.
    override: ({ zodSchema, jsonSchema }) => {
      if (zodSchema._zod.def.type === 'date') {
        jsonSchema.type = 'string';
        jsonSchema.format = 'date-time';
      }
    },
  });
  const componentSchemas = Object.fromEntries(
    Object.entries(schemas).map(([id, schema]) => {
      const component: Record<string, unknown> = { ...schema };
      delete component.$schema;
      return [id, component];
    }),
  );

  const paths: Record<string, Record<string, unknown>> = {};
  for (const op of OPERATIONS) {
    paths[op.path] = { ...paths[op.path], [op.method]: toOperation(op) };
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'Olli backend service',
      version: '0.1.0',
      license: { name: 'MIT', identifier: 'MIT' },
      description:
        "Maps a standard customer profile to a carrier's quote form: pre-fill, eligibility and quote requests.",
    },
    servers: [{ url: 'http://localhost:4000' }],
    // No authentication: out of scope for the exercise (see README improvements).
    security: [],
    paths,
    components: { schemas: componentSchemas },
  };
}

export { API_V1, buildOpenApiDocument };
