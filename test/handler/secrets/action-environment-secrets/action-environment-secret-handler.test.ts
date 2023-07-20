import { SecretsManager, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { mockClient } from 'aws-sdk-client-mock';

import nock from 'nock';
import { handler } from '../../../../src/handler/secrets/action-environment-secrets';
import { ActionEnvironmentSecretEventProps, OnEventRequest } from '../../../../src/types';

describe('action-environment-secret-handler', () => {

  const smMock = mockClient(SecretsManager);
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  const githubTokenSecret = 'arn:aws:secretsmanager:eu-central-1:123456789012:secret:github-token-secret';
  const sourceSecretArn = 'arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id';

  const baseEvent: OnEventRequest<ActionEnvironmentSecretEventProps> = {
    ResourceProperties: {
      environment: 'dev',
      repositoryOwner: 'WtfJoke',
      repositoryName: 'cdk-github',
      repositorySecretName: 'secret',
      sourceSecretArn,
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

    const event: OnEventRequest<ActionEnvironmentSecretEventProps> = {
      ...baseEvent,
      RequestType: 'Create',
    };

    it('should create secret', async () => {
      smMock.on(GetSecretValueCommand, {
        SecretId: githubTokenSecret,
      }).resolves({
        SecretString: 'gitHubToken',
      });
      smMock.on(GetSecretValueCommand, {
        SecretId: sourceSecretArn,
      }).resolves({
        SecretString: 'mySecretToStore',
      });
      const ghNock = nock('https://api.github.com')
        .get('/repos/WtfJoke/cdk-github')
        .reply(200, { id: '1337' })
        .get('/repositories/1337/environments/dev/secrets/public-key')
        .reply(200, {
          key_id: '568250167242549743',
          key: 'v0dSAu/BswbG2uUYeKnO0aX//Ibts7ItmFRvy6tfP2s=',
        })
        .put('/repositories/1337/environments/dev/secrets/secret')
        .reply(201);

      expect(await handler(event)).toStrictEqual({ PhysicalResourceId: 'dev/secret/WtfJoke/cdk-github' });

      expect(ghNock.isDone()).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('Encrypted secret, attempting to create/update github secret');
      expect(consoleLogSpy).toHaveBeenCalledWith('Encrypt value of secret with id: arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id');
    });

    it('without owner should create secret with token owner', async () => {
      const eventWithoutOwner: OnEventRequest<ActionEnvironmentSecretEventProps> = {
        ...event,
        ResourceProperties: {
          ...event.ResourceProperties,
          repositoryOwner: undefined,
        },
      };
      smMock.on(GetSecretValueCommand, {
        SecretId: githubTokenSecret,
      }).resolves({
        SecretString: 'gitHubToken',
      });
      smMock.on(GetSecretValueCommand, {
        SecretId: sourceSecretArn,
      }).resolves({
        SecretString: 'mySecretToStore',
      });
      const ghNock = nock('https://api.github.com')
        .get('/user')
        .reply(200, { login: 'WtfJoke' })
        .get('/repos/WtfJoke/cdk-github')
        .reply(200, { id: '1337' })
        .get('/repositories/1337/environments/dev/secrets/public-key')
        .reply(200, {
          key_id: '568250167242549743',
          key: 'v0dSAu/BswbG2uUYeKnO0aX//Ibts7ItmFRvy6tfP2s=',
        })
        .put('/repositories/1337/environments/dev/secrets/secret')
        .reply(201);

      expect(await handler(eventWithoutOwner)).toStrictEqual({ PhysicalResourceId: 'dev/secret/WtfJoke/cdk-github' });

      expect(ghNock.isDone()).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('Encrypted secret, attempting to create/update github secret');
      expect(consoleLogSpy).toHaveBeenCalledWith('Encrypt value of secret with id: arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id');
    });


    it('with invalid secret - should throw error', async () => {
      smMock.on(GetSecretValueCommand, {
        SecretId: githubTokenSecret,
      }).resolves({
        SecretString: 'gitHubToken',
      });
      smMock.on(GetSecretValueCommand, {
        SecretId: sourceSecretArn,
      }).resolves({
        SecretString: '',
      });


      await expect(handler(event)).rejects.toThrowError('SecretString is empty from secret with id: arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id');
    });

    it('with invalid github token - should throw error', async () => {
      smMock.on(GetSecretValueCommand, {
        SecretId: githubTokenSecret,
      }).resolves({
        SecretString: 'invalidToken',
      });
      smMock.on(GetSecretValueCommand, {
        SecretId: sourceSecretArn,
      }).resolves({
        SecretString: 'mySecretToStore',
      });
      nock('https://api.github.com')
        .get('/repos/WtfJoke/cdk-github').reply(403, {
          message: 'Must have admin rights to Repository.',
          documentation_url: 'https://docs.github.com/rest/reference/actions#get-a-repository-public-key',
        });


      await expect(handler(event)).rejects.toThrowError('Must have admin rights to Repository.');
    });
  });

  describe('onUpdate', () => {

    const event: OnEventRequest<ActionEnvironmentSecretEventProps> = {
      ...baseEvent,
      RequestType: 'Update',
    };

    it('should update secret', async () => {
      smMock.on(GetSecretValueCommand, {
        SecretId: githubTokenSecret,
      }).resolves({
        SecretString: 'gitHubToken',
      });
      smMock.on(GetSecretValueCommand, {
        SecretId: sourceSecretArn,
      }).resolves({
        SecretString: 'mySecretToStore',
      });
      const ghNock = nock('https://api.github.com')
        .get('/repos/WtfJoke/cdk-github')
        .reply(200, { id: '1337' })
        .get('/repositories/1337/environments/dev/secrets/public-key')
        .reply(200, {
          key_id: '568250167242549743',
          key: 'v0dSAu/BswbG2uUYeKnO0aX//Ibts7ItmFRvy6tfP2s=',
        })
        .put('/repositories/1337/environments/dev/secrets/secret')
        .reply(201);


      expect(await handler(event)).toStrictEqual({ PhysicalResourceId: 'dev/secret/WtfJoke/cdk-github' });

      expect(ghNock.isDone()).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('Encrypted secret, attempting to create/update github secret');
      expect(consoleLogSpy).toHaveBeenCalledWith('Encrypt value of secret with id: arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id');
    });

    it('with invalid secret - should throw error', async () => {
      smMock.on(GetSecretValueCommand, {
        SecretId: githubTokenSecret,
      }).resolves({
        SecretString: 'gitHubToken',
      });
      smMock.on(GetSecretValueCommand, {
        SecretId: sourceSecretArn,
      }).resolves({
        SecretString: '',
      });


      await expect(handler(event)).rejects.toThrowError('SecretString is empty from secret with id: arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id');
    });

    it('with invalid github token - should throw error', async () => {
      smMock.on(GetSecretValueCommand, {
        SecretId: githubTokenSecret,
      }).resolves({
        SecretString: 'invalidToken',
      });
      smMock.on(GetSecretValueCommand, {
        SecretId: sourceSecretArn,
      }).resolves({
        SecretString: 'mySecretToStore',
      });
      nock('https://api.github.com')
        .get('/repos/WtfJoke/cdk-github').reply(403, {
          message: 'Must have admin rights to Repository.',
          documentation_url: 'https://docs.github.com/rest/reference/actions#get-a-repository-public-key',
        });

      await expect(handler(event)).rejects.toThrowError('Must have admin rights to Repository.');
    });
  });

  describe('onDelete', () => {

    const event: OnEventRequest<ActionEnvironmentSecretEventProps> = {
      ...baseEvent,
      RequestType: 'Delete',
    };

    it('should delete secret', async () => {
      smMock.on(GetSecretValueCommand, {
        SecretId: githubTokenSecret,
      }).resolves({
        SecretString: 'gitHubToken',
      });
      smMock.on(GetSecretValueCommand, {
        SecretId: sourceSecretArn,
      }).resolves({
        SecretString: 'mySecretToStore',
      });
      const ghNock = nock('https://api.github.com')
        .get('/repos/WtfJoke/cdk-github')
        .reply(200, { id: '1337' })
        .delete('/repositories/1337/environments/dev/secrets/secret')
        .reply(204);

      expect(await handler(event)).toStrictEqual({ PhysicalResourceId: 'dev/secret/WtfJoke/cdk-github' });

      expect(ghNock.isDone()).toBe(true);
      expect(consoleLogSpy).toHaveBeenCalledWith('Delete ActionEnvironmentSecret secret');
    });
  });

  it('with invalid RequestType - should throw error', async () => {
    smMock.on(GetSecretValueCommand, {
      SecretId: githubTokenSecret,
    }).resolves({
      SecretString: 'gitHubToken',
    });
    // @ts-ignore
    await expect(handler({ ...baseEvent, RequestType: 'Invalid' })).rejects.toThrowError("Unexpected request type: 'Invalid'");
  });

},
);
