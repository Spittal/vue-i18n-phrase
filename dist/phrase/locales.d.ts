import { PhraseProject, PhraseLocale } from '../types';
export declare function getSelectedLocale(locales: PhraseLocale[], makeTranslation?: string | boolean): PhraseLocale;
export declare function getLocales(project: PhraseProject): Promise<PhraseLocale[]>;
