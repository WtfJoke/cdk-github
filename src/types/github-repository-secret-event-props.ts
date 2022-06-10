export type GitHubRepositorySecretEventProps = {
  githubTokenSecret: string;
  repositoryOwner: string;
  repositoryName: string;
  sourceSecretArn: string;
  repositorySecretName: string;
  awsRegion: string;
};
