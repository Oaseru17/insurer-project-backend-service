import { Router } from 'express';
import type { CustomerController } from './customer.controller';

function createCustomerRouter(controller: CustomerController): Router {
  const router = Router();
  router.get('/:id', controller.getCustomer);
  return router;
}

export { createCustomerRouter };
