import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import VueI18NExtract from 'vue-i18n-extract';
import axios from 'axios';
import FormData from 'form-data';

async function getProject(projectID) {
  var {
    data: projects
  } = await axios.get('https://api.phraseapp.com/api/v2/projects');
  var project = projectID ? projects.find(project => project.id === projectID) : projects[0];
  if (!project) throw new Error('Could not find project from PhraseAPI. If no project was defined as an argument, then there is no project in the selected Phrase Account');
  return project;
}

function getLastPageFromLink(link) {
  var regex = /page=([0-9]*)&per_page=100>; rel=last/;
  var regexMatch = regex.exec(link);
  if (!regexMatch) throw new Error('Could not get pagination info from the PhraseAPI');
  return parseInt(regexMatch[1]);
}

async function getPageOfLocales(project, page) {
  var {
    data,
    headers
  } = await axios.get("https://api.phraseapp.com/api/v2/projects/" + project.id + "/locales", {
    params: {
      page,
      per_page: 100
    }
  });
  return {
    data,
    lastPage: getLastPageFromLink(headers.link)
  };
}

async function getLocales(project) {
  var locales = [];
  var {
    data: firstData,
    lastPage
  } = await getPageOfLocales(project, 1);
  locales.push(...firstData);

  for (var page = 2; page <= lastPage; page++) {
    var {
      data
    } = await getPageOfLocales(project, page);
    locales.push(...data);
  }

  return locales;
}
async function getLocale(project, localeCode, locales) {
  if (localeCode === void 0) {
    localeCode = false;
  }

  if (!locales) {
    locales = await getLocales(project);
  }

  var locale;

  if (typeof localeCode === 'string') {
    locale = locales.find(locale => locale.code === localeCode);

    if (!locale) {
      locale = locales.find(locale => {
        var language = locale.code.split('-')[0];
        return language === localeCode;
      });
    }
  } else {
    locale = locales.find(locale => locale.default);
  }

  if (!locale) throw new Error('Locale not found, is the argument makeTranslation set correctly?');
  return locale;
}

async function confirmUploadSuccess(project, upload) {
  return new Promise((resolve, reject) => {
    var count = 1;

    function viewUploadDetails() {
      if (count < 13) {
        setTimeout(async () => {
          var {
            data: uploadedFile
          } = await axios.get("https://api.phraseapp.com/api/v2/projects/" + project.id + "/uploads/" + upload.id);

          if (uploadedFile.state === 'success') {
            resolve(uploadedFile);
          } else {
            count++;
            viewUploadDetails();
          }
        }, 500);
      } else {
        reject('It has taken over a minute to confirm the upload was a success. ' + 'Please refer to your Phrase Dashboard Web UI Uploaded Files section for more information.');
      }
    }

    viewUploadDetails();
  });
}
async function uploadLanguageFile(filePath, project, locale, tags, makeTranslation) {
  if (makeTranslation === void 0) {
    makeTranslation = false;
  }

  var formData = new FormData();
  formData.append('file', fs.createReadStream(filePath), locale.code + "-" + (tags || '').split(',').join('-') + ".json");
  formData.append('file_format', "simple_json");
  formData.append('locale_id', locale.id);

  if (tags) {
    formData.append('tags', tags);
  }

  formData.append('update_translations', "" + !!makeTranslation);
  formData.append('skip_upload_tags', 'true');
  var {
    data: uploadedFile
  } = await axios.post("https://api.phraseapp.com/api/v2/projects/" + project.id + "/uploads", formData, {
    headers: formData.getHeaders()
  });
  return confirmUploadSuccess(project, uploadedFile);
}
async function downloadAllTranslationsToI18NLanguage(locales, project, tags) {
  var i18nLanguage = {};

  var _loop = async function _loop(locale) {
    var {
      data
    } = await axios.get("https://api.phraseapp.com/api/v2/projects/" + project.id + "/locales/" + locale.id + "/download", {
      params: {
        file_format: 'simple_json',
        tags
      }
    });
    i18nLanguage[locale.code] = Object.keys(data).map(path => {
      return {
        language: locale.code,
        path
      };
    });
  };

  for (var locale of locales) {
    await _loop(locale);
  }

  return i18nLanguage;
}

function setupAxios(accessToken) {
  axios.defaults.headers.common.Authorization = "token " + accessToken;
  axios.interceptors.response.use(response => response, error => {
    if (error.response && error.response.status === 429) {
      throw new Error('Too many requests sent to the PhraseAPI, please wait 5 minutes and try again.');
    }

    throw error;
  });
}

function parsedVueFilesToJSON(parsedVueFiles, makeTranslation) {
  if (makeTranslation === void 0) {
    makeTranslation = false;
  }

  return parsedVueFiles.reduce((accumulator, i18nItem) => {
    if (!!makeTranslation) {
      accumulator[i18nItem.path] = i18nItem.path;
    } else {
      accumulator[i18nItem.path] = '';
    }

    return accumulator;
  }, {});
}

async function makeOutputDir(outputDir) {
  return fs.mkdir(path.resolve(process.cwd(), outputDir), {
    recursive: true
  }, err => {
    if (err) {
      throw err;
    }
  });
}

function writeLanguageJSON(languageJSON, outputDir, locale) {
  var filePath = path.resolve(process.cwd(), outputDir, locale.code + ".json");
  fs.writeFile(filePath, JSON.stringify(languageJSON), err => {
    if (err) {
      throw err;
    }
  });
  return filePath;
}

async function sync(_ref) {
  var {
    vueFiles,
    accessToken,
    projectID,
    tags,
    makeTranslation,
    skipReport = false,
    dryRun = false,
    outputDir = './phrase-reports'
  } = _ref;
  var parsedVueFiles = VueI18NExtract.parseVueFiles(vueFiles);
  var languageJSON = parsedVueFilesToJSON(parsedVueFiles, makeTranslation);
  console.log(chalk.green("\nFound " + Object.keys(languageJSON).length + " unique keys in your Vue.js files"));
  setupAxios(accessToken);
  console.log(chalk.bold("\nGetting Phrase project and locale..."));
  var selectedProject = await getProject(projectID);
  var locales = await getLocales(selectedProject);
  var selectedLocale = await getLocale(selectedProject, makeTranslation, locales);
  console.log("Using project: " + chalk.green(selectedProject.name));
  console.log("Using locale: " + chalk.green(selectedLocale.code));
  await makeOutputDir(outputDir);
  var filePath = writeLanguageJSON(languageJSON, outputDir, selectedLocale);
  console.log("\nUploading keys to Phrase for the " + chalk.bold(selectedLocale.name) + " locale.");

  if (tags) {
    console.log("With the tags " + chalk.bold(tags));
  }

  if (!!makeTranslation) {
    console.log("With the keys set as the translation");
  }

  if (!dryRun) {
    var uploadedFile = await uploadLanguageFile(filePath, selectedProject, selectedLocale, tags, makeTranslation);
    console.log("\nKeys successfully added!");
    console.log("\nUpload File Summary:");
    console.log("File Name: " + uploadedFile.filename);
    console.log("Keys Created: " + uploadedFile.summary.translation_keys_created);
    console.log("Keys Updated: " + uploadedFile.summary.translations_updated);
    console.log("Keys Unmentioned: " + uploadedFile.summary.translation_keys_unmentioned);
    console.log("Key Translations Created: " + uploadedFile.summary.translations_created);
    console.log("Key Translations Updated: " + uploadedFile.summary.translations_updated);
    console.log("Tags Created: " + uploadedFile.summary.tags_created);
  } else {
    console.log(chalk.bgRed.whiteBright("\nPsyke! it's a dry run, nothing is changed in Phrase!"));
  }

  if (!skipReport) {
    console.log(chalk.bold("\nGenerating a full report..."));

    if (tags) {
      console.log("Getting all translations with the tags " + chalk.bold(tags));
    }

    var i18nLanguage = await downloadAllTranslationsToI18NLanguage(locales, selectedProject, tags);
    var report = VueI18NExtract.extractI18NReport(parsedVueFiles, i18nLanguage);
    await VueI18NExtract.writeReportToFile(report, outputDir + "/report.json");
  }

  console.log(chalk.green("\nComplete! you can view you language file and report at " + outputDir + "\n"));
}

var program = new Command();
program.version(process.env.npm_package_version || '0.0.0').usage('sync [options]').command('sync', {
  isDefault: true
}).option('-v --vueFiles <vueFiles>', 'A file glob pointing to your Vue.js source files.').option('-a --accessToken <accessToken>', 'Phrase API access token').option('-p --projectID [project]', 'Phrase Project ID, defaults to the first project in your account, projectID can be found on projects page, then hovering over project and choosing ID').option('-t, --tags [tags]', 'A comma separated list of any custom tags you would like to apply to the keys').option('-m --makeTranslation [makeTranslation]', 'If you would like the key path to be the translation in your default locale. Optionally set as a locale code to make translation in a non-default locale').option('-s --skipReport [skipReport]', 'Skip report generation').option('-o --outputDir [outputDir]', 'Directory for report files. Will default to ./phrase-reports').option('-d --dryRun [dryRun]', 'Use if you do not want anything posted to Phrase').action(sync);
program.parse(process.argv);
//# sourceMappingURL=vue-i18n-phrase.modern.js.map
