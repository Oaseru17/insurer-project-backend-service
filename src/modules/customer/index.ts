export * from './schemas';
export {
  type CustomerModule,
  type CustomerModuleDeps,
  createCustomerModule,
} from './customer.module';
export { type CustomerDocument } from './customer.model';
export { type CustomerRepository, createInMemoryCustomerRepository } from './customer.repository';
export { type CustomerService } from './customer.service';
export { seedCustomers } from './seed';
