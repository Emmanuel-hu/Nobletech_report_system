import crypto from 'node:crypto';

const stableSort = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => stableSort(item));
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, nestedValue]) => [key, stableSort(nestedValue)]);

    return Object.fromEntries(entries);
  }

  return value;
};

export const serializeStableSnapshot = (snapshot: unknown): string => {
  return JSON.stringify(stableSort(snapshot));
};

export const checksumSnapshot = (snapshot: unknown): string => {
  const serialized = serializeStableSnapshot(snapshot);
  return crypto.createHash('sha256').update(serialized).digest('hex');
};
