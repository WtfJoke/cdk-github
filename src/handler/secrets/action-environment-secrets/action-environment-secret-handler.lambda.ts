import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Octokit } from '@octokit/core';
import type { OnEventRequest, ActionEnvironmentSecretEventProps } from '../../../types';

import { encryptValue } from '../github-secret-encryptor';
import { validateSecretName } from '../github-secret-name-validator';

const onEvent = async (event: OnEventRequest<ActionEnvironmentSecretEventProps>) => {
  console.log(`Event: ${JSON.stringify(event)}`);
  validateSecretName(event.ResourceProperties.repositorySecretName);
  const smClient = new SecretsManagerClient({ region: event.ResourceProperties.awsRegion });
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
      throw new Error(`Unexpected request type: '${requestType}'`);
  }
};

const onCreate = async (
  event: OnEventRequest<ActionEnvironmentSecretEventProps>,
  octokit: Octokit,
  smClient: SecretsManagerClient,
) => {
  const props = event.ResourceProperties;
  const secretName = props.repositorySecretName;
  console.log('Create new ActionEnvironmentSecret with props ' + JSON.stringify(props));

  await createOrUpdateEnvironmentSecret(event, octokit, smClient);
  return { PhysicalResourceId: secretName };
};

const onUpdate = async (
  event: OnEventRequest<ActionEnvironmentSecretEventProps>,
  octokit: Octokit,
  smClient: SecretsManagerClient,
) => {
  const props = event.ResourceProperties;
  const secretName = props.repositorySecretName;
  console.log(`Update ActionEnvironmentSecret ${secretName} with props ${JSON.stringify(props)}`);

  await createOrUpdateEnvironmentSecret(event, octokit, smClient);
  return { PhysicalResourceId: secretName };
};

const onDelete = async (
  event: OnEventRequest<ActionEnvironmentSecretEventProps>,
  octokit: Octokit,
) => {
  const secretName = event.ResourceProperties.repositorySecretName;
  console.log('Delete ActionEnvironmentSecret ' + secretName);
  await deleteEnvironmentSecret(event, octokit);
  return { PhysicalResourceId: secretName };
};

const createOrUpdateEnvironmentSecret = async (
  event: OnEventRequest<ActionEnvironmentSecretEventProps>,
  octokit: Octokit,
  smClient: SecretsManagerClient,
) => {
  const {
    repositoryOwner: owner,
    repositoryName: repo,
    repositorySecretName: secret_name,
    environment: environment_name,
    sourceSecretArn: secretId,
  } = event.ResourceProperties;

  const secretToEncrypt = await smClient.send(new GetSecretValueCommand({ SecretId: secretId }));
  console.log(`Encrypt value of secret with id: ${secretId}`);

  const secretString = secretToEncrypt.SecretString;
  if (!secretString) {
    throw new Error('SecretString is empty from secret with id: ' + secretId);
  }

  const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/secrets/public-key', { owner, repo });

  const encryptedSecret = await encryptValue(secretString, data.key);
  console.log('Encrypted secret, attempting to create/update github secret');

  const repository_id = await getRepositoryId(event, octokit);
  const secretResponse = await octokit.request('PUT /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}', {
    repository_id,
    environment_name,
    secret_name,
    encrypted_value: encryptedSecret,
    key_id: data.key_id,
  });

  console.log(JSON.stringify(secretResponse));
  return secretResponse;
};

const deleteEnvironmentSecret = async (
  event: OnEventRequest<ActionEnvironmentSecretEventProps>,
  octokit: Octokit,
) => {
  const { environment: environment_name, repositorySecretName: secret_name } = event.ResourceProperties;
  const repository_id = await getRepositoryId(event, octokit);
  const deleteSecretResponse = await octokit.request('DELETE /repositories/{repository_id}/environments/{environment_name}/secrets/{secret_name}', {
    repository_id,
    environment_name,
    secret_name,
  });
  console.log(`Delete: ${JSON.stringify(deleteSecretResponse)}`);
  return deleteSecretResponse;
};

const getRepositoryId = async (
  event: OnEventRequest<ActionEnvironmentSecretEventProps>,
  octokit: Octokit,
) => {
  const { repositoryOwner: owner, repositoryName: repo } = event.ResourceProperties;
  const { data } = await octokit.request('GET /repos/{owner}/{repo}', {
    owner,
    repo,
  });
  return data.id;
};


export const handler = onEvent;
