

import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { ActionSecret } from '../../src';


class ActionSecretTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new ActionSecret(this, 'ActionSecret', {
      repositoryName: 'cdk-github',
      repositorySecretName: 'A_RANDOM_INTEGRATION_GITHUB_SECRET',
      githubTokenSecret: Secret.fromSecretNameV2(this, 'ghSecret', 'GITHUB_TOKEN'),
      sourceSecret: Secret.fromSecretNameV2(this, 'secretToStoreInGitHub', 'testcdkgithub'),
    });
  }
}

const app = new App();
new ActionSecretTestStack(app, 'github-action-secret-app-integ', { env: { region: 'eu-central-1' } });
app.synth();
