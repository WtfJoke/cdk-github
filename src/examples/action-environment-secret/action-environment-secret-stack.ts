import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { ActionEnvironmentSecret } from '../../constructs';
import { SecretString } from '../../types/exported';

export class ActionEnvironmentSecretStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const githubTokenSecret = Secret.fromSecretNameV2(this, 'ghSecret', 'GITHUB_TOKEN');
    const githubToken = SecretString.fromSecretsManager(githubTokenSecret);
    const secretToBeStoredSecret = Secret.fromSecretNameV2(this, 'secretToStoreInGitHub', 'testcdkgithub');
    const secretToBeStored = SecretString.fromSecretsManager(secretToBeStoredSecret);

    new ActionEnvironmentSecret(this, 'GitHubActionEnvironmentSecret', {
      githubToken,
      environment: 'dev',
      repository: { name: 'cdk-github', owner: 'wtfjoke' },
      actionSecretName: 'A_RANDOM_GITHUB_SECRET',
      secretToBeStored,
    });
  }
}
