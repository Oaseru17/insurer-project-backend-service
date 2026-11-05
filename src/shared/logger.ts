type Level = 'info' | 'warn' | 'error';
type Context = Record<string, unknown>;

interface Logger {
  info(msg: string, context?: Context): void;
  warn(msg: string, context?: Context): void;
  error(msg: string, context?: Context): void;
}

// Customer profile fields and carrier answers are PII; whole answer/request objects are dropped.
const REDACTED_KEYS = new Set([
  'first_name',
  'last_name',
  'date_of_birth',
  'email',
  'phone',
  'zip',
  'applicant_full_name',
  'contact_email',
  'postal_code',
  'answers',
  'request',
]);

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (typeof value !== 'object' || value === null) return value;
  return Object.fromEntries(
    Object.entries(value).map(([key, inner]) => [
      key,
      REDACTED_KEYS.has(key) ? '[redacted]' : redact(inner),
    ]),
  );
}

function createLogger(
  write: (line: string) => void = (line) => process.stdout.write(`${line}\n`),
): Logger {
  const log =
    (level: Level) =>
    (msg: string, context: Context = {}) => {
      write(
        JSON.stringify({
          level,
          time: new Date().toISOString(),
          msg,
          ...(redact(context) as Context),
        }),
      );
    };
  return { info: log('info'), warn: log('warn'), error: log('error') };
}

export { type Logger, createLogger };
