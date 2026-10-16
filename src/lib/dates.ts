export interface DatedNotice { start: string; end: string; announceFrom: string }
export function localDate(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Denver', year:'numeric', month:'2-digit', day:'2-digit'}).format(now);
}
export function visibleNotices<T extends DatedNotice>(notices: readonly T[], today: string): T[] {
  return notices.filter(n => n.announceFrom <= today && n.end >= today);
}
export function exhibitionStatus(item: {start: string | null; end: string | null}, today: string): 'current' | 'coming' | 'past' {
  if (item.start && item.start > today) return 'coming';
  if (item.end && item.end < today) return 'past';
  return 'current';
}
export function hoursForDate(today: string, regular: string, closed: string, friday: string): string {
  if (['12-25', '08-26'].includes(today.slice(5))) return closed;
  return new Date(`${today}T12:00:00Z`).getUTCDay() === 5 ? friday : regular;
}
