import type { Router } from 'express';
import { createCarrierController } from './carrier.controller';
import { type CarrierRepository, createInMemoryCarrierRepository } from './carrier.repository';
import { createCarrierRouter } from './carrier.routes';
import { type CarrierService, createCarrierService } from './carrier.service';

interface CarrierModule {
  service: CarrierService;
  router: Router;
}

interface CarrierModuleDeps {
  repository?: CarrierRepository;
}

function createCarrierModule({
  repository = createInMemoryCarrierRepository(),
}: CarrierModuleDeps = {}): CarrierModule {
  const service = createCarrierService(repository);
  return { service, router: createCarrierRouter(createCarrierController(service)) };
}

export { type CarrierModule, type CarrierModuleDeps, createCarrierModule };
