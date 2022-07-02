import { SecretsManager, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { mockClient } from 'aws-sdk-client-mock';

import nock from 'nock';
import { handler } from '../../../src/handler/github-resource/github-resource-handler.lambda';
import { GitHubResourceEventProps, OnEventRequest } from '../../../src/types';

describe('github-resource-handler', () => {

  const smMock = mockClient(SecretsManager);
  const consoleLogSpy = jest.spyOn(console, 'log');
  const githubTokenSecret = 'arn:aws:secretsmanager:eu-central-1:123456789012:secret:github-token-secret';

  const baseEvent: OnEventRequest<GitHubResourceEventProps> = {
    ResourceProperties: {
      createRequestEndpoint: 'POST /repos/octocat/Hello-World/issues',
      createRequestPayload: '{"title": "Test Issue", "body": "This is a test issue"}',
      createRequestResultParameter: 'number',
      deleteRequestEndpoint: 'PATCH /repos/octocat/Hello-World/issues/:number',
      awsRegion: 'eu-central-1',
      githubTokenSecret,
    },
    PhysicalResourceId: 'secret',
    RequestType: 'Create',
    ServiceToken: 'token',
    ResponseURL: '',
    StackId: 'aStackId',
    RequestId: 'aRequestId',
    LogicalResourceId: 'aLogicalResourceId',
    ResourceType: '',
  };

  beforeEach(() => {
    smMock.reset();
  });

  describe('onCreate', () => {

    const event: OnEventRequest<GitHubResourceEventProps> = {
      ...baseEvent,
      RequestType: 'Create',
    };

    const githubIssueCreateResponse = {
      id: 1,
      node_id: 'MDU6SXNzdWUx',
      url: 'https://api.github.com/repos/octocat/Hello-World/issues/1337',
      repository_url: 'https://api.github.com/repos/octocat/Hello-World',
      labels_url: 'https://api.github.com/repos/octocat/Hello-World/issues/1337/labels{/name}',
      comments_url: 'https://api.github.com/repos/octocat/Hello-World/issues/1337/comments',
      events_url: 'https://api.github.com/repos/octocat/Hello-World/issues/1337/events',
      html_url: 'https://github.com/octocat/Hello-World/issues/1337',
      number: 1337,
      state: 'open',
      title: 'Test Issue',
      body: 'This is a test issue',
      // there are more fields but were not interested in a real event here
    };

    it('should create secret', async () => {
      smMock.on(GetSecretValueCommand, {
        SecretId: githubTokenSecret,
      }).resolves({
        SecretString: 'gitHubToken',
      });
      const ghNock = nock('https://api.github.com')
        .post('/repos/octocat/Hello-World/issues', JSON.parse(event.ResourceProperties.createRequestPayload!))
        .reply(201, githubIssueCreateResponse);

      expect(await handler(event)).toStrictEqual({ PhysicalResourceId: '1337' });

      ghNock.done();
      expect(consoleLogSpy).toHaveBeenCalledWith("Making a request to 'POST /repos/octocat/Hello-World/issues'.");
      expect(consoleLogSpy).toHaveBeenCalledWith('Created GitHub Resource');
    });
  },
  );
});
