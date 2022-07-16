export type ActionEnvironmentSecretEventProps = {
  githubTokenSecret: string;
  environment: string;
  repositoryName: string;
  repositoryOwner?: string;
  actionSecretName: string;
  sourceSecret: string;
  awsRegion: string;
};
