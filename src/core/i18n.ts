import { en, type MessageKey } from '../locales/en.js';
import { pt } from '../locales/pt.js';

export type { MessageKey };

export const catalogs = { en, pt };
export type Locale = keyof typeof catalogs;

export function isLocale(value: string): value is Locale {
  return Object.hasOwn(catalogs, value);
}

export type Translate = (key: MessageKey, params?: Record<string, string | number>) => string;

export function translator(locale: Locale): Translate {
  return (key, params = {}) =>
    catalogs[locale][key].replace(/\{(\w+)\}/g, (match, name: string) =>
      String(params[name] ?? match),
    );
}
