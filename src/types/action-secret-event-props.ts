export type ActionSecretEventProps = {
  githubTokenSecret: string;
  repositoryOwner: string;
  repositoryName: string;
  repositorySecretName: string;
  sourceSecretArn: string;
  awsRegion: string;
};
