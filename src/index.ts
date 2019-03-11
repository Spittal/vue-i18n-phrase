import program from 'commander';
import { sync } from './commands/index';

program
  .version(process.env.npm_package_version)
  .usage('sync [options]')
  .command('sync')
  .option('-v --vueFiles <vueFiles>', 'A file glob pointing to your Vue.js source files.')
  .option('-a --accessToken <accessToken>', 'Phrase API access token')
  .option('-p --project [project]', 'Phrase project, defaults to the first project in your account')
  .option(
    '-t, --tags [tags]',
    'A comma separated list of any custom tags you would like to apply to the keys',
  )
  .option(
    '-m --makeTranslation [makeTranslation]',
    // tslint:disable-next-line
    'If you would like the key path to be the translation in your default locale. Optionally set as a locale code to make translation in a non-default locale'
  )
  .option(
    '-s --skipReport [skipReport]',
    // tslint:disable-next-line
    'Skip report generation'
  )
  .option(
    '-o --outputDir [outputDir]',
    'Directory for report files. Will default to ./phrase-reports',
  )
  .option(
    '-d --dryRun [dryRun]',
    'Use if you do not want anything posted to Phrase',
  )
  .action(sync);

export async function run (): Promise<any> {
  program.parse(process.argv);
}
