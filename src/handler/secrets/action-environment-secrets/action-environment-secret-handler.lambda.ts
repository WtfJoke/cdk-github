import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { SSM } from '@aws-sdk/client-ssm';
import { Octokit } from '@octokit/core';
import { CdkCustomResourceResponse } from 'aws-lambda';
import type { OnEventRequest, ActionEnvironmentSecretEventProps } from '../../../types';
import { SecretString } from '../../../types/exported';
import { getOwner } from '../github-helper';

import { encryptValue } from '../github-secret-encryptor';
import { validateSecretName } from '../github-secret-name-validator';
import { getValueFromSecretString } from '../secret-string-fetcher';

const onEvent = async (event: OnEventRequest<ActionEnvironmentSecretEventProps>): Promise<CdkCustomResourceResponse> => {
  console.log(`Event: ${JSON.stringify(event)}`);
  const props = event.ResourceProperties;
  validateSecretName(props.actionSecretName);
  const region = props.awsRegion;
  const smClient = new SecretsManager({ region });
  const ssmClient = new SSM({ region });
  const githubTokenSecret = SecretString.fromSerializedValue(props.githubTokenSecret);
  const auth = await getValueFromSecretString(githubTokenSecret, smClient, ssmClient);
  const octokit = new Octokit({ auth });
  const secretToStore = await getValueFromSecretString(SecretString.fromSerializedValue(props.sourceSecret), smClient, ssmClient);

  const requestType = event.RequestType;
  switch (requestType) {
    case 'Create':
      return onCreate(event, octokit, secretToStore);
    case 'Update':
      return onUpdate(event, octokit, secretToStore);
    case 'Delete':
      return onDelete(event, octokit);
    default:
      throw new Error(`Unexpected request type: '${requestType}'`);
  }
};

const onCreate = async (
  event: OnEventRequest<ActionEnvironmentSecretEventProps>,
  octokit: Octokit,
  secretToStore: string,
): Promise<CdkCustomResourceResponse> => {
  console.log('Create new ActionEnvironmentSecret with props ' + JSON.stringify(event.ResourceProperties));
  await createOrUpdateEnvironmentSecret(event, octokit, secretToStore);

  const PhysicalResourceId = await buildPhysicalResourceId(event, octokit);
  return { PhysicalResourceId };
};

const onUpdate = async (
  event: OnEventRequest<ActionEnvironmentSecretEventProps>,
  octokit: Octokit,
  secretToStore: string,
): Promise<CdkCustomResourceResponse> => {
  const props = event.ResourceProperties;

  console.log(`Update ActionEnvironmentSecret ${props.actionSecretName} with props ${JSON.stringify(props)}`);
  await createOrUpdateEnvironmentSecret(event, octokit, secretToStore);

  const PhysicalResourceId = await buildPhysicalResourceId(event, octokit);
  return { PhysicalResourceId };
};

const onDelete = async (
  event: OnEventRequest<ActionEnvironmentSecretEventProps>,
  octokit: Octokit,
): Promise<CdkCustomResourceResponse> => {
  console.log('Delete ActionEnvironmentSecret ' + event.ResourceProperties.actionSecretName);
  await deleteEnvironmentSecret(event, octokit);

  const PhysicalResourceId = await buildPhysicalResourceId(event, octokit);
  return { PhysicalResourceId };
};

const createOrUpdateEnvironmentSecret = async (
  event: OnEventRequest<ActionEnvironmentSecretEventProps>,
  octokit: Octokit,
  secretToStore: string,
) => {
  const {
    repositoryOwner,
    repositoryName: repo,
    actionSecretName: secret_name,
    environment: environment_name,
    sourceSecret,
  } = event.ResourceProperties;
  const secretId = SecretString.fromSerializedValue(sourceSecret).id;
  console.log(`Encrypt value of secret with id: ${secretId}`);

  const owner = await getOwner(octokit, repositoryOwner);
  const { data } = await octokit.request('GET /repos/{owner}/{repo}/actions/secrets/public-key', { owner, repo });

  const encryptedSecret = await encryptValue(secretToStore, data.key);
  console.log('Encrypted secret, attempting to create/update github secret');

  const repository_id = await getRepositoryId(event, octokit, owner);
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
  const { environment: environment_name, actionSecretName: secret_name, repositoryOwner } = event.ResourceProperties;
  const repository_id = await getRepositoryId(event, octokit, repositoryOwner);
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
  repositoryOwner: string | undefined,
) => {
  const { repositoryName: repo } = event.ResourceProperties;
  const owner = await getOwner(octokit, repositoryOwner);
  const { data } = await octokit.request('GET /repos/{owner}/{repo}', {
    owner,
    repo,
  });
  return data.id;
};

const buildPhysicalResourceId = async (event: OnEventRequest<ActionEnvironmentSecretEventProps>, octokit: Octokit) => {
  const { environment, actionSecretName: secret, repositoryOwner, repositoryName: repo } = event.ResourceProperties;
  const owner = await getOwner(octokit, repositoryOwner);
  return [environment, secret, owner, repo].join('/');
};


export const handler = onEvent;
