import { App } from 'aws-cdk-lib';
import { GitHubResourceIssueStack } from './github-resource-issue-stack';

const app = new App();

new GitHubResourceIssueStack(app, 'GitHubResourceIssueStack', {
  env: { region: 'eu-central-1' },
});
