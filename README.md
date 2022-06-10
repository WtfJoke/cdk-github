# CDK-GitHub

[AWS CDK](https://aws.amazon.com/cdk/) v2 L3 constructs for GitHub.

This project aims to make GitHub's API accessible through CDK with various helper constructs to create resources in GitHub. 
The target is to replicate most of the functionality of the [Terraform GitHub Provider](https://registry.terraform.io/providers/integrations/github/latest/docs).

Internally [AWS CloudFormation custom resources](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html) will be used to track GitHub resources (such as Secrets).

# Installation

JavaScript/TypeScript:  
`npm install wtfjoke/cdk-github`


# Constructs

This library provides the following constructs:
- [GitHubRepositorySecret](API.md#githubrepositorysecret-a-name"githubrepositorysecret"-id"cdk-githubgithubrepositorysecret"a) - Create a GitHub Repository Secret from a given AWS Secrets Manager secret.

# Authentication
Currently the constructs only support authentication via a [GitHub Personal Access Token](https://github.com/settings/tokens/new). The token needs to be a stored in a AWS SecretsManager Secret and passed to the construct as parameter.
# Examples

## GitHubRepositorySecret

```typescript
import { GitHubRepositorySecret } from 'wtfjoke/cdk-github';

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
```
See full example in [GitHubRepositorySecretStack](src/examples/github-repository-secret/github-repository-secret-stack.ts)
