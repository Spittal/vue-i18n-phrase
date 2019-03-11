import { SyncCommandOptions, PhraseProject } from './models';
import { getProjects, getAllKeys } from './phrase/index';
import { postKeys } from './phrase/index';
import VueI18NExtract from 'vue-i18n-extract';
import { I18NReport, I18NItem } from 'vue-i18n-extract/dist-types/library/models';

export default async function sync ({
  vueFiles,
  project,
  tags,
  makeTranslation,
  dryRun = false,
  output,
}: SyncCommandOptions): Promise<void> {
  const parsedVueFiles = await VueI18NExtract.parseVueFiles(vueFiles);

  // tslint:disable-next-line
  console.log(`\nFound ${parsedVueFiles.length} keys in your Vue.js files`);

  const selectedProject: PhraseProject = await getProjects(project);
  const keys: I18NItem[] = await getAllKeys(selectedProject);

  const report: I18NReport = VueI18NExtract.extractI18NReport(parsedVueFiles, { defaultLocale: keys });

  if (output) {
    let outputPath: string = './output.json';
    if (typeof output === 'string') {
      outputPath = output;
    }
    // tslint:disable-next-line
    console.log('\n'); // Used to make an new line for the writeReportToFile logs
    await VueI18NExtract.writeReportToFile(report, outputPath);
  }

  if (report.missingKeys.length === 0) {
    // tslint:disable-next-line
    console.log('\n🎉 You have no missing keys! Congratulations 🎉');
    return;
  }

  if (!dryRun) {
    postKeys(report, selectedProject, tags, makeTranslation);
  }
}
