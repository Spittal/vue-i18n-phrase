import axios from 'axios';
import {
  PhraseLocale,
  PhraseProject,
  PhraseTranslation,
  PhraseUpload
} from './models';
import {
  I18NLanguage,
  I18NItem
} from 'vue-i18n-extract/dist-types/library/models';
import FormData from 'form-data';
import fs from 'fs';

export async function uploadLanguageFile(
  filePath: string,
  project: PhraseProject,
  locale: PhraseLocale,
  tags: string,
  makeTranslation: boolean | string
): Promise<PhraseUpload> {
  const formData = new FormData();

  const date = new Date();
  formData.append(
    'file',
    fs.createReadStream(filePath),
    `${locale.code}-${tags.split(',').join('-')}.json`,
  );
  formData.append('file_format', `json`);
  formData.append('locale_id', locale.id);
  if (tags) {
    formData.append('tags', tags);
  }
  formData.append('update_translations', `${!!makeTranslation}`);
  formData.append('skip_upload_tags', 'true');

  const { data: uploadedFile }: { data: PhraseUpload } = await axios.post(
    `https://api.phraseapp.com/api/v2/projects/${project.id}/uploads`,
    formData,
    {
      headers: formData.getHeaders()
    }
  );

  return confirmUploadSuccess(project, uploadedFile);
}

export async function confirmUploadSuccess(
  project: PhraseProject,
  upload: PhraseUpload,
): Promise<PhraseUpload> {
  return new Promise((resolve, reject) => {
    let count = 1;
    function viewUploadDetails () {
      if (count < 13) {
        setTimeout(async () => {
          const { data: uploadedFile }: { data: PhraseUpload } =
          await axios.get(`https://api.phraseapp.com/api/v2/projects/${project.id}/uploads/${upload.id}`);
          if (uploadedFile.state === 'success') {
            resolve(uploadedFile);
          } else {
            count++;
            viewUploadDetails();
          }
        }, 500);
      } else {
        reject(
          'It has taken over a minute to confirm the upload was a success. ' +
          'Please refer to your Phrase Dashboard Web UI Uploaded Files section for more information.',
        );
      }
    }
    viewUploadDetails();
  });
}

export async function downloadAllTranslationsToI18NLanguage(
  locales: PhraseLocale[],
  project: PhraseProject,
  tags: string
): Promise<I18NLanguage> {
  const i18nLanguage: I18NLanguage = {};

  for (const locale of locales) {
    const { data }: { data: PhraseTranslation[] } = await axios.get(
      `https://api.phraseapp.com/api/v2/projects/${project.id}/locales/${
        locale.id
      }/download`,
      { params: { file_format: 'simple_json', tags } }
    );

    i18nLanguage[locale.code] = Object.keys(data).map(path => {
      return {
        language: locale.code,
        path
      };
    }) as I18NItem[];
  }

  return i18nLanguage;
}
