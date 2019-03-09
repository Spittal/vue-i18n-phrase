import axios, { AxiosError } from 'axios';

export function setupAxios (accessToken: string): void {
  axios.defaults.headers.common.Authorization = `token ${accessToken}`;
  axios.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response.status === 429) {
        throw new Error('Too many requests sent to the PhraseAPI, please wait 5 minutes and try again.');
      }

      throw error;
    },
  );
}
