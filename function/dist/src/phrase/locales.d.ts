import { PhraseProject, PhraseLocale } from '../types';
export declare function getLocales(project: PhraseProject): Promise<PhraseLocale[]>;
export declare function getLocale(project: PhraseProject, localeCode?: string | boolean, locales?: PhraseLocale[]): Promise<PhraseLocale>;
