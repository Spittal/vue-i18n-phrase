import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import VueI18NExtract from 'vue-i18n-extract';
import { I18NItem, I18NLanguage } from 'vue-i18n-extract/dist-types/library/models';
import {
  getLocales,
  getProject,
  getSelectedLocale,
  PhraseLocale,
  PhraseProject,
  setupAxios,
  uploadLanguageFile,
  downloadAllTranslationsToI18NLanguage
} from '../phrase/index';
import { SyncCommandOptions } from './models';

// tslint:disable-next-line
const log = console.log;

export async function sync ({
  vueFiles,
  accessToken,
  project,
  tags,
  makeTranslation,
  skipReport = false,
  dryRun = false,
  outputDir = './phrase-reports',
}: SyncCommandOptions): Promise<void> {
  const parsedVueFiles: I18NItem[] = await VueI18NExtract.parseVueFiles(vueFiles);
  const languageJSON: object = parsedVueFilesToJSON(parsedVueFiles, makeTranslation);

  log(chalk.green(`\nFound ${Object.keys(languageJSON).length} unique keys in your Vue.js files`));

  setupAxios(accessToken);

  log(chalk.bold(`\nGetting Phrase project and locale...`));

  const selectedProject: PhraseProject = await getProject(project);
  const locales: PhraseLocale[] = await getLocales(selectedProject);
  const selectedLocale: PhraseLocale = getSelectedLocale(locales, makeTranslation);

  log(`Using project: ${chalk.green(selectedProject.name)}`);
  log(`Using locale: ${chalk.green(selectedLocale.code)}`);

  await makeOutputDir(outputDir);
  const filePath = await writeLanguageJSON(languageJSON, outputDir, selectedLocale);

  log(`\nUploading keys to Phrase for the ${chalk.bold(selectedLocale.name)} locale.`);
  if (tags) { log(`With the tags ${chalk.bold(tags)}`); }
  if (makeTranslation) { log(`With the keys set as the translation`); }

  if (!dryRun) {
    await uploadLanguageFile(filePath, selectedProject, selectedLocale, tags, makeTranslation);
    log(`\nKeys successfully added!`);
  } else {
    log(chalk.bgRed.whiteBright(`\nPsyke! it's a dry run, nothing is changed in Phrase!`));
  }

  if (!skipReport) {
    log(chalk.bold(`\nGenerating a full report...`));
    if (tags) { log(`Getting all translations with the tags ${chalk.bold(tags)}`); }

    const i18nLanguage: I18NLanguage = await downloadAllTranslationsToI18NLanguage(locales, selectedProject, tags);
    const report = VueI18NExtract.extractI18NReport(parsedVueFiles, i18nLanguage);
    await VueI18NExtract.writeReportToFile(report, `${outputDir}/report.json`);
  }

  log(chalk.green(`\nComplete! you can view you language file and report at ${outputDir}\n`));
}

function parsedVueFilesToJSON (
  parsedVueFiles: I18NItem[],
  makeTranslation: boolean | string,
): object {
  return parsedVueFiles.reduce((accumulator, i18nItem) => {
    if (makeTranslation) {
      accumulator[i18nItem.path] = i18nItem.path;
    } else {
      accumulator[i18nItem.path] = '';
    }
    return accumulator;
  }, {});
}

async function makeOutputDir (outputDir: string): Promise<void> {
  return fs.mkdir(
    path.resolve(process.cwd(), outputDir),
    { recursive: true },
    (err) => { if (err) { throw err; } },
  );
}

async function writeLanguageJSON (languageJSON: object, outputDir: string, locale: PhraseLocale): Promise<string> {
  const filePath = path.resolve(process.cwd(), outputDir, `${locale.code}.json`);
  await fs.writeFile(
    filePath,
    JSON.stringify(languageJSON),
    (err) => { if (err) { throw err; } },
  );
  return filePath;
}
