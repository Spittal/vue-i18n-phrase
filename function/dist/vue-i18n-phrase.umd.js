(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('express'), require('axios'), require('cors'), require('form-data'), require('fs')) :
  typeof define === 'function' && define.amd ? define(['express', 'axios', 'cors', 'form-data', 'fs'], factory) :
  (global = global || self, factory(global.express, global.axios, global.cors, global.FormData, global.fs));
}(this, (function (express, axios, cors, FormData, fs) {
  express = express && Object.prototype.hasOwnProperty.call(express, 'default') ? express['default'] : express;
  axios = axios && Object.prototype.hasOwnProperty.call(axios, 'default') ? axios['default'] : axios;
  cors = cors && Object.prototype.hasOwnProperty.call(cors, 'default') ? cors['default'] : cors;
  FormData = FormData && Object.prototype.hasOwnProperty.call(FormData, 'default') ? FormData['default'] : FormData;
  fs = fs && Object.prototype.hasOwnProperty.call(fs, 'default') ? fs['default'] : fs;

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
    } else {
      locale = locales.find(locale => locale.default);
    }

    if (!locale) throw new Error('Locale not found, is the argument makeTranslation set correctly?');
    return locale;
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

  var corsHandler = cors({
    origin: '*'
  });
  var app = express();
  app.use(corsHandler);
  app.get('/getLocaleFromPhrase', async (req, res) => {
    if (process.env.PHRASE_ACCESS_TOKEN) {
      setupAxios(process.env.PHRASE_ACCESS_TOKEN);
    } else {
      var error = new Error('No PHRASE_ACCESS_TOKEN environment variable defined.');
      res.status(500).send(JSON.stringify({
        error: error.toString()
      }));
      throw error;
    }

    var selectedProject = await getProject(process.env.PHRASE_PROJECT_ID);
    var locale = await getLocale(selectedProject, req.query.locale);

    try {
      var {
        data
      } = await axios.get("https://api.phraseapp.com/api/v2/projects/" + selectedProject.id + "/locales/" + locale.id + "/download", {
        params: {
          file_format: 'simple_json',
          tags: req.query.tags
        }
      });
      res.set('Content-Type', 'application/json').set('Cache-Control', 'max-age=3600').send(JSON.stringify(data));
    } catch (e) {
      res.status(e.response.status || 500).send(JSON.stringify(e.response.data));
      throw e;
    }
  });
  app.listen(process.env.PORT || 8080, () => console.log('Phrase Locale Server Started'));

})));
//# sourceMappingURL=vue-i18n-phrase.umd.js.map
