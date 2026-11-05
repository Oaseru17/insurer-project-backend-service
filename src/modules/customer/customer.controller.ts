import type { RequestHandler } from 'express';
import { toCustomerResponse } from './customer.model';
import type { CustomerService } from './customer.service';
import type { CustomerResponse } from './schemas';

interface CustomerController {
  getCustomer: RequestHandler<{ id: string }>;
}

function createCustomerController(service: CustomerService): CustomerController {
  return {
    getCustomer: (req, res) => {
      res.json(toCustomerResponse(service.getCustomer(req.params.id)) satisfies CustomerResponse);
    },
  };
}

export { type CustomerController, createCustomerController };
