import type { CustomerDocument } from './customer.model';

interface CustomerRepository {
  insert(customer: CustomerDocument): void;
  findById(id: string): CustomerDocument | undefined;
}

function createInMemoryCustomerRepository(): CustomerRepository {
  const collection = new Map<string, CustomerDocument>();
  return {
    insert: (customer) => {
      collection.set(customer._id, customer);
    },
    findById: (id) => collection.get(id),
  };
}

export { type CustomerRepository, createInMemoryCustomerRepository };
