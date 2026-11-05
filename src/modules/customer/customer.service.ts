import { NotFoundError, ValidationError } from '../../shared/http';
import { type CustomerDocument, toCustomerDocument } from './customer.model';
import type { CustomerRepository } from './customer.repository';
import { CustomerSchema } from './schemas';

interface CustomerService {
  addCustomer(id: string, input: unknown): CustomerDocument;
  getCustomer(id: string): CustomerDocument;
}

function createCustomerService(repository: CustomerRepository): CustomerService {
  return {
    addCustomer(id, input) {
      const result = CustomerSchema.safeParse(input);
      if (!result.success) {
        const issues = result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        }));
        throw new ValidationError(
          issues,
          `Customer "${id}" is not valid: ${issues.map((issue) => issue.path).join(', ')}`,
        );
      }
      const customer = toCustomerDocument(id, result.data);
      repository.insert(customer);
      return customer;
    },
    getCustomer(id) {
      const customer = repository.findById(id);
      if (!customer) throw new NotFoundError(`Customer "${id}"`);
      return customer;
    },
  };
}

export { type CustomerService, createCustomerService };
