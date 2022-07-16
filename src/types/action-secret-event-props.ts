export type ActionSecretEventProps = {
  githubTokenSecret: string;
  repositoryName: string;
  repositoryOwner?: string;
  actionSecretName: string;
  sourceSecret: string;
  awsRegion: string;
};
