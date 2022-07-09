export type ActionEnvironmentSecretEventProps = {
  githubTokenSecret: string;
  environment: string;
  repositoryName: string;
  repositorySecretName: string;
  repositoryOwner?: string;
  sourceSecretArn: string;
  sourceSecretJsonField?: string;
  awsRegion: string;
};
