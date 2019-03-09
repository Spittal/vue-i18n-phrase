export interface SyncCommandOptions {
  vueFiles: string;
  accessToken: string;
  project?: string;
  tags?: string;
  makeTranslation?: string | boolean;
  dryRun?: boolean;
}

export interface PhraseProject {
  id: string;
  name: string;
  main_format: string;
  project_image_url: string;
  created_at: string;
  updated_at: string;
  account: {
    id: string;
    name: string;
    company: string;
    created_at: string;
    updated_at: string;
  };
}

export interface PhraseLocale {
  id: string;
  name: string;
  code: string;
  default: boolean;
  main: boolean;
  rtl: boolean;
  plural_forms: string[];
  source_locale: {
    id: string;
    name: string;
    code: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PhraseKey {
  id: string;
  name: string;
  description: string;
  name_hash: string;
  plural: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
}
