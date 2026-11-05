import { type DateFormat, formatDate } from '../../../shared/dates';

function reformatDate(date: Date, dateFormat: DateFormat): string {
  return formatDate(date, dateFormat);
}

export { reformatDate };
