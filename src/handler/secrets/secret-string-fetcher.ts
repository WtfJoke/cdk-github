import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { SSM } from '@aws-sdk/client-ssm';
import { getSecretString } from '.';
import { ISecretString, ISecretsManagerSecretString } from '../../types/exported';


/**
 * Gets the secret value.
 * @param secretString The secret string.
 * @param smClient the Secrets Manager client - to fetch the secret value from Secrets Manager if needed.
 * @param ssmClient the Systems manager client - to fetch the secret value from Parameter Store if needed.
*/
export const getValueFromSecretString = async (secretString: ISecretString, smClient: SecretsManager, ssmClient: SSM): Promise<string> => {
  switch (secretString.type) {
    case 'SECRETS_MANAGER':
      const castedSecretString = secretString as ISecretsManagerSecretString;
      return getSecretString(castedSecretString.id, smClient, castedSecretString.options);
    case 'SECURE_PARAMETER':
      return getParameter(secretString.id, ssmClient);
    default:
      throw new Error('Unknown secretStringType: ' + secretString.type);
  }
};

const getParameter = async (id: string, ssmClient: SSM) => {
  const parameterResult = await ssmClient.getParameter({ Name: id, WithDecryption: true });
  const parameter = parameterResult.Parameter?.Value;
  if (!parameter) {
    throw new Error(`Parameter '${id}' is empty`);
  }
  return parameter;
};
