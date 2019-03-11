import axios from 'axios';
import { PhraseProject, PhraseLocale } from './models';

export function getSelectedLocale (locales: PhraseLocale[], makeTranslation: string | boolean): PhraseLocale {
  if (makeTranslation === true) {
    return locales.find((locale) => locale.default);
  } else {
    return locales.find((locale) => locale.code === makeTranslation);
  }
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

async function getPageOfLocales (project: PhraseProject, page: number): Promise<any> {
  const { data, headers } = await axios.get(`https://api.phraseapp.com/api/v2/projects/${project.id}/locales`, {
    params: {
      page,
      per_page: 100,
    },
  });
  return {
    data,
    lastPage: getLastPageFromLink(headers.link),
  };
}

function getLastPageFromLink (link: string): string {
  const regex: RegExp = /page=([0-9]*)&per_page=100>; rel=last/;
  return regex.exec(link)[1];
}
