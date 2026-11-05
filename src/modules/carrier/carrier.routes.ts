import { Router } from 'express';
import { validateBody } from '../../shared/http';
import type { CarrierController } from './carrier.controller';
import { EligibilityRequestSchema, QuoteCreateRequestSchema } from './schemas';

function createCarrierRouter(controller: CarrierController): Router {
  const router = Router();
  router.get('/', controller.listCarriers);
  router.get('/:id/form', controller.getForm);
  router.post(
    '/:id/eligibility',
    validateBody(EligibilityRequestSchema),
    controller.checkEligibility,
  );
  router.post('/:id/quotes', validateBody(QuoteCreateRequestSchema), controller.createQuote);
  return router;
}

export { createCarrierRouter };
