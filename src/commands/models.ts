export interface SyncCommandOptions {
  vueFiles: string;
  accessToken: string;
  project?: string;
  tags?: string;
  makeTranslation?: string | boolean;
  skipReport?: boolean;
  outputDir?: string;
  dryRun?: boolean;
}
