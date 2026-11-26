const TIME_ZONES = Intl.supportedValuesOf('timeZone');
const PREFERRED = ['Europe/London', 'Europe/Lisbon'];
const MAX_SUGGESTIONS = 25;

export function findTimeZone(input: string): string | undefined {
  const wanted = input.trim().toLowerCase();
  return TIME_ZONES.find((zone) => zone.toLowerCase() === wanted);
}

export function suggestTimeZones(input: string): string[] {
  const wanted = input.trim().toLowerCase().replaceAll(' ', '_');
  const ordered = [...PREFERRED, ...TIME_ZONES.filter((zone) => !PREFERRED.includes(zone))];
  return ordered.filter((zone) => zone.toLowerCase().includes(wanted)).slice(0, MAX_SUGGESTIONS);
}
