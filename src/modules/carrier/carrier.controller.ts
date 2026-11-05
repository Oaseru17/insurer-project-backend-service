import type { RequestHandler } from 'express';
import { parseIsoDate } from '../../shared/dates';
import type { FormDefinition } from '../../shared/form-schema';
import { ValidationError } from '../../shared/http';
import type { CarrierService } from './carrier.service';
import { toQuoteResponse } from './quote.model';
import type {
  CarrierSummary,
  EligibilityRequest,
  EligibilityResult,
  QuoteCreateRequest,
  QuoteResponse,
} from './schemas';

interface CarrierController {
  listCarriers: RequestHandler;
  getForm: RequestHandler<{ id: string }>;
  checkEligibility: RequestHandler<{ id: string }, unknown, EligibilityRequest>;
  createQuote: RequestHandler<{ id: string }, unknown, QuoteCreateRequest>;
}

function asOfDate(value: string): Date {
  const date = parseIsoDate(value);
  if (!date) throw new ValidationError([{ path: 'asOf', message: 'must be a real calendar date' }]);
  return date;
}

function createCarrierController(service: CarrierService): CarrierController {
  return {
    listCarriers: (_req, res) => {
      res.json(service.listCarriers() satisfies CarrierSummary[]);
    },
    getForm: (req, res) => {
      res.json(service.getForm(req.params.id) satisfies FormDefinition);
    },
    checkEligibility: (req, res) => {
      const { customerId, asOf, answers } = req.body;
      const result = service.checkEligibility(req.params.id, customerId, asOfDate(asOf), answers);
      res.json(result satisfies EligibilityResult);
    },
    createQuote: (req, res) => {
      const { customerId, asOf, answers } = req.body;
      const quote = service.createQuote(req.params.id, customerId, asOfDate(asOf), answers);
      res.status(201).json(toQuoteResponse(quote) satisfies QuoteResponse);
    },
  };
}

export { type CarrierController, createCarrierController };
