import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { SSM } from '@aws-sdk/client-ssm';
import { SecretValue as AWSSecretValue } from 'aws-cdk-lib';
import { Grant, IGrantable } from 'aws-cdk-lib/aws-iam';
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { IStringParameter, StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';


interface ISecretValue {
  originalReference: string;
  type: SecretValueType;
  // grantRead
  getValue(smClient: SecretsManager, ssmClient: SSM): Promise<String>;

  grantRead(scope: Construct, id: string, grantee: IGrantable): Grant;
}

export class SecretValue {

  // https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/dynamic-references.html
  static fromUnwrappedValue(unwrappedValue: string) {
    if (unwrappedValue.includes(SecretsManagerSecretValue.MARKER)) {
      // {{resolve:secretsmanager:secret-id:secret-string:json-key:version-stage:version-id}}
      const withoutBraces = unwrappedValue.slice(2, -2);
      const parts = withoutBraces.split(':').slice(2);
      const secretId = parts[0];
      const jsonKey = parts[2];
      const versionStage = parts[3];
      const versionId = parts[4];

      return new SecretsManagerSecretValue(unwrappedValue, secretId, jsonKey, versionStage, versionId);
    } else if (unwrappedValue.includes(SecureParameterValue.MARKER)) {
      // '{{resolve:ssm-secure:parameter-name:version}}
      const withoutBraces = unwrappedValue.slice(2, -2);
      const parts = withoutBraces.split(':').slice(2);
      const parameterName = parts[0];
      const version = parts[1];
      return new SecureParameterValue(unwrappedValue, parameterName, version);
    } else {
      throw new Error('Unsupported SecretValue type: ' + unwrappedValue);
    }
  }

  static fromSecretValue(value: AWSSecretValue) {
    const unwrappedValue = value.unsafeUnwrap();
    return SecretValue.fromUnwrappedValue(unwrappedValue);
  }


  constructor({ unwrappedValue }: { unwrappedValue: string }) {
    console.log(unwrappedValue);
  }


}

class SecretsManagerSecretValue implements ISecretValue {
  static MARKER: string = 'secretsmanager';

  originalReference: string;
  type: SecretValueType = 'SECRETS_MANAGER';
  secretId: string;
  jsonKey?: string;
  versionStage?: string;
  versionId?: string;


  constructor(unwrappedValue: string, secretId: string, jsonKey?: string, versionStage?: string, versionId?: string) {
    this.originalReference = unwrappedValue;
    this.secretId = secretId;
    this.jsonKey = jsonKey ? jsonKey : undefined;
    this.versionStage = versionStage ? versionStage : undefined;
    this.versionId = versionId ? versionId : undefined;
  }

  grantRead(scope: Construct, id: string, grantee: IGrantable): Grant {
    return Secret.fromSecretNameV2(scope, id, this.secretId).grantRead(grantee);
  }

  async getValue(smClient: SecretsManager, _ssmClient: SSM): Promise<String> {
    const secretResult = await smClient.getSecretValue({ SecretId: this.secretId, VersionStage: this.versionStage, VersionId: this.versionId });
    const secretString = secretResult.SecretString;
    if (!secretString) {
      throw new Error('SecretString is empty');
    }
    return secretString;
  }
}

class SecureParameterValue implements ISecretValue {
  static MARKER: string = 'sm-secure';
  originalReference: string;
  type: SecretValueType = 'SECURE_PARAMETER';
  parameterName: string;
  version?: string;


  constructor(unwrappedValue: string, parameterName: string, version?: string) {
    this.originalReference = unwrappedValue;
    this.parameterName = parameterName;
    this.version = version;
  }
  toResource(scope: Construct, id: string): ISecret | IStringParameter {
    return StringParameter.fromSecureStringParameterAttributes(scope, id, { parameterName: this.parameterName });
  }

  grantRead(scope: Construct, id: string, grantee: IGrantable): Grant {
    return StringParameter.fromSecureStringParameterAttributes(scope, id, { parameterName: this.parameterName }).grantRead(grantee);
  }

  async getValue(_smClient: SecretsManager, ssmClient: SSM): Promise<String> {
    const parameterResult = await ssmClient.getParameter({ Name: this.parameterName, WithDecryption: true });
    const parameter = parameterResult.Parameter?.Value;
    if (!parameter) {
      throw new Error('Parameter is empty');
    }
    return parameter;

  }
}


type SecretValueType = 'SECURE_PARAMETER' | 'SECRETS_MANAGER';
