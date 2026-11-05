import type { CarrierDefinition } from '../../carrier.types';
import form from './form.json';
import { createHarborAdapter } from './harbor.adapter';

const harbor: CarrierDefinition = {
  id: 'harbor',
  name: 'Harbor Assurance',
  form,
  createAdapter: createHarborAdapter,
};

export { harbor };
