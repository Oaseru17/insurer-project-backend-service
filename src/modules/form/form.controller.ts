import type { RequestHandler } from 'express';
import type { FormService } from './form.service';
import type { PrefillQuery, PrefillResponse } from './schemas';

interface FormController {
  prefill: RequestHandler<
    { carrierId: string },
    unknown,
    unknown,
    unknown,
    { query: PrefillQuery }
  >;
}

function createFormController(service: FormService): FormController {
  return {
    prefill: (req, res) => {
      const { customerId } = res.locals.query;
      res.json(service.prefill(req.params.carrierId, customerId) satisfies PrefillResponse);
    },
  };
}

export { type FormController, createFormController };
