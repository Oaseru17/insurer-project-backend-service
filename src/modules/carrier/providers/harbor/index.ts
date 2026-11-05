import type { CarrierDefinition } from '../../carrier.types';
import form from './form.json';
import { createHarborAdapter } from './harbor.adapter';
import { createHarborRules } from './harbor.eligibility';

const harbor: CarrierDefinition = {
  id: 'harbor',
  name: 'Harbor Assurance',
  form,
  createAdapter: createHarborAdapter,
  createRules: createHarborRules,
};

export { harbor };
