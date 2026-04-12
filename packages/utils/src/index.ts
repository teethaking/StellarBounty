export function formatStellarAsset(amount: string) {
  return `${parseFloat(amount).toFixed(2)} XLM`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { timeZone: 'UTC' });
}
