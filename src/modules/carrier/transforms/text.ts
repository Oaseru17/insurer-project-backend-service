function concat(parts: readonly (string | undefined)[], separator = ' '): string | null {
  if (parts.some((part) => part === undefined || part.trim() === '')) return null;
  return parts.map((part) => part?.trim()).join(separator);
}

export { concat };
