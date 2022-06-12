import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Octokit } from '@octokit/core';
import type { OnEventRequest, ActionSecretEventProps } from '../../../types';

import { encryptValue } from '../github-secret-encryptor';
import { validateSecretName } from '../github-secret-name-validator';

const onEvent = async (event: OnEventRequest<ActionSecretEventProps>) => {
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
  event: OnEventRequest<ActionSecretEventProps>,
  octokit: Octokit,
  smClient: SecretsManagerClient,
) => {
  const props = event.ResourceProperties;
  const secretName = props.repositorySecretName;
  console.log('Create new ActionSecret with props ' + JSON.stringify(props));

  await createOrUpdateRepoSecret(event, octokit, smClient);
  return { PhysicalResourceId: secretName };
};

const onUpdate = async (
  event: OnEventRequest<ActionSecretEventProps>,
  octokit: Octokit,
  smClient: SecretsManagerClient,
) => {
  const props = event.ResourceProperties;
  const secretName = props.repositorySecretName;
  console.log(`Update ActionSecret ${secretName} with props ${JSON.stringify(props)}`);

  await createOrUpdateRepoSecret(event, octokit, smClient);
  return { PhysicalResourceId: secretName };
};

const onDelete = async (
  event: OnEventRequest<ActionSecretEventProps>,
  octokit: Octokit,
) => {
  const secretName = event.ResourceProperties.repositorySecretName;
  console.log('Delete ActionSecret ' + secretName);
  await deleteRepoSecret(event, octokit);
  return { PhysicalResourceId: secretName };
};

const createOrUpdateRepoSecret = async (
  event: OnEventRequest<ActionSecretEventProps>,
  octokit: Octokit,
  smClient: SecretsManagerClient,
) => {
  const { repositoryOwner: owner, repositoryName: repo, repositorySecretName: secret_name } = event.ResourceProperties;
  const secretId = event.ResourceProperties.sourceSecretArn;
  const secretToEncrypt = await smClient.send(new GetSecretValueCommand({ SecretId: secretId }));
  console.log(`Encrypt value of secret with id: ${secretId}`);

  const secretString = secretToEncrypt.SecretString;
  if (!secretString) {
    throw new Error('SecretString is empty from secret with id: ' + secretId);
  }

  const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/secrets/public-key', { owner, repo });

  const encryptedSecret = await encryptValue(secretString, data.key);
  console.log('Encrypted secret, attempting to create/update github secret');

  const secretResponse = await octokit.request('PUT /repos/{owner}/{repo}/actions/secrets/{secret_name}', {
    owner,
    repo,
    secret_name,
    encrypted_value: encryptedSecret,
    key_id: data.key_id,
  });
  console.log(JSON.stringify(secretResponse));
  return secretResponse;
};

const deleteRepoSecret = async (
  event: OnEventRequest<ActionSecretEventProps>,
  octokit: Octokit,
) => {
  const { repositoryOwner: owner, repositoryName: repo, repositorySecretName: secret_name } = event.ResourceProperties;
  const deleteSecretResponse = await octokit.request('DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}', {
    owner,
    repo,
    secret_name,
  });
  console.log(`Delete: ${JSON.stringify(deleteSecretResponse)}`);
  return deleteSecretResponse;
};

export const handler = onEvent;
