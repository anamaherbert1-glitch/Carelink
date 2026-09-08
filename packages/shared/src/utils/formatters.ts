export function formatXof(amount: number): string { return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'XOF',maximumFractionDigits:0}).format(amount); }
export function formatDate(value: string | Date): string { return new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)); }
export function formatDistance(distanceKm: number | null | undefined): string {
  if (distanceKm === null || distanceKm === undefined || !Number.isFinite(distanceKm)) return 'Distance inconnue';
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  return `${distanceKm.toFixed(1)} km`;
}
export function formatFCFA(amount: number | null | undefined): string { return formatXof(amount ?? 0); }
export function formatPhoneNumber(phone: string | null | undefined): string { return phone ? phone.replace(/[^\d+]/g,'') : ''; }
export function formatDateTime(isoString: string | null | undefined): string { return isoString ? formatDate(isoString) : ''; }
