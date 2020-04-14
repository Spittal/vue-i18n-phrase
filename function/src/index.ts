import express from 'express';
import axios from 'axios';
import cors from 'cors';
import { getLocale, getProject, setupAxios } from '../../src';
const corsHandler = cors({ origin: '*' });

const app = express();
app.use(corsHandler);

app.get('/getLocaleFromPhrase', async (req, res) => {
  if (process.env.PHRASE_ACCESS_TOKEN) {
    setupAxios(process.env.PHRASE_ACCESS_TOKEN);
  } else {
    const error = new Error('No PHRASE_ACCESS_TOKEN environment variable defined.');
    res
      .status(500)
      .send(JSON.stringify({ error: error.toString() }));
    throw error;
  }

  const selectedProject = await getProject(process.env.PHRASE_PROJECT_ID);
  const locale = await getLocale(selectedProject, req.query.locale);

  try {
    const { data } = await axios.get(`https://api.phraseapp.com/api/v2/projects/${selectedProject.id}/locales/${locale.id}/download`, {
      params: {
        file_format: 'simple_json', // eslint-disable-line @typescript-eslint/camelcase
        tags: req.query.tags
      }
    });

    res
      .set('Content-Type', 'application/json')
      .set('Cache-Control', 'max-age=3600')
      .send(JSON.stringify(data));
  } catch (e) {
    res
      .status(e.response.status || 500)
      .send(JSON.stringify(e.response.data));
    throw e;
  }
});

app.listen(process.env.PORT || 8080, () => console.log('Phrase Locale Server Started'));
