import { PhraseLocale, PhraseProject, PhraseUpload } from '../types';
import { I18NLanguage } from 'vue-i18n-extract';
export declare function confirmUploadSuccess(project: PhraseProject, upload: PhraseUpload): Promise<PhraseUpload>;
export declare function uploadLanguageFile(filePath: string, project: PhraseProject, locale: PhraseLocale, tags?: string, makeTranslation?: boolean | string): Promise<PhraseUpload>;
export declare function downloadAllTranslationsToI18NLanguage(locales: PhraseLocale[], project: PhraseProject, tags?: string): Promise<I18NLanguage>;
