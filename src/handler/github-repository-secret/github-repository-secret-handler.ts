import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Octokit } from '@octokit/rest';
import type { OnEventRequest, GitHubRepositorySecretEventProps } from '../../types';

import { encryptValue } from './github-secret-encryptor';

const onEvent = async (event: OnEventRequest<GitHubRepositorySecretEventProps>) => {
  console.log(`Event: ${JSON.stringify(event)}`);
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
  event: OnEventRequest<GitHubRepositorySecretEventProps>,
  octokit: Octokit,
  smClient: SecretsManagerClient,
) => {
  const props = event.ResourceProperties;
  const physicalId = event.PhysicalResourceId;
  console.log('Create new resource with props ' + JSON.stringify(props));

  await createOrUpdateRepoSecret(event, octokit, smClient);
  return { PhysicalResourceId: physicalId };
};

const onUpdate = async (
  event: OnEventRequest<GitHubRepositorySecretEventProps>,
  octokit: Octokit,
  smClient: SecretsManagerClient,
) => {
  const props = event.ResourceProperties;
  const physicalId = event.PhysicalResourceId;
  console.log(`Update resource ${physicalId} with props ${JSON.stringify(props)}`);

  await createOrUpdateRepoSecret(event, octokit, smClient);
  return { PhysicalResourceId: physicalId };
};

const onDelete = async (
  event: OnEventRequest<GitHubRepositorySecretEventProps>,
  octokit: Octokit,
) => {
  const physicalId = event.PhysicalResourceId;
  console.log('Delete resource ' + physicalId);
  await deleteRepoSecret(event, octokit);
  return { PhysicalResourceId: physicalId };
};

const createOrUpdateRepoSecret = async (
  event: OnEventRequest<GitHubRepositorySecretEventProps>,
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

  const { data } = await octokit.rest.actions.getRepoPublicKey({ owner, repo });
  const encryptedSecret = await encryptValue(secretString, data.key);
  console.log('Encrypted secret, attempting to create/update github secret');

  const secretResponse = await octokit.rest.actions.createOrUpdateRepoSecret({
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
  event: OnEventRequest<GitHubRepositorySecretEventProps>,
  octokit: Octokit,
) => {
  const { repositoryOwner: owner, repositoryName: repo, repositorySecretName: secret_name } = event.ResourceProperties;
  const secretResponse = await octokit.rest.actions.deleteRepoSecret({
    owner,
    repo,
    secret_name,
  });
  console.log(`Delete: ${JSON.stringify(secretResponse)}`);
  return secretResponse;
};

export const handler = onEvent;
