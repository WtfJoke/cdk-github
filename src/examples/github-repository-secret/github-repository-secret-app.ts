import { App } from 'aws-cdk-lib';
import { GitHubRepositorySecretStack } from './github-repository-secret-stack';

const app = new App();

new GitHubRepositorySecretStack(app, 'GithubRepositorySecretStack', { env: { region: 'eu-central-1' } });