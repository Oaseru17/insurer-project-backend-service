import type { QuoteDocument } from './quote.model';

interface QuoteRepository {
  insert(quote: QuoteDocument): void;
}

function createInMemoryQuoteRepository(): QuoteRepository {
  const collection = new Map<string, QuoteDocument>();
  return {
    insert: (quote) => {
      collection.set(quote._id, quote);
    },
  };
}

export { type QuoteRepository, createInMemoryQuoteRepository };
