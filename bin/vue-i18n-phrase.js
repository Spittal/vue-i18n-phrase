#!/usr/bin/env node
// vim: set filetype=javascript:
 /* eslint-disable */
'use strict';
const program = require('commander');
const VueI18NPhrase = require('../dist/vue-i18n-phrase.umd');

program
  .version(process.env.npm_package_version || '0.0.0')
  .usage('sync [options]')
  .command('sync', { isDefault: true })
  .requiredOption(
    '-v --vueFiles <vueFiles>',
    'A file glob pointing to your Vue.js source files.'
  )
  .requiredOption(
    '-a --accessToken <accessToken>',
    'Phrase API access token'
  )
  .option(
    '-p --projectID [project]',
    'Phrase Project ID, defaults to the first project in your account, projectID can be found on projects page, then hovering over project and choosing ID'
  )
  .option(
    '-t, --tags [tags]',
    'A comma separated list of any custom tags you would like to apply to the keys',
  )
  .option(
    '-m --makeTranslation [makeTranslation]',
    'If you would like the key path to be the translation in your default locale. Optionally set as a locale code to make translation in a non-default locale'
  )
  .option(
    '-s --skipReport [skipReport]',
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
  .action(VueI18NPhrase.sync);

program.parse(process.argv);
