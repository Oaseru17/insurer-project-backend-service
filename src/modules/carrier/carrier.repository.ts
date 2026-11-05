import { parseForm } from '../../shared/form-schema';
import type { CarrierDefinition, CarrierProvider } from './carrier.types';
import { carrierDefinitions } from './providers';

interface CarrierRepository {
  list(): CarrierProvider[];
  findById(id: string): CarrierProvider | undefined;
}

// Forms are validated once when the repository is built, so an unsupported form stops startup.
function createInMemoryCarrierRepository(
  definitions: readonly CarrierDefinition[] = carrierDefinitions,
): CarrierRepository {
  const providers = new Map(
    definitions.map(({ id, name, form, createAdapter }) => {
      const parsed = parseForm(form).form;
      return [id, { id, name, form: parsed, adapter: createAdapter(parsed) }];
    }),
  );
  return {
    list: () => [...providers.values()],
    findById: (id) => providers.get(id),
  };
}

export { type CarrierRepository, createInMemoryCarrierRepository };
