import { App } from 'aws-cdk-lib';
import { ActionSecretStack } from './action-secret-stack';
import { SecretHelperStack } from './secret-helper.stack';

const app = new App();

const secretHelperStack = new SecretHelperStack(app, 'GithubActionSecretHelperStack', {
  env: { region: 'eu-central-1' },
});

new ActionSecretStack(app, 'GitHubActionSecretStack', {
  env: { region: 'eu-central-1' },
  sourceSecretName: secretHelperStack.sourceSecret.secretName,
});
