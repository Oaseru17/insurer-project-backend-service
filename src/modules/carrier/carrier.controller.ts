import type { RequestHandler } from 'express';
import { parseIsoDate } from '../../shared/dates';
import type { FormDefinition } from '../../shared/form-schema';
import { ValidationError } from '../../shared/http';
import type { CarrierService } from './carrier.service';
import type { CarrierSummary, EligibilityRequest, EligibilityResult } from './schemas';

interface CarrierController {
  listCarriers: RequestHandler;
  getForm: RequestHandler<{ id: string }>;
  checkEligibility: RequestHandler<{ id: string }, unknown, EligibilityRequest>;
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
  };
}

export { type CarrierController, createCarrierController };
