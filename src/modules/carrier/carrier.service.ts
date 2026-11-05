import type { FormDefinition } from '../../shared/form-schema';
import { NotFoundError } from '../../shared/http';
import type { CarrierRepository } from './carrier.repository';
import type { CarrierProvider } from './carrier.types';
import type { CarrierSummary } from './schemas';

interface CarrierService {
  listCarriers(): CarrierSummary[];
  getCarrier(id: string): CarrierProvider;
  getForm(id: string): FormDefinition;
}

function createCarrierService(repository: CarrierRepository): CarrierService {
  const getCarrier = (id: string): CarrierProvider => {
    const carrier = repository.findById(id);
    if (!carrier) throw new NotFoundError(`Carrier "${id}"`);
    return carrier;
  };
  return {
    listCarriers: () =>
      repository.list().map(({ id, name, form }) => ({ id, name, product: form.product })),
    getCarrier,
    getForm: (id) => getCarrier(id).form,
  };
}

export { type CarrierService, createCarrierService };
