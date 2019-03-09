import axios from 'axios';
import { PhraseProject, PhraseKey, PhraseLocale } from '@/models';
import { I18NItem } from 'vue-i18n-extract/dist-types/library/models';

export async function getProjects (projectName?: string): Promise<PhraseProject> {
  const { data: projects }: { data: PhraseProject[] } =
    await axios.get('https://api.phraseapp.com/api/v2/projects');

  // tslint:disable-next-line
  console.log(`\nGetting Phrase projects...`);

  const selectedProject = (projectName) ? projects.find((project) => project.name === projectName) : projects[0];

  // tslint:disable-next-line
  console.log(`Using project: ${selectedProject.name}`);

  return selectedProject;
}

export async function getLocale (project: PhraseProject, makeTranslation: string | boolean): Promise<PhraseLocale> {
  const { data: locales }: { data: PhraseLocale[] } =
    await axios.get(`https://api.phraseapp.com/api/v2/projects/${project.id}/locales`);

  if (makeTranslation === true) {
    return locales.find((locale) => locale.default);
  } else {
    return locales.find((locale) => locale.code === makeTranslation);
  }
}

export async function getAllKeys (project: PhraseProject): Promise<I18NItem[]> {
  const keys: PhraseKey[] = [];

  // tslint:disable-next-line
  console.log(`\nFetching keys...`);

  const { data: firstData, lastPage } = await getPageOfKeys(project.id, 1);
  keys.push(...firstData);

  // tslint:disable-next-line
  console.log(`Got ${firstData.length} keys from page 1...`);

  for (let page = 2; page <= lastPage; page++) {
    const { data } = await getPageOfKeys(project.id, page);
    // tslint:disable-next-line
    console.log(`Got ${data.length} keys from page ${page}...`);
    keys.push(...data);
  }

  // tslint:disable-next-line
  console.log(`Finished fetching keys. Found ${keys.length} keys in your Phrase project.`);

  return keys.map((key) => {
    return {
      path: key.name,
    } as I18NItem;
  });
}

async function getPageOfKeys (projectId: string, page: number): Promise<any> {
  const { data, headers } = await axios.get(`https://api.phraseapp.com/api/v2/projects/${projectId}/keys`, {
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
