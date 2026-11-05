import type { Router } from 'express';
import type { CustomerService } from '../customer';
import { createCarrierController } from './carrier.controller';
import { type CarrierRepository, createInMemoryCarrierRepository } from './carrier.repository';
import { createCarrierRouter } from './carrier.routes';
import { type QuoteRepository, createInMemoryQuoteRepository } from './quote.repository';
import { type CarrierService, createCarrierService } from './carrier.service';

interface CarrierModule {
  service: CarrierService;
  router: Router;
}

interface CarrierModuleDeps {
  customers: CustomerService;
  repository?: CarrierRepository;
  quotes?: QuoteRepository;
}

function createCarrierModule({
  customers,
  repository = createInMemoryCarrierRepository(),
  quotes = createInMemoryQuoteRepository(),
}: CarrierModuleDeps): CarrierModule {
  const service = createCarrierService(repository, quotes, customers);
  return { service, router: createCarrierRouter(createCarrierController(service)) };
}

export { type CarrierModule, type CarrierModuleDeps, createCarrierModule };
