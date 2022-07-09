import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { SSM } from '@aws-sdk/client-ssm';
import { Octokit } from '@octokit/core';
import { CdkCustomResourceResponse } from 'aws-lambda';
import type { OnEventRequest, ActionSecretEventProps } from '../../../types';
import { SecretValue } from '../../helper';
import { getSecretString } from '../aws-secret-helper';
import { getOwner } from '../github-helper';

import { encryptValue } from '../github-secret-encryptor';
import { validateSecretName } from '../github-secret-name-validator';

const onEvent = async (event: OnEventRequest<ActionSecretEventProps>): Promise<CdkCustomResourceResponse> => {
  console.log(`Event: ${JSON.stringify(event)}`);
  validateSecretName(event.ResourceProperties.repositorySecretName);
  const smClient = new SecretsManager({ region: event.ResourceProperties.awsRegion });
  const githubTokenSecret = await smClient.getSecretValue({ SecretId: event.ResourceProperties.githubTokenSecret });
  const octokit = new Octokit({ auth: githubTokenSecret.SecretString });
  const foo = SecretValue.fromUnwrappedValue(event.ResourceProperties.newSourceSecret);
  console.log('Hi there', + await foo.getValue(smClient, new SSM({ region: event.ResourceProperties.awsRegion })));

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
  smClient: SecretsManager,
): Promise<CdkCustomResourceResponse> => {
  const props = event.ResourceProperties;

  console.log('Create new ActionSecret with props ' + JSON.stringify(props));
  await createOrUpdateRepoSecret(event, octokit, smClient);

  const PhysicalResourceId = await buildPhysicalResourceId(event, octokit);
  return { PhysicalResourceId };
};

const onUpdate = async (
  event: OnEventRequest<ActionSecretEventProps>,
  octokit: Octokit,
  smClient: SecretsManager,
): Promise<CdkCustomResourceResponse> => {
  const props = event.ResourceProperties;

  console.log(`Update ActionSecret ${props.repositorySecretName} with props ${JSON.stringify(props)}`);
  await createOrUpdateRepoSecret(event, octokit, smClient);

  const PhysicalResourceId = await buildPhysicalResourceId(event, octokit);
  return { PhysicalResourceId };
};

const onDelete = async (
  event: OnEventRequest<ActionSecretEventProps>,
  octokit: Octokit,
): Promise<CdkCustomResourceResponse> => {
  console.log('Delete ActionSecret ' + event.ResourceProperties.repositorySecretName);
  await deleteRepoSecret(event, octokit);

  const PhysicalResourceId = await buildPhysicalResourceId(event, octokit);
  return { PhysicalResourceId };
};

const createOrUpdateRepoSecret = async (
  event: OnEventRequest<ActionSecretEventProps>,
  octokit: Octokit,
  smClient: SecretsManager,
) => {
  const {
    repositoryOwner, repositoryName: repo,
    repositorySecretName: secret_name, sourceSecretArn: secretId,
    sourceSecretJsonField,
  } = event.ResourceProperties;
  console.log(`Encrypt value of secret with id: ${secretId}`);

  const secretString = await getSecretString(secretId, smClient, sourceSecretJsonField);
  const owner = await getOwner(octokit, repositoryOwner);
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
  const { repositoryOwner, repositoryName: repo, repositorySecretName: secret_name } = event.ResourceProperties;
  const owner = await getOwner(octokit, repositoryOwner);
  const deleteSecretResponse = await octokit.request('DELETE /repos/{owner}/{repo}/actions/secrets/{secret_name}', {
    owner,
    repo,
    secret_name,
  });
  console.log(`Delete: ${JSON.stringify(deleteSecretResponse)}`);
  return deleteSecretResponse;
};

const buildPhysicalResourceId = async (event: OnEventRequest<ActionSecretEventProps>, octokit: Octokit) => {
  const { repositorySecretName: secret, repositoryOwner, repositoryName: repo } = event.ResourceProperties;
  const owner = await getOwner(octokit, repositoryOwner);
  return [secret, owner, repo].join('/');
};

export const handler = onEvent;
