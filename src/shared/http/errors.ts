import type { ErrorResponse, Reason } from '../schemas';

type ErrorCode = ErrorResponse['error']['code'];

interface Issue {
  path: string;
  message: string;
  code?: string;
}

class HttpError extends Error {
  readonly status: number;
  readonly code: ErrorCode;

  constructor(status: number, code: ErrorCode, message: string) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
  }

  toResponse(): ErrorResponse {
    return { error: { code: this.code, message: this.message } };
  }
}

class ValidationError extends HttpError {
  readonly issues: Issue[];

  constructor(issues: Issue[], message = 'The request is not valid') {
    super(400, 'invalid_request', message);
    this.issues = issues;
  }

  override toResponse(): ErrorResponse {
    return { error: { ...super.toResponse().error, issues: this.issues } };
  }
}

class NotFoundError extends HttpError {
  constructor(what: string) {
    super(404, 'not_found', `${what} not found`);
  }
}

class IneligibleError extends HttpError {
  readonly reasons: Reason[];

  constructor(reasons: Reason[]) {
    super(422, 'ineligible', 'The carrier cannot quote this customer');
    this.reasons = reasons;
  }

  override toResponse(): ErrorResponse {
    return { error: { ...super.toResponse().error, reasons: this.reasons } };
  }
}

export { type Issue, HttpError, ValidationError, NotFoundError, IneligibleError };
