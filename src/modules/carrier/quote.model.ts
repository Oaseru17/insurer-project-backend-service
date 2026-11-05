import type { Answers } from '../../shared/schemas';
import type { QuoteResponse } from './schemas';

interface QuoteDocument {
  _id: string;
  carrierId: string;
  customerId: string;
  request: Answers;
  createdAt: Date;
}

function toQuoteResponse({ _id, carrierId, request }: QuoteDocument): QuoteResponse {
  return { quoteId: _id, carrierId, request, sent: false };
}

export { type QuoteDocument, toQuoteResponse };
