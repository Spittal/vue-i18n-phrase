import * as functions from 'firebase-functions';
import axios from 'axios';
import * as cors from 'cors';
const corsHandler = cors({origin: true});

interface PhraseLocale {
  id: string;
  name: string;
  code: string;
  default: boolean;
  main: boolean;
  rtl: boolean;
  plural_forms: string[];
  source_locale: {
    id: string;
    name: string;
    code: string;
  };
  created_at: string;
  updated_at: string;
}

async function getLocale (localeCode: string, response: functions.Response): Promise<PhraseLocale> {
  const { data: firstData, lastPage } = await getPageOfLocales(1);

  let selectedLocale: PhraseLocale | undefined = findLocale(firstData, localeCode);
  if (selectedLocale) return selectedLocale;

  for (let page = 2; page <= lastPage; page++) {
    const { data } = await getPageOfLocales(page);

    selectedLocale = findLocale(data, localeCode);
    if (selectedLocale) return selectedLocale;
  }

  const errorMessage = 'Did not find a locale with provided locale code';
  response.status(404).send(errorMessage);
  throw errorMessage;
}

function findLocale (locales: PhraseLocale[], localeCode: string): PhraseLocale | undefined {
  return locales.find(locale => {
    if (localeCode) {
      return locale.code === localeCode;
    } else {
      return locale.default;
    }
  });
}

async function getPageOfLocales (page: number): Promise<{ data: PhraseLocale[], lastPage: number }> {
  const { data, headers } = await axios.get(`https://api.phraseapp.com/api/v2/projects/${functions.config().phrase.project_id}/locales`, {
    params: {
      page,
      per_page: 20,
    },
  });
  return {
    data,
    lastPage: getLastPageFromLink(headers.link),
  };
}

function getLastPageFromLink (link: string): number {
  const regex: RegExp = /page=([0-9]*)&per_page=[0-9]*>; rel=last/;
  const match = regex.exec(link);
  if (match) {
    return parseInt(match[1]);
  }
  return 1;
}

function setupAxios (response: functions.Response): void {
  axios.defaults.headers.common.Authorization = `token ${functions.config().phrase.access_token}`;
  axios.interceptors.response.use(
    (axiosResponse) => axiosResponse,
    (error) => {
      if (error.response) {
        console.error(error.response);
        response.status(error.response.status).send(error.response.data.message);
      } else if (error.request) {
        console.error(error.request);
      } else {
        console.error('Error', error.message);
      }
      response.status(500).send('Failed to get locale!');
    },
  );
}

export const getLocaleFromPhrase = functions.https.onRequest(async (request: functions.Request, response: functions.Response): Promise<void> => {
  corsHandler(request, response, () => { /* Cors Handled */ });
  setupAxios(response);

  const locale: PhraseLocale = await getLocale(request.query.locale, response);

  const { data, headers } = await axios.get(`https://api.phraseapp.com/api/v2/projects/${functions.config().phrase.project_id}/locales/${locale.id}/download`, {
    params: {
      file_format: 'simple_json',
      tags: request.query.tags
    }
  });

  response.set('Content-Type', 'application/json').set('Link', headers.link).set('Cache-Control', 'public, max-age=3600, s-maxage=7200').send(JSON.stringify(data));
});
