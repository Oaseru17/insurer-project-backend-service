interface OptionMatch {
  option: string;
  exact: boolean;
}

function matchOption(
  value: string,
  options: readonly string[],
  fallback: string,
): OptionMatch | null {
  const wanted = value.trim().toLowerCase();
  const exact = options.find((option) => option.toLowerCase() === wanted);
  if (exact !== undefined) return { option: exact, exact: true };
  return options.includes(fallback) ? { option: fallback, exact: false } : null;
}

export { type OptionMatch, matchOption };
