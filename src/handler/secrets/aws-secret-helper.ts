import { SecretsManager } from '@aws-sdk/client-secrets-manager';

export const getSecretString = async (secretId: string, smClient: SecretsManager, jsonField?: string): Promise<string> => {
  const secretToEncrypt = await smClient.getSecretValue({ SecretId: secretId });

  let secretString = secretToEncrypt.SecretString;
  if (!secretString) {
    throw new Error('SecretString is empty from secret with id: ' + secretId);
  }
  if (jsonField) {
    try {
      secretString = JSON.parse(secretString)[jsonField];
    } catch (error) {
      if (error instanceof Error) {
        throw new Error('Error while parsing SecretString with id: ' + secretId + ' and jsonField: ' + jsonField + ': ' + error.message);
      }
      throw error;
    }
  }
  if (!secretString) {
    throw new Error('SecretString is empty from secret with id: ' + secretId);
  }
  return secretString;
};
