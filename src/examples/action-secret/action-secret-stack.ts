import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { ActionSecret } from '../../constructs';

export class ActionSecretStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceSecret = Secret.fromSecretNameV2(this, 'secretToStoreInGitHub', 'testcdkgithub');
    const githubTokenSecret = Secret.fromSecretNameV2(this, 'ghSecret', 'GITHUB_TOKEN');

    new ActionSecret(this, 'GitHubActionSecret', {
      githubTokenSecret,
      repositoryName: 'cdk-github',
      repositoryOwner: 'wtfjoke',
      repositorySecretName: 'aRandomGitHubSecret',
      sourceSecret,
    });
  }
}
