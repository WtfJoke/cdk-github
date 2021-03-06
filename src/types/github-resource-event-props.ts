export type GitHubResourceEventProps = {
  githubTokenSecret: string;
  createRequestEndpoint: string;
  createRequestPayload?: string;
  createRequestResultParameter?: string;
  updateRequestEndpoint?: string;
  updateRequestPayload?: string;
  deleteRequestEndpoint: string;
  deleteRequestPayload?: string;
  responseBodySSMParameterName?: string;
  awsRegion: string;
};
