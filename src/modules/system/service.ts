/**
 * One entry per whole-hour offset, 24 in all (Discord allows 25 choices).
 * Each maps to a named zone, not a fixed offset, so daylight saving still applies.
 * Labels show the standard (winter) offset.
 */
export const TIME_ZONES = [
  { zone: 'Pacific/Pago_Pago', label: '(GMT-11:00) SST (American Samoa)' },
  { zone: 'Pacific/Honolulu', label: '(GMT-10:00) HST (United States, Hawaii)' },
  { zone: 'America/Anchorage', label: '(GMT-09:00) AKST / AKDT (United States, Alaska)' },
  { zone: 'America/Los_Angeles', label: '(GMT-08:00) PST / PDT (United States, Pacific)' },
  { zone: 'America/Denver', label: '(GMT-07:00) MST / MDT (United States, Mountain)' },
  { zone: 'America/Chicago', label: '(GMT-06:00) CST / CDT (United States, Central)' },
  { zone: 'America/New_York', label: '(GMT-05:00) EST / EDT (United States, Eastern)' },
  { zone: 'America/Halifax', label: '(GMT-04:00) AST / ADT (Canada, Atlantic)' },
  { zone: 'America/Sao_Paulo', label: '(GMT-03:00) BRT (Brazil)' },
  { zone: 'America/Noronha', label: '(GMT-02:00) FNT (Brazil, Fernando de Noronha)' },
  { zone: 'Atlantic/Azores', label: '(GMT-01:00) AZOT / AZOST (Portugal, Azores)' },
  { zone: 'Europe/London', label: '(GMT+00:00) GMT / BST, WET / WEST (United Kingdom, Portugal)' },
  { zone: 'Europe/Berlin', label: '(GMT+01:00) CET / CEST (Germany)' },
  { zone: 'Europe/Kyiv', label: '(GMT+02:00) EET / EEST (Ukraine)' },
  { zone: 'Europe/Moscow', label: '(GMT+03:00) MSK (Russia)' },
  { zone: 'Asia/Dubai', label: '(GMT+04:00) GST (United Arab Emirates)' },
  { zone: 'Asia/Karachi', label: '(GMT+05:00) PKT (Pakistan)' },
  { zone: 'Asia/Dhaka', label: '(GMT+06:00) BDT (Bangladesh)' },
  { zone: 'Asia/Jakarta', label: '(GMT+07:00) WIB (Indonesia)' },
  { zone: 'Asia/Shanghai', label: '(GMT+08:00) CST (China)' },
  { zone: 'Asia/Tokyo', label: '(GMT+09:00) JST (Japan)' },
  { zone: 'Australia/Sydney', label: '(GMT+10:00) AEST / AEDT (Australia, Eastern)' },
  { zone: 'Pacific/Guadalcanal', label: '(GMT+11:00) SBT (Solomon Islands)' },
  { zone: 'Pacific/Auckland', label: '(GMT+12:00) NZST / NZDT (New Zealand)' },
];

export function findTimeZone(zone: string) {
  return TIME_ZONES.find((entry) => entry.zone === zone);
}
