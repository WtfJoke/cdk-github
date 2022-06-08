import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { GitHubRepositorySecret } from '../../github-repository-secret';

export class GitHubRepositorySecretStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceSecret = Secret.fromSecretNameV2(this, 'secretToStoreInGithub', 'testcdkgithub' );
    const githubTokenSecret = Secret.fromSecretNameV2(this, 'ghSecret', 'GITHUB_TOKEN' );

    new GitHubRepositorySecret(this, 'GithubSecret', {
      githubTokenSecret,
      repositoryName: 'cdk-github',
      repositoryOwner: 'wtfjoke',
      repositorySecretName: 'aRandomGithubSecret',
      sourceSecret,
    });
  }
}