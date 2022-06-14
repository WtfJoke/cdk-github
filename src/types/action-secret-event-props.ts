export type ActionSecretEventProps = {
  githubTokenSecret: string;
  repositoryName: string;
  repositorySecretName: string;
  repositoryOwner?: string;
  sourceSecretArn: string;
  awsRegion: string;
};
