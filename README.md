<h1 align="center">vue-i18n-extract-phrase</h1>

<p align="center">Extract all `vue-i18n` keys from your Vue.js projects. Then, add missing keys to your [Phrase](https://phraseapp.com/) account!</p>

## Installation
Install `vue-i18n-extract-phrase` globally
```sh
yarn global add vue-18n-extract-phrase
```

From anywhere you can now run:
```sh
vue-i18n-extract sync --help
```

## Phrase Access Token

To use this tool you will need a Phrase Access Token with read and write permissions. You can follow steps to generate one in your Phrase profile [here](https://phraseapp.com/settings/oauth_access_tokens).

## Sync command

The sync command uses [vue-i18n-extract](https://github.com/pixari/vue-i18n-extract) to get `vue-i18n` keys out of our Vue.js source files. Then it will get all the keys from your a project in your Phrase account and see if there are any keys that are in yor Vue.js source files, but not in your Phrase project. Any keys that are missing are then uploaded to the account!

Example:
```sh
vue-i18n-extract-phrase sync -v [PATH_TO_VUE_FILES] -a [PHRASE_ACCESS_TOKEN]
```

Options:
```
-v, --vueFiles <vueFiles>                A file glob pointing to your Vue.js source files.

-a, --accessToken <accessToken>          Phrase API access token

-t, --tags [tags]                       In addition to the normal default tags, a comma separated list of any custom tags you would like to apply to the keys

-m, --makeTranslation [makeTranslation]  If you would like the key path to be the default translation. If this has no value it will use your default locale in Phrase, however you can set the value of this to a locale code in order to specify a locale in which to make the translation.

-p, --project [project]                  Phrase project, defaults to the first project in your account

-d, --dryRun [dryRun]                    Dry run outputs a file to ./output.json with the report instead of posting missing keys to phrase

-h, --help                              output usage information
```

## :copyright: License

[MIT](http://opensource.org/licenses/MIT)
