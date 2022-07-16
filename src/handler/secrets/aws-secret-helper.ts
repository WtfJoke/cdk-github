import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { SecretsManagerSecretOptions } from 'aws-cdk-lib';

export const getSecretString = async (secretId: string, smClient: SecretsManager, options?: SecretsManagerSecretOptions): Promise<string> => {
  const secretOptions = options || {};
  const { jsonField, versionStage, versionId } = secretOptions;
  console.log(`Get Secret of secretId: ${secretId} with options: ${JSON.stringify(secretOptions)}`);
  const secretToEncrypt = await smClient.getSecretValue({ SecretId: secretId, VersionStage: versionStage, VersionId: versionId });

  const secretString = secretToEncrypt.SecretString;
  if (!secretString) {
    throw new Error('SecretString is empty from secret with id: ' + secretId);
  }

  if (jsonField) {
    return getJsonFieldSecret(secretId, secretString, jsonField);
  } else {
    return secretString;
  }
};

const getJsonFieldSecret = (secretId: string, existingSecretString: string, jsonField: string) => {
  try {
    const parsedSecretString = JSON.parse(existingSecretString)[jsonField];
    if (!parsedSecretString) {
      throw new Error('SecretString is empty from secret with id: ' + secretId + ' and jsonField: ' + jsonField);
    }
    return parsedSecretString;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Error while parsing SecretString with id: ' + secretId + ' and jsonField: ' + jsonField + ': ' + error.message);
    }
    throw error;
  }
};
