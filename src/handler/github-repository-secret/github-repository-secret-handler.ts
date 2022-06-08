

import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Octokit } from '@octokit/rest';
import type { OnEventRequest } from '../../types/on-event-request';

import { encryptValue } from './github-secret-encryptor';

const onEvent = async (event: OnEventRequest) => {
  console.log(`Event: ${JSON.stringify(event)}`);
  const smClient = new SecretsManagerClient({});
  const githubTokenSecret = await smClient.send(new GetSecretValueCommand({ SecretId: event.ResourceProperties.githubTokenSecret }));
  const octokit = new Octokit({ auth: githubTokenSecret.SecretString });

  const requestType = event.RequestType;
  switch (requestType) {
    case 'Create':
      return onCreate(event, octokit, smClient);
    case 'Update':
      return onUpdate(event, octokit, smClient);
    case 'Delete':
      return onDelete(event, octokit);
    default:
      throw new Error(`unexpected request type ${requestType}`);
  }
};

const onCreate = async (event: OnEventRequest, octokit: Octokit, smClient: SecretsManagerClient) => {
  const props = event.ResourceProperties;
  const physicalId = event.PhysicalResourceId;
  console.log('create new resource with props ' + JSON.stringify(props));

  await createOrUpdateRepoSecret(event, octokit, smClient);
  return { PhysicalResourceId: physicalId };
};

const onUpdate = async (event: OnEventRequest, octokit: Octokit, smClient: SecretsManagerClient) => {
  const props = event.ResourceProperties;
  const physicalId = event.PhysicalResourceId;
  console.log(`update resource ${physicalId} with props ${JSON.stringify(props)}`);
  await createOrUpdateRepoSecret(event, octokit, smClient);
  return { PhysicalResourceId: physicalId };

};

const onDelete = async (event: OnEventRequest, octokit: Octokit) => {
  const physicalId = event.PhysicalResourceId;
  console.log('delete resource ' + physicalId);
  await deleteRepoSecret(event, octokit);
  return { PhysicalResourceId: physicalId };
};


const createOrUpdateRepoSecret = async (event: OnEventRequest, octokit: Octokit, smClient: SecretsManagerClient) => {
  const { repositoryOwner: owner, repositoryName: repo, repositorySecretName } = event.ResourceProperties;

  const { data } = await octokit.rest.actions.getRepoPublicKey({ owner, repo });
  const secretId = event.ResourceProperties.sourceSecretArn;

  const secretToEncrypt = await smClient.send(new GetSecretValueCommand({ SecretId: secretId }));
  console.log(`Encrypt value of secret with id: ${secretId}`);

  const secretString = secretToEncrypt.SecretString;
  if (!secretString) {
    throw new Error('SecretString is empty from secret with id: ' + secretId);
  }

  const encryptedSecret = await encryptValue(secretString, data.key);
  console.log('Encrypted secret, attempting to create/update github secret');

  const secretResponse = await octokit.rest.actions.createOrUpdateRepoSecret({
    owner,
    repo,
    secret_name: repositorySecretName,
    encrypted_value: encryptedSecret,
    key_id: data.key_id,
  });
  console.log(JSON.stringify(secretResponse));
  return secretResponse;
};

const deleteRepoSecret = async (event: OnEventRequest, octokit: Octokit) => {
  const { repositoryOwner: owner, repositoryName: repo, repositorySecretName } = event.ResourceProperties;
  const secretResponse = await octokit.rest.actions.deleteRepoSecret({
    owner,
    repo,
    secret_name: repositorySecretName,
  });
  console.log(`Delete: ${JSON.stringify(secretResponse)}`);
  return secretResponse;
};

export const handler = onEvent;