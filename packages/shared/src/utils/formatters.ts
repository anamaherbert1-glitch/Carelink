export function formatXof(amount: number): string { return new Intl.NumberFormat('fr-FR',{style:'currency',currency:'XOF',maximumFractionDigits:0}).format(amount); }
export function formatDate(value: string | Date): string { return new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)); }
