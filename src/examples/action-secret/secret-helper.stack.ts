import { SecretValue, Stack, StackProps } from 'aws-cdk-lib';
import { ISecret, Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

export class SecretHelperStack extends Stack {
  readonly sourceSecret: ISecret;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.sourceSecret = new Secret(this, 'testSecretStructured', {
      secretName: 'cdk-github/test/structured',
      secretStringValue: SecretValue.unsafePlainText(JSON.stringify({ key: 'value' })),
    });

    /*
    cdk-github/test/structured
    {"key":"value"}

    testcdkgithub
    sosecret
    */

  }
}