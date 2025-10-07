export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysUntil(date: Date): number {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function isExpired(date: Date): boolean {
  return new Date() > date;
}

export function formatDuration(days: number): string {
  if (days < 0) return 'Expired';
  if (days === 0) return 'Expires today';
  if (days === 1) return 'Expires tomorrow';
  if (days < 30) return `Expires in ${days} days`;
  if (days < 365) return `Expires in ${Math.floor(days / 30)} months`;
  return `Expires in ${Math.floor(days / 365)} years`;
}