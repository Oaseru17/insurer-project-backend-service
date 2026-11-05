import { Router } from 'express';
import type { CarrierController } from './carrier.controller';

function createCarrierRouter(controller: CarrierController): Router {
  const router = Router();
  router.get('/', controller.listCarriers);
  router.get('/:id/form', controller.getForm);
  return router;
}

export { createCarrierRouter };
