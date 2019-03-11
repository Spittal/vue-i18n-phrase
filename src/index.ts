import program from 'commander';
import sync from './sync-command';
import { setupAxios } from './phrase/index';
import { SyncCommandOptions } from './models';

program
  .version(process.env.npm_package_version)
  .usage('sync [options]')
  .command('sync')
  .option('-v --vueFiles <vueFiles>', 'A file glob pointing to your Vue.js source files.')
  .option('-a --accessToken <accessToken>', 'Phrase API access token')
  .option(
    '-t, --tags [tags]',
    // tslint:disable-next-line
    'In addition to the normal default tags, a comma separated list of any custom tags you would like to apply to the keys'
  )
  .option(
    '-m --makeTranslation [makeTranslation]',
    // tslint:disable-next-line
    'If you would like the key path to be the default translation. If this has no value it will use your default locale in Phrase, however you can set the value of this to a locale code in order to specify a locale in which to make the translation.'
  )
  .option('-p --project [project]', 'Phrase project, defaults to the first project in your account')
  .option(
    '-o --output [output]',
    'Use if you want to create a json file out of your report. Will default to ./output.json',
  )
  .option(
    '-d --dryRun [dryRun]',
    'Dry run outputs a file to ./output.json with the report instead of posting missing keys to phrase'
  )
  .action((options: SyncCommandOptions) => {
    setupAxios(options.accessToken);
    sync(options);
  });

export async function run (): Promise<any> {
  program.parse(process.argv);
}
