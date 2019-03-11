import axios from 'axios';
import { PhraseProject } from './models';

export async function getProject (projectName?: string): Promise<PhraseProject> {
  const { data: projects }: { data: PhraseProject[] } =
    await axios.get('https://api.phraseapp.com/api/v2/projects');

  return (projectName) ? projects.find((project) => project.name === projectName) : projects[0];
}
