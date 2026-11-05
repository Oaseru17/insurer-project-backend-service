import { differenceInYears, format, isValid, parseISO } from 'date-fns';

// Date-only values are parsed as local midnight by date-fns, and every date (birth date and the
// injected `asOf`) goes through the same parser, so ages never shift by a day. Never call
// `new Date('YYYY-MM-DD')` directly: it parses as UTC midnight.

// parseISO also accepts week dates and timestamps; the API contract is calendar dates only.
const ISO_CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Carrier-facing format names mapped to date-fns tokens.
const DATE_FORMATS = {
  'MM/DD/YYYY': 'MM/dd/yyyy',
  'YYYY-MM-DD': 'yyyy-MM-dd',
} as const;

type DateFormat = keyof typeof DATE_FORMATS;

const SUPPORTED_DATE_FORMATS = Object.keys(DATE_FORMATS) as [DateFormat, ...DateFormat[]];

function parseIsoDate(value: string): Date | null {
  if (!ISO_CALENDAR_DATE.test(value)) return null;
  const date = parseISO(value);
  return isValid(date) ? date : null;
}

function formatDate(date: Date, dateFormat: DateFormat): string {
  return format(date, DATE_FORMATS[dateFormat]);
}

// Completed years on `asOf`. A 29 February birthday counts from 1 March in non-leap years.
function ageOn(birth: Date, asOf: Date): number {
  return differenceInYears(asOf, birth);
}

export { type DateFormat, SUPPORTED_DATE_FORMATS, parseIsoDate, formatDate, ageOn };
