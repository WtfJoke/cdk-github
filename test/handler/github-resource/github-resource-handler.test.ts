import { SecretsManager, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { mockClient } from 'aws-sdk-client-mock';

import nock from 'nock';
import { handler } from '../../../src/handler/github-resource/github-resource-handler.lambda';
import { GitHubResourceEventProps, OnEventRequest } from '../../../src/types';

describe('github-resource-handler', () => {

  const smMock = mockClient(SecretsManager);
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  const githubTokenSecret = 'arn:aws:secretsmanager:eu-central-1:123456789012:secret:github-token-secret';
  const githubIssueResponse = {
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
    assignee: {
      login: 'octocat',
      id: 1,
    },
    // there are more fields but were not interested in a real event here
  };

  beforeEach(() => {
    smMock.reset();
  });


  describe('with create/deleteendpoint and result parameter extraction', () => {
    const baseEvent: OnEventRequest<GitHubResourceEventProps> = {
      ResourceProperties: {
        createRequestEndpoint: 'POST /repos/octocat/Hello-World/issues',
        createRequestPayload: '{"title": "Test Issue", "body": "This is a test issue"}',
        createRequestResultParameter: 'number',
        deleteRequestEndpoint: 'PATCH /repos/octocat/Hello-World/issues/:number',
        deleteRequestPayload: '{"state": "closed"}',
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


    describe('onCreate', () => {
      const event: OnEventRequest<GitHubResourceEventProps> = {
        ...baseEvent,
        RequestType: 'Create',
      };


      it('should create secret', async () => {
        mockValidGithubToken();
        const ghNock = nock('https://api.github.com')
          .post('/repos/octocat/Hello-World/issues', JSON.parse(event.ResourceProperties.createRequestPayload!))
          .reply(201, githubIssueResponse);

        expect(await handler(event)).toStrictEqual({ PhysicalResourceId: '1337' });

        ghNock.done();
        expect(consoleLogSpy).toHaveBeenCalledWith("Making a request to 'POST /repos/octocat/Hello-World/issues'.");
        expect(consoleLogSpy).toHaveBeenCalledWith('Created GitHub Resource');
      });
    });


    describe('onUpdate', () => {

      const event: OnEventRequest<GitHubResourceEventProps> = {
        ...baseEvent,
        RequestType: 'Update',
        PhysicalResourceId: '1337',
      };

      it('it should do nothing and log that', async () => {
        mockValidGithubToken();
        expect(await handler(event)).toStrictEqual({ PhysicalResourceId: '1337' });

        expect(consoleLogSpy).toHaveBeenCalledWith("No update request endpoint specified, so we'll just ignore the update request.");
      });
    });


    describe('onDelete', () => {

      const event: OnEventRequest<GitHubResourceEventProps> = {
        ...baseEvent,
        RequestType: 'Delete',
        PhysicalResourceId: '1337',
      };

      it('should delete the resource', async () => {
        mockValidGithubToken();
        const ghNock = nock('https://api.github.com')
          .patch('/repos/octocat/Hello-World/issues/1337', JSON.parse(event.ResourceProperties.deleteRequestPayload!))
          .reply(200, { ...githubIssueResponse, state: 'closed' });

        expect(await handler(event)).toStrictEqual({ PhysicalResourceId: '1337' });

        ghNock.done();
        expect(consoleLogSpy).toHaveBeenCalledWith("Making a request to 'PATCH /repos/octocat/Hello-World/issues/1337'.");
        expect(consoleLogSpy).toHaveBeenCalledWith("Deleted GitHub Resource with id '1337'");
      });

    });
  });


  describe('with create/deleteendpoint and no result parameter extraction', () => {
    const baseEvent: OnEventRequest<GitHubResourceEventProps> = {
      ResourceProperties: {
        createRequestEndpoint: 'POST /repos/octocat/Hello-World/issues/1337/assignees',
        createRequestPayload: '{"assignees":["hubot"]}',
        deleteRequestEndpoint: 'DELETE /repos/octocat/Hello-World/issues/1337/assignees',
        deleteRequestPayload: '{"assignees":["hubot"]}',
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

    describe('onCreate', () => {
      const event: OnEventRequest<GitHubResourceEventProps> = {
        ...baseEvent,
        RequestType: 'Create',
      };


      it('should create secret', async () => {
        mockValidGithubToken();
        const ghNock = nock('https://api.github.com')
          .post('/repos/octocat/Hello-World/issues/1337/assignees', JSON.parse(event.ResourceProperties.createRequestPayload!))
          .reply(200, { ...githubIssueResponse, assignees: ['hubot'] });

        expect(await handler(event)).toStrictEqual({ PhysicalResourceId: undefined });

        ghNock.done();
        expect(consoleLogSpy).toHaveBeenCalledWith("Making a request to 'POST /repos/octocat/Hello-World/issues/1337/assignees'.");
        expect(consoleLogSpy).toHaveBeenCalledWith('Created GitHub Resource');
      });
    });

    describe('onUpdate', () => {

      const event: OnEventRequest<GitHubResourceEventProps> = {
        ...baseEvent,
        RequestType: 'Update',
        PhysicalResourceId: 'GithubAssigneeA3421FDIDK', // simulate that this id is generated by aws
      };

      it('it should do nothing and log that', async () => {
        mockValidGithubToken();
        expect(await handler(event)).toStrictEqual({ PhysicalResourceId: 'GithubAssigneeA3421FDIDK' });

        expect(consoleLogSpy).toHaveBeenCalledWith("No update request endpoint specified, so we'll just ignore the update request.");
      });
    });

    describe('onDelete', () => {

      const event: OnEventRequest<GitHubResourceEventProps> = {
        ...baseEvent,
        RequestType: 'Delete',
        PhysicalResourceId: 'GithubAssigneeA3421FDIDK', // simulate that this id is generated by aws
      };

      it('should delete the resource', async () => {
        mockValidGithubToken();
        const ghNock = nock('https://api.github.com')
          .delete('/repos/octocat/Hello-World/issues/1337/assignees', JSON.parse(event.ResourceProperties.deleteRequestPayload!))
          .reply(200, { ...githubIssueResponse, assignees: ['hubot'] });

        expect(await handler(event)).toStrictEqual({ PhysicalResourceId: 'GithubAssigneeA3421FDIDK' });

        ghNock.done();
        expect(consoleLogSpy).toHaveBeenCalledWith("Making a request to 'DELETE /repos/octocat/Hello-World/issues/1337/assignees'.");
        expect(consoleLogSpy).toHaveBeenCalledWith("Deleted GitHub Resource with id 'GithubAssigneeA3421FDIDK'");
      });

    });

  });

  const mockValidGithubToken = () => {
    smMock.on(GetSecretValueCommand, {
      SecretId: githubTokenSecret,
    }).resolves({
      SecretString: 'gitHubToken',
    });
  };
});
