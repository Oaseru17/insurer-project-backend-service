import { differenceInYears, format, isValid, parseISO } from 'date-fns';

const ISO_CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;

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

function ageOn(birth: Date, asOf: Date): number {
  return differenceInYears(asOf, birth);
}

export { type DateFormat, SUPPORTED_DATE_FORMATS, parseIsoDate, formatDate, ageOn };
