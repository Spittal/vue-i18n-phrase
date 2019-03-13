<h1 align="center">vue-i18n-phrase</h1>

Extract all `vue-i18n` keys from your Vue.js projects. Then, tag and add keys to your [Phrase](https://phraseapp.com/) account!

## Installation
Install `vue-i18n-phrase` globally
```sh
yarn global add vue-i18n-phrase
```

From anywhere you can now run:
```sh
vue-i18n-phrase sync --help
```

## Phrase Access Token

To use this tool you will need a Phrase Access Token with read and write permissions. You can follow steps to generate one in your Phrase profile [here](https://phraseapp.com/settings/oauth_access_tokens).

## Sync command

The sync command uses [vue-i18n-extract](https://github.com/pixari/vue-i18n-extract) to get `vue-i18n` keys out of our Vue.js source files. Then it will get all the keys from your a project in your Phrase account and see if there are any keys that are in yor Vue.js source files, but not in your Phrase project. Any keys that are missing are then uploaded to the account!

Example:
```sh
vue-i18n-phrase sync -v [PATH_TO_VUE_FILES] -a [PHRASE_ACCESS_TOKEN]

// or

vue-i18n-phrase sync -v "./src/**/*.?(js|vue)" -a 1234567890
```

Options:
```
-v --vueFiles <vueFiles>                A file glob pointing to your Vue.js source files.

-a --accessToken <accessToken>          Phrase API access token

-p --project [project]                  Phrase project, defaults to the first project in your account

-t, --tags [tags]                       A comma separated list of any custom tags you would like to apply to the keys

-m --makeTranslation [makeTranslation]  If you would like the key path to be the translation in your default locale. Optionally set as a locale code to make translation in a non-default locale

-s --skipReport [skipReport]            Skip report generation

-o --outputDir [outputDir]              Directory for report files. Will default to ./phrase-reports

-d --dryRun [dryRun]                    Use if you do not want anything posted to Phrase

-h, --help                              output usage information
```

## End To End I18N Solution
The goal of this project is to facilitate a full end to end solution for managing and fetching translations when using `vue-i18n` and Phrase. The ideal workflow is...

### 1. Write a Vue.js app using `vue-i18n` for translations.
Adding i18n support to your Vue.js apps is easy using the very stable and mature [vue-i18n plugin](https://github.com/kazupon/vue-i18n).

### 2. On a push to version control, run a CI pipeline that extracts all `vue-i18n` keys and then uploads them to a specified project in a specified Phrase account.
This is solved by the `vue-i18n-phrase` cli tool, which is the main code in this git repository. But the desire is to make this run as part of a continuous integration pipeline, which is why there is a [Dockerfile](./Dockerfile) included in this repository. The Dockerfile is built and pushed to [Dockerhub](https://cloud.docker.com/repository/docker/spittal/vue-i18n-phrase/general) which makes it easy to use in most CI tools like Circle, Jenkins, and GitlabCI.

### 3. In the Vue.js app, request the translation keys for user's locale from a HTTP endpoint.
Phrase offers a great [HTTP REST API](https://developers.phraseapp.com/api/) for it's services. But it's not _exactly_ what is needed to fit the use case. So, included in this repository is a [Firebase Function](https://firebase.google.com/docs/functions/) that abstracts the PhraseAPI and allows a GET request to be made with a locale code, and a list of tags to be added as query parameters to get a filtered list of translations. The data from the endpoint can be used by the [lazy loading features of vue-i18n](https://kazupon.github.io/vue-i18n/guide/lazy-loading.html) to asynchronously load the app translations.

*[Read how to deploy this cloud function here.](./firebase)*

## :copyright: License

[MIT](http://opensource.org/licenses/MIT)
