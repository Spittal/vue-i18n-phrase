import axios from 'axios';
import { PhraseProject, PhraseLocale } from '../types';

function getLastPageFromLink (link: string): number {
  const regex = /page=([0-9]*)&per_page=100>; rel=last/;
  const regexMatch = regex.exec(link);

  if (!regexMatch) throw new Error('Could not get pagination info from the PhraseAPI');

  return parseInt(regexMatch[1]);
}

async function getPageOfLocales (project: PhraseProject, page: number): Promise<{ data: PhraseLocale[]; lastPage: number }> {
  const { data, headers } = await axios.get(`https://api.phraseapp.com/api/v2/projects/${project.id}/locales`, {
    params: {
      page,
      per_page: 100, // eslint-disable-line @typescript-eslint/camelcase
    },
  });
  return {
    data,
    lastPage: getLastPageFromLink(headers.link),
  };
}

export async function getLocales (project: PhraseProject): Promise<PhraseLocale[]> {
  const locales: PhraseLocale[] = [];

  const { data: firstData, lastPage } = await getPageOfLocales(project, 1);
  locales.push(...firstData);

  for (let page = 2; page <= lastPage; page++) {
    const { data } = await getPageOfLocales(project, page);
    locales.push(...data);
  }

  return locales;
}

export async function getLocale (project: PhraseProject, localeCode: string | boolean = false, locales?: PhraseLocale[]): Promise<PhraseLocale> {
  if (!locales) {
    locales = await getLocales(project);
  }

  let locale: PhraseLocale | undefined;
  if (typeof localeCode === 'string') {
    locale = locales.find(locale => locale.code === localeCode);

    // Last ditch effort to find locale
    if (!locale) {
      locale = locales.find(locale => {
        const language = locale.code.split('-')[0];
        return language === localeCode;
      });
    }
  } else {
    locale = locales.find(locale => locale.default);
  }

  if (!locale) throw new Error('Locale not found, is the argument makeTranslation set correctly?');

  return locale;
}


