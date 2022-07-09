export type ActionSecretEventProps = {
  githubTokenSecret: string;
  repositoryName: string;
  repositorySecretName: string;
  repositoryOwner?: string;
  sourceSecretArn: string;
  sourceSecretJsonField?: string;
  awsRegion: string;
  newSourceSecret: string;
};
