import type { Router } from 'express';
import { createCustomerController } from './customer.controller';
import { type CustomerRepository, createInMemoryCustomerRepository } from './customer.repository';
import { createCustomerRouter } from './customer.routes';
import { type CustomerService, createCustomerService } from './customer.service';

interface CustomerModule {
  service: CustomerService;
  router: Router;
}

interface CustomerModuleDeps {
  repository?: CustomerRepository;
}

function createCustomerModule({
  repository = createInMemoryCustomerRepository(),
}: CustomerModuleDeps = {}): CustomerModule {
  const service = createCustomerService(repository);
  return { service, router: createCustomerRouter(createCustomerController(service)) };
}

export { type CustomerModule, type CustomerModuleDeps, createCustomerModule };
