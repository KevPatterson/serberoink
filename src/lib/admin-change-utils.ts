export function hasSectionChanged<T>(current: T | undefined, lastSaved: T | undefined): boolean {
  return JSON.stringify(current) !== JSON.stringify(lastSaved);
}

export function hasPendingFiles(record: Record<string, File>): boolean {
  return Object.keys(record).length > 0;
}
