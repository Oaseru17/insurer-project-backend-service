import type { RequestHandler } from 'express';
import type { FormDefinition } from '../../shared/form-schema';
import type { CarrierService } from './carrier.service';
import type { CarrierSummary } from './schemas';

interface CarrierController {
  listCarriers: RequestHandler;
  getForm: RequestHandler<{ id: string }>;
}

function createCarrierController(service: CarrierService): CarrierController {
  return {
    listCarriers: (_req, res) => {
      res.json(service.listCarriers() satisfies CarrierSummary[]);
    },
    getForm: (req, res) => {
      res.json(service.getForm(req.params.id) satisfies FormDefinition);
    },
  };
}

export { type CarrierController, createCarrierController };
