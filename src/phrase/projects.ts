import axios from 'axios';
import { PhraseProject } from '../types';

export async function getProject (projectID?: string): Promise<PhraseProject> {
  const { data: projects }: { data: PhraseProject[] } =
    await axios.get('https://api.phraseapp.com/api/v2/projects');

  console.log(projects);


  const project = (projectID) ? projects.find((project) => project.id === projectID) : projects[0];

  if (!project) throw new Error('Could not find project from PhraseAPI. If no project was defined as an argument, then there is no project in the selected Phrase Account')

  return project;
}
