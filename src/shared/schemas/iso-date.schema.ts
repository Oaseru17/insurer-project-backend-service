import { z } from 'zod';
import { parseIsoDate } from '../dates';

const IsoDateSchema = z
  .string()
  .refine((value) => parseIsoDate(value) !== null, 'must be a real calendar date, YYYY-MM-DD')
  .meta({ id: 'IsoDate', example: '2026-11-05' });

export { IsoDateSchema };
