import { utc } from '@date-fns/utc';
import { differenceInYears, format, isValid, parse, parseISO } from 'date-fns';

const ISO_CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

const DATE_FORMATS = {
  'MM/DD/YYYY': { token: 'MM/dd/yyyy', shape: /^\d{2}\/\d{2}\/\d{4}$/ },
  'YYYY-MM-DD': { token: 'yyyy-MM-dd', shape: ISO_CALENDAR_DATE },
} as const;

type DateFormat = keyof typeof DATE_FORMATS;

const SUPPORTED_DATE_FORMATS = Object.keys(DATE_FORMATS) as [DateFormat, ...DateFormat[]];

// Calendar dates are UTC midnight everywhere, so they serialise the same whatever the server's timezone.
function parseIsoDate(value: string): Date | null {
  if (!ISO_CALENDAR_DATE.test(value)) return null;
  const date = parseISO(value, { in: utc });
  return isValid(date) ? date : null;
}

function parseDate(value: string, dateFormat: DateFormat): Date | null {
  const { token, shape } = DATE_FORMATS[dateFormat];
  if (!shape.test(value)) return null;
  const date = parse(value, token, new Date(0), { in: utc });
  return isValid(date) ? date : null;
}

function formatDate(date: Date, dateFormat: DateFormat): string {
  return format(date, DATE_FORMATS[dateFormat].token, { in: utc });
}

function ageOn(birth: Date, asOf: Date): number {
  return differenceInYears(asOf, birth, { in: utc });
}

export { type DateFormat, SUPPORTED_DATE_FORMATS, parseIsoDate, parseDate, formatDate, ageOn };
