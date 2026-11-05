import { describe, expect, it } from '@jest/globals';
import {
  concat,
  matchOption,
  reformatDate,
  stateName,
} from '../../../src/modules/carrier/transforms';
import { parseIsoDate } from '../../../src/shared/dates';

const HARBOR_BREEDS = ['Labrador', 'Pit Bull', 'Rottweiler', 'Other'];

describe('carrier transforms', () => {
  it('joins name parts, and gives up if one is missing', () => {
    expect(concat(['Maya', 'Torres'])).toBe('Maya Torres');
    expect(concat(['Maya', undefined])).toBeNull();
  });

  it("formats a stored date in the carrier's format", () => {
    const birth = parseIsoDate('1994-03-12');

    expect(birth && reformatDate(birth, 'MM/DD/YYYY')).toBe('03/12/1994');
  });

  it('turns a state code into its name, whether or not the carrier serves it', () => {
    expect(stateName('OR')).toBe('Oregon');
    expect(stateName('NV')).toBe('Nevada');
    expect(stateName('XX')).toBeNull();
  });

  it('matches an option ignoring case, falling back to the caller-chosen option', () => {
    expect(matchOption('labrador', HARBOR_BREEDS, 'Other')).toEqual({
      option: 'Labrador',
      exact: true,
    });
    expect(matchOption('Beagle', HARBOR_BREEDS, 'Other')).toEqual({
      option: 'Other',
      exact: false,
    });
  });
});
