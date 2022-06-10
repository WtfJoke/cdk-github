export type ActionSecretEventProps = {
  githubTokenSecret: string;
  repositoryOwner: string;
  repositoryName: string;
  sourceSecretArn: string;
  repositorySecretName: string;
  awsRegion: string;
};
