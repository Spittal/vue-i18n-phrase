import axios from 'axios';
import { PhraseLocale, PhraseProject, PhraseTranslation } from './models';
import { I18NLanguage, I18NItem } from 'vue-i18n-extract/dist-types/library/models';
import FormData from 'form-data';
import fs from 'fs';

export async function uploadLanguageFile (
  filePath: string,
  project: PhraseProject,
  locale: PhraseLocale,
  tags: string,
  makeTranslation: boolean | string,
): Promise<any> {
  const formData = new FormData();

  formData.append('file', fs.createReadStream(filePath), `${locale.code}.json`);
  formData.append('file_format', `json`);
  formData.append('locale_id', locale.id);
  formData.append('tags', tags);
  formData.append('update_translations', `${!!makeTranslation}`);
  formData.append('skip_upload_tags', 'true');

  const { data: uploadedFile } = await axios.post(
    `https://api.phraseapp.com/api/v2/projects/${project.id}/uploads`,
    formData,
    {
      headers: formData.getHeaders(),
    },
  );

  return uploadedFile;
}

export async function downloadAllTranslationsToI18NLanguage (
  locales: PhraseLocale[],
  project: PhraseProject,
  tags: string,
): Promise<I18NLanguage> {
  const i18nLanguage: I18NLanguage = {};

  for (const locale of locales) {
    const { data }: { data: PhraseTranslation[] } = await axios.get(
      `https://api.phraseapp.com/api/v2/projects/${project.id}/locales/${locale.id}/download`,
      { params: { file_format: 'simple_json', tags } },
    );

    i18nLanguage[locale.code] = Object.keys(data).map((path) => {
      return {
        language: locale.code,
        path,
      };
    }) as I18NItem[];
  }

  return i18nLanguage;
}
