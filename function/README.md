# `vue-i18n-phrase` Serverless Function

This function works best when running with Google Cloud's CloudRun feature, but can be run anywhere that you can run a Docker container. The Docker container hosts a NodeJS server on port 8080.

## Environment Variables

### `PHRASE_ACCESS_TOKEN`
If you don't already have one, [create a Phrase Access Token with read access](https://phraseapp.com/settings/oauth_access_tokens).

### `PHRASE_PROJECT_ID`
The phrase project id can be found in your Phrase Dashboard -> Project Settings -> ID.

If you don't set this the app will default to using the first project in your account.

## Query Parameters of the function

Once deployed, you can use the function with these query parameters

```
locale: Your desired locale code
tags: a comma separated list of of tags to filter the translations

Example:
https://example.com/getLocaleFromPhrase?locale=en-US&tags=my-cool-tag-1,my-cool-tag-2
```

## Caching and PhraseAPI Rate Limiting

The PhraseAPI has a 500 requests per 5 minute rate limit, which in a production app would quickly be hit, meaning you wont get your translations. You can get around this by using a CDN with caching. Using a service like [Cloudflare](https://www.cloudflare.com/) to create a CDN in front of your function. By default the function sets a 2 hour max-age cache on translations.

While setting up a CDN isn't strictly necessary, it's highly recommended.

## Setting up your vue-i18n

Using this function you can now [lazy-load](https://kazupon.github.io/vue-i18n/guide/lazy-loading.html) only the translations you need instead of loading every locale, and every translation. This requires a small amount of setup. Here's an example set up.

```js
// localization.js

import VueI18n from 'vue-i18n';
import Vue from 'vue';

// Load locale will use the Fetch API to grab the translations you need, then set them in i18n
export const loadLocale = async (i18n, locale, tags = '') => {
  const data = await fetch(`https://MY_FUNCTION_URL/getLocaleFromPhrase?locale=${locale}&tags=${tags}`).then(res => res.json());

  if (data) i18n.setLocaleMessage(locale, data);

  i18n.locale = locale;

  if (document && document.querySelector('html')) {
    document.querySelector('html').setAttribute('lang', locale);
  }
};

export default (locale, tags) => {
  Vue.use(VueI18n);

  const i18n = new VueI18n({
    locale,
    fallbackLocale: 'en-US',

    // If you want default translations to be packaged with the app you can import them at the top of the file like `import messages from '@/lang/en'`, If you do that, make the next line just `messages`
    messages: {},

    // If you are packaging up default translations in your app, you probably don't want the next two properties.
    // The next two properties are used if your key is also your default translation. Just makes vue-i18n fallback on key correctly if your using variables in your translations.
    silentTranslationWarn: true,
    missing (locale, msg) {
      i18n.setLocaleMessage(locale, {
        ...i18n.messages[locale],
        [msg]: msg
      });
    }
  });

  // Get the locale you actually want!
  // If you're packaging a default locale with your app, you should write a check here to make sure that you don't load the default locale twice.
  loadLocale(i18n, locale, tags);

  return i18n;
};
```

Then when creating the Vue.js application

```js
// main.js

import Vue from 'vue';
import App from './App';
import localize from './localization';

const i18n = localize('en-US', 'cool-tag-1,cool-tag-2');

new Vue({ i18n }).$mount('#app');
```

