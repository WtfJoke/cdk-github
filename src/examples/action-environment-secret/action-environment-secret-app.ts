import { App } from 'aws-cdk-lib';
import { ActionEnvironmentSecretStack } from './action-environment-secret-stack';

const app = new App();

new ActionEnvironmentSecretStack(app, 'GitHubActionEnvironmentSecretStack', {
  env: { region: 'eu-central-1' },
});
