import type { QuoteDocument } from './quote.model';

interface QuoteRepository {
  insert(quote: QuoteDocument): void;
  findById(id: string): QuoteDocument | undefined;
}

function createInMemoryQuoteRepository(): QuoteRepository {
  const collection = new Map<string, QuoteDocument>();
  return {
    insert: (quote) => {
      collection.set(quote._id, quote);
    },
    findById: (id) => collection.get(id),
  };
}

export { type QuoteRepository, createInMemoryQuoteRepository };
