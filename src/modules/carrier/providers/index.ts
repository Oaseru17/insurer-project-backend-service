import type { CarrierDefinition } from '../carrier.types';
import { harbor } from './harbor';

// Registry: adding a carrier means adding its folder and one entry here.
const carrierDefinitions: readonly CarrierDefinition[] = [harbor];

export { carrierDefinitions };
