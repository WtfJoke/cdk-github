import { App } from 'aws-cdk-lib';
import { ActionSecretStack } from './action-secret-stack';

const app = new App();

new ActionSecretStack(app, 'GitHubActionSecretStack', {
  env: { region: 'eu-central-1' },
});
