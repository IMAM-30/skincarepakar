type LimitOptions = {
  defaultLimit?: number;
  maxLimit?: number;
  minLimit?: number;
};

export function parseTakeLimit(value: string | null, options: LimitOptions = {}): number {
  const defaultLimit = options.defaultLimit ?? 150;
  const maxLimit = options.maxLimit ?? 150;
  const minLimit = options.minLimit ?? 1;
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < minLimit) {
    return defaultLimit;
  }

  return Math.min(parsed, maxLimit);
}
