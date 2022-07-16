import { SecretsManagerSecretOptions, Stack } from 'aws-cdk-lib';
import { IGrantable, Grant } from 'aws-cdk-lib/aws-iam';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { IStringParameter } from 'aws-cdk-lib/aws-ssm';

/**
 * A secret either in AWS Secrets Manager or in AWS SSM Parameter Store.
 */
export interface ISecretString {
  /**
   * Wheter the secret is in AWS Secrets Manager or in AWS SSM Parameter Store.
   */
  readonly type: SecretType;

  /**
   * The secret's identifier (secret or parameter name).
   */
  readonly id: string;

  /**
   * Grants reading the secret value to some role.
   * @param grantee  the principal being granted permission.
   */
  grantRead(grantee: IGrantable): Grant;

  /**
   * Returns a safe string representation of this secret for passing it to the custom resource handler in the resource properties.
   * @param stack the stack to which the secret is added.
   */
  serialize(stack: Stack): string;
}

export abstract class SecretString {

  /**
   * Imports a SecretString from an AWS Secrets Manager secret.
   * @param secret - the secret to import.
   * @param options - the options for importing the secret (such as version or jsonField).
   * @returns the imported ISecretString.
   */
  static fromSecretsManager(secret: ISecret, options?: SecretsManagerSecretOptions): ISecretString {
    return new SecretsManagerSecretString(secret.secretName, options, secret);
  }

  /**
   * Imports a SecureString Parameter from AWS SSM Parameter Store.
   * @param parameter - the secure string parameter to import.
   * @returns the imported ISecretString.
   */
  static fromSecureParameter(parameter: IStringParameter): ISecretString {
    return new SecureStringParameterSecretString(parameter.parameterName, parameter);
  }

  /**
   * Imports a prior serialized ISecretString.
   * This method is not meant for usage outside of the cdk-github code.
   * @param serializedValue - the serialized value this ISecretString.
   * @returns the imported ISecretString.
   */
  static fromSerializedValue(serializedValue: string): ISecretString {
    console.log('Create SecretString from serialized value: ' + serializedValue);
    const secretString = JSON.parse(serializedValue) as ISecretString;
    switch (secretString.type) {
      case 'SECRETS_MANAGER':
        const castedSecretString = secretString as ISecretsManagerSecretString;
        return new SecretsManagerSecretString(castedSecretString.id, castedSecretString.options);
      case 'SECURE_PARAMETER':
        return new SecureStringParameterSecretString(secretString.id);
      default:
        throw new Error('Unknown serializedValue: ' + secretString);
    }
  }
}

export interface ISecretsManagerSecretString extends ISecretString {
  secret?: ISecret;
  options?: SecretsManagerSecretOptions;
}

class SecretsManagerSecretString implements ISecretsManagerSecretString {
  type: SecretType = 'SECRETS_MANAGER';
  id: string;
  secret?: ISecret;
  options?: SecretsManagerSecretOptions;


  constructor(secretId: string, options?: SecretsManagerSecretOptions, secret?: ISecret) {
    this.secret = secret;
    this.id = secretId;
    this.options = options;
  }

  grantRead(grantee: IGrantable): Grant {
    if (!this.secret) {
      throw new Error(`Secret ${this.id} is not defined`);
    }
    return this.secret.grantRead(grantee);
  }

  serialize(stack: Stack): string {
    // Tokens needs to be resolved, see https://docs.aws.amazon.com/cdk/v2/guide/tokens.html#tokens_json
    return stack.toJsonString({
      type: this.type,
      id: this.id,
      options: this.options,
    });
  }
}

export interface ISecureStringParameterSecretString extends ISecretString {
  parameter?: IStringParameter;
}

class SecureStringParameterSecretString implements ISecureStringParameterSecretString {
  type: SecretType = 'SECURE_PARAMETER';
  id: string;
  parameter?: IStringParameter;
  secret?: ISecret;

  constructor(parameterName: string, parameter?: IStringParameter) {
    this.id = parameterName;
    this.parameter = parameter;
  }

  grantRead(grantee: IGrantable): Grant {
    if (!this.parameter) {
      throw new Error(`Parameter '${this.id}' is not defined`);
    }
    return this.parameter.grantRead(grantee);
  }

  serialize(stack: Stack): string {
    // Tokens needs to be resolved, see https://docs.aws.amazon.com/cdk/v2/guide/tokens.html#tokens_json
    return stack.toJsonString({
      type: this.type,
      id: this.id,
    });
  }
}

type SecretType = 'SECURE_PARAMETER' | 'SECRETS_MANAGER';
