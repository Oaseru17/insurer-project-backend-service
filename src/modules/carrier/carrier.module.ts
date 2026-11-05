import type { Router } from 'express';
import type { CustomerService } from '../customer';
import { createCarrierController } from './carrier.controller';
import { type CarrierRepository, createInMemoryCarrierRepository } from './carrier.repository';
import { createCarrierRouter } from './carrier.routes';
import { type CarrierService, createCarrierService } from './carrier.service';

interface CarrierModule {
  service: CarrierService;
  router: Router;
}

interface CarrierModuleDeps {
  customers: CustomerService;
  repository?: CarrierRepository;
}

function createCarrierModule({
  customers,
  repository = createInMemoryCarrierRepository(),
}: CarrierModuleDeps): CarrierModule {
  const service = createCarrierService(repository, customers);
  return { service, router: createCarrierRouter(createCarrierController(service)) };
}

export { type CarrierModule, type CarrierModuleDeps, createCarrierModule };
