import axios from 'axios';
import { PhraseProject } from '../types';

export async function getProject (projectName?: string): Promise<PhraseProject> {
  const { data: projects }: { data: PhraseProject[] } =
    await axios.get('https://api.phraseapp.com/api/v2/projects');

  const project = (projectName) ? projects.find((project) => project.name === projectName) : projects[0];

  if (!project) throw new Error('Could not find project from PhraseAPI. If no project was defined as an argument, then there is no project in the selected Phrase Account')

  return project;
}
