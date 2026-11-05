import type { CustomerService } from '../customer.service';
import customers from './customers.json';

// Inserts through the service, so seed records get the same validation as new data.
function seedCustomers(service: CustomerService, records: readonly unknown[] = customers): number {
  for (const record of records) {
    const { _id, ...customer } = record as { _id?: unknown };
    if (typeof _id !== 'string') throw new Error('Every seed customer needs a string _id');
    service.addCustomer(_id, customer);
  }
  return records.length;
}

export { seedCustomers };
