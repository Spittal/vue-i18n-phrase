import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import VueI18NExtract from 'vue-i18n-extract';
import { I18NItem } from 'vue-i18n-extract/dist-types/library/models';
import {
  getLocale,
  getProject,
  setupAxios,
  uploadLanguageFile,
  downloadAllTranslationsToI18NLanguage,
  getLocales,
} from '../phrase';
import {
  SyncCommandOptions,
  PhraseLocale,
} from '../types';

function parsedVueFilesToJSON (
  parsedVueFiles: I18NItem[],
  makeTranslation: boolean | string = false,
): Record<string, string> {
  return parsedVueFiles.reduce((accumulator, i18nItem) => {
    if (!!makeTranslation) {
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

function writeLanguageJSON (languageJSON: object, outputDir: string, locale: PhraseLocale): string {
  const filePath = path.resolve(process.cwd(), outputDir, `${locale.code}.json`);
  fs.writeFile(
    filePath,
    JSON.stringify(languageJSON),
    (err) => { if (err) { throw err; } },
  );
  return filePath;
}

export async function sync ({
  vueFiles,
  accessToken,
  projectID,
  tags,
  makeTranslation,
  skipReport = false,
  dryRun = false,
  outputDir = './phrase-reports',
}: SyncCommandOptions): Promise<void> {
  const parsedVueFiles = VueI18NExtract.parseVueFiles(vueFiles);
  const languageJSON = parsedVueFilesToJSON(parsedVueFiles, makeTranslation);

  console.log(chalk.green(`\nFound ${Object.keys(languageJSON).length} unique keys in your Vue.js files`));

  setupAxios(accessToken);

  console.log(chalk.bold(`\nGetting Phrase project and locale...`));

  const selectedProject = await getProject(projectID);
  const locales = await getLocales(selectedProject);
  const selectedLocale = await getLocale(selectedProject, makeTranslation, locales);

  console.log(`Using project: ${chalk.green(selectedProject.name)}`);
  console.log(`Using locale: ${chalk.green(selectedLocale.code)}`);

  await makeOutputDir(outputDir);
  const filePath = writeLanguageJSON(languageJSON, outputDir, selectedLocale);

  console.log(`\nUploading keys to Phrase for the ${chalk.bold(selectedLocale.name)} locale.`);
  if (tags) { console.log(`With the tags ${chalk.bold(tags)}`); }
  if (!!makeTranslation) { console.log(`With the keys set as the translation`); }

  if (!dryRun) {
    const uploadedFile =
      await uploadLanguageFile(filePath, selectedProject, selectedLocale, tags, makeTranslation);
    console.log(`\nKeys successfully added!`);
    console.log(`\nUpload File Summary:`);
    console.log(`File Name: ${uploadedFile.filename}`);
    console.log(`Keys Created: ${uploadedFile.summary.translation_keys_created}`);
    console.log(`Keys Updated: ${uploadedFile.summary.translations_updated}`);
    console.log(`Keys Unmentioned: ${uploadedFile.summary.translation_keys_unmentioned}`);
    console.log(`Key Translations Created: ${uploadedFile.summary.translations_created}`);
    console.log(`Key Translations Updated: ${uploadedFile.summary.translations_updated}`);
    console.log(`Tags Created: ${uploadedFile.summary.tags_created}`);
  } else {
    console.log(chalk.bgRed.whiteBright(`\nPsyke! it's a dry run, nothing is changed in Phrase!`));
  }

  if (!skipReport) {
    console.log(chalk.bold(`\nGenerating a full report...`));
    if (tags) { console.log(`Getting all translations with the tags ${chalk.bold(tags)}`); }

    const i18nLanguage = await downloadAllTranslationsToI18NLanguage(locales, selectedProject, tags);
    const report = VueI18NExtract.extractI18NReport(parsedVueFiles, i18nLanguage);
    await VueI18NExtract.writeReportToFile(report, `${outputDir}/report.json`);
  }

  console.log(chalk.green(`\nComplete! you can view you language file and report at ${outputDir}\n`));
}
