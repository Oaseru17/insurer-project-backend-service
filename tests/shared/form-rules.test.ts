import { describe, expect, it } from '@jest/globals';
import harborFormJson from '../../golden/harbor-form.json';
import quoteCases from '../../golden/maya.quote-requests.json';
import { parseForm } from '../../src/shared/form-schema';
import type { Answers } from '../../src/shared/schemas';
import { validateAnswers, visibleAnswers } from '../../src/shared/form-rules';

const { form } = parseForm(harborFormJson);
const mayaAnswers: Answers = quoteCases[0]?.answers ?? {};
const withoutDogBreed = Object.fromEntries(
  Object.entries(mayaAnswers).filter(([key]) => key !== 'dog_breed'),
);

describe('visibleAnswers', () => {
  it.each(quoteCases)('$name', ({ answers, expectedRequest }) => {
    expect(visibleAnswers(form, answers)).toEqual(expectedRequest);
  });
});

describe('validateAnswers', () => {
  it.each(quoteCases)('accepts: $name', ({ answers }) => {
    expect(validateAnswers(form, answers)).toEqual([]);
  });

  it('requires a dog breed only while Dog is selected', () => {
    expect(validateAnswers(form, { ...withoutDogBreed, pets: ['Cat'] })).toEqual([]);
    expect(validateAnswers(form, withoutDogBreed)).toEqual([
      expect.objectContaining({ field: 'dog_breed', code: 'required' }),
    ]);
  });

  it('does not allow None alongside another pet', () => {
    expect(validateAnswers(form, { ...mayaAnswers, pets: ['None', 'Cat'] })).toEqual([
      expect.objectContaining({ field: 'pets', code: 'exclusive_option' }),
    ]);
  });
});
