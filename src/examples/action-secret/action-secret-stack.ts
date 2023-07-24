import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { ActionSecret } from '../../constructs';

export interface ActionSecretStackProps extends StackProps {
  readonly sourceSecretName: string;
}

export class ActionSecretStack extends Stack {
  constructor(scope: Construct, id: string, props: ActionSecretStackProps) {
    super(scope, id, props);

    const sourceSecret = Secret.fromSecretNameV2(this, 'secretToStoreInGitHub', props.sourceSecretName);
    const githubTokenSecret = Secret.fromSecretNameV2(this, 'ghSecret', 'GITHUB_TOKEN');

    new ActionSecret(this, 'GitHubActionSecret', {
      githubTokenSecret,
      repository: { name: 'cdk-github', owner: 'wtfjoke' },
      repositorySecretName: 'A_RANDOM_GITHUB_SECRET',
      sourceSecret,
      sourceSecretJsonField: 'key',
    });
  }
}
