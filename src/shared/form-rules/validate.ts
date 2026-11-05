import { parseDate } from '../dates';
import type { FieldDef, FormDefinition } from '../form-schema';
import type { Answers, FieldValue } from '../schemas';
import { isAnswered, visibleFields } from './visibility';

type IssueCode =
  | 'required'
  | 'invalid_type'
  | 'invalid_option'
  | 'exclusive_option'
  | 'pattern'
  | 'min'
  | 'max'
  | 'email'
  | 'tel'
  | 'date';

interface FieldIssue {
  field: string;
  code: IssueCode;
  message: string;
}

type Problem = Omit<FieldIssue, 'field'> | null;

// The carrier JSON doesn't mark options as exclusive; "None" can't sit alongside a real answer.
const EXCLUSIVE_OPTION = 'None';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const wrongType = (field: FieldDef): Problem => ({
  code: 'invalid_type',
  message: `${field.label} has the wrong type of value`,
});

function checkField(field: FieldDef, value: FieldValue): Problem {
  switch (field.type) {
    case 'text':
      if (typeof value !== 'string') return wrongType(field);
      if (field.pattern && !new RegExp(`^(?:${field.pattern})$`, 'v').test(value)) {
        return { code: 'pattern', message: `${field.label} is not in the expected format` };
      }
      return null;
    case 'email':
      if (typeof value !== 'string') return wrongType(field);
      return EMAIL.test(value) ? null : { code: 'email', message: `Enter a valid email address` };
    case 'tel': {
      if (typeof value !== 'string') return wrongType(field);
      const digits = value.replace(/\D/g, '');
      const usNumber = digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
      return usNumber ? null : { code: 'tel', message: `Enter a 10-digit US phone number` };
    }
    case 'date':
      if (typeof value !== 'string') return wrongType(field);
      return parseDate(value, field.format)
        ? null
        : { code: 'date', message: `${field.label} must be a real date in ${field.format}` };
    case 'select':
      return field.options.some((option) => option === value)
        ? null
        : { code: 'invalid_option', message: `Choose one of the options for ${field.label}` };
    case 'multiselect':
      if (!Array.isArray(value)) return wrongType(field);
      if (!value.every((item) => field.options.includes(item))) {
        return { code: 'invalid_option', message: `Choose from the options for ${field.label}` };
      }
      return value.includes(EXCLUSIVE_OPTION) && value.length > 1
        ? {
            code: 'exclusive_option',
            message: `"${EXCLUSIVE_OPTION}" can't be combined with other options`,
          }
        : null;
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) return wrongType(field);
      if (field.min !== undefined && value < field.min) {
        return { code: 'min', message: `${field.label} must be at least ${field.min}` };
      }
      if (field.max !== undefined && value > field.max) {
        return { code: 'max', message: `${field.label} must be at most ${field.max}` };
      }
      return null;
    case 'boolean':
      return typeof value === 'boolean' ? null : wrongType(field);
  }
}

// Only visible fields are validated; a hidden field's leftover value is ignored.
function validateAnswers(form: FormDefinition, answers: Answers): FieldIssue[] {
  return visibleFields(form, answers).flatMap((field) => {
    const value = answers[field.key];
    if (!isAnswered(value)) {
      return field.required
        ? [{ field: field.key, code: 'required', message: `${field.label} is required` } as const]
        : [];
    }
    const problem = checkField(field, value);
    return problem ? [{ field: field.key, ...problem }] : [];
  });
}

export { type FieldIssue, type IssueCode, validateAnswers };
