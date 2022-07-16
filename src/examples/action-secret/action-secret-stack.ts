import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { ActionSecret } from '../../constructs';
import { SecretString } from '../../types/exported';

export class ActionSecretStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceSecret = Secret.fromSecretNameV2(this, 'secretToStoreInGitHub', 'cdk-github/test/structured');
    const secretToBeStored = SecretString.fromSecretsManager(sourceSecret, { jsonField: 'key' });
    const githubToken = SecretString.fromSecretsManager(Secret.fromSecretNameV2(this, 'ghSecret', 'GITHUB_TOKEN'));

    new ActionSecret(this, 'GitHubActionSecret', {
      githubToken,
      repository: { name: 'cdk-github', owner: 'wtfjoke' },
      secretToBeStored,
      actionSecretName: 'A_RANDOM_GITHUB_SECRET',
    });
  }
}
