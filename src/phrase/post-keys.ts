import axios, { AxiosError } from 'axios';
import { I18NReport } from 'vue-i18n-extract/dist-types/library/models';
import { PhraseProject, PhraseKey, PhraseLocale } from '@/models';
import { getLocale } from './getters';

export async function postKeys (
  report: I18NReport,
  project: PhraseProject,
  tags: string,
  makeTranslation: string | boolean,
): Promise<void> {
  let locale: PhraseLocale;
  if (makeTranslation) {
    locale = await getLocale(project, makeTranslation);
  }

  for (const missingKey of report.missingKeys) {
    // tslint:disable-next-line
    console.log(`\n🔑 Key "${missingKey.path}"`);

    try {
      const { data: keyPost }: { data: PhraseKey } =
        await axios.post(`https://api.phraseapp.com/api/v2/projects/${project.id}/keys`, {
          name: missingKey.path,
          tags,
        });

      // tslint:disable-next-line
      console.log(`Added to phrase.`);

      if (tags) {
        // tslint:disable-next-line
        console.log(`With tags ${tags}.`);
      }

      if (locale) {
        await axios.post(`https://api.phraseapp.com/api/v2/projects/${project.id}/translations`, {
          locale_id: locale.id,
          key_id: keyPost.id,
          content: keyPost.name,
        });

        // tslint:disable-next-line
        console.log(`Default translation added to the ${locale.name} locale.`);
      }
    } catch (error) {
      if (error.response.status === 422) {
        // tslint:disable-next-line
        console.error(error.response.data.message);
      }
    }
  }
}
