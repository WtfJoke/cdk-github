export type ActionEnvironmentSecretEventProps = {
  githubTokenSecret: string;
  environment: string;
  repositoryOwner: string;
  repositoryName: string;
  sourceSecretArn: string;
  repositorySecretName: string;
  awsRegion: string;
};
