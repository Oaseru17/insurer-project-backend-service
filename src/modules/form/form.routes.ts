import { Router } from 'express';
import { validateQuery } from '../../shared/http';
import type { FormController } from './form.controller';
import { PrefillQuerySchema } from './schemas';

function createFormRouter(controller: FormController): Router {
  const router = Router();
  router.get('/:carrierId/prefill', validateQuery(PrefillQuerySchema), controller.prefill);
  return router;
}

export { createFormRouter };
