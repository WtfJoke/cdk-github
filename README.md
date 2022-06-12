[![npm version](https://badge.fury.io/js/cdk-github.svg)](https://badge.fury.io/js/cdk-github)
[![PyPI version](https://badge.fury.io/py/cdk-github.svg)](https://badge.fury.io/py/cdk-github)
[![release](https://github.com/wtfjoke/cdk-github/actions/workflows/release.yml/badge.svg)](https://github.com/wtfjoke/cdk-github/actions/workflows/release.yml)  
![cdk-constructs: Experimental](https://img.shields.io/badge/cdk--constructs-experimental-important.svg?style=for-the-badge)
# CDK-GitHub

[AWS CDK](https://aws.amazon.com/cdk/) v2 L3 constructs for GitHub.

This project aims to make GitHub's API accessible through CDK with various helper constructs to create resources in GitHub. 
The target is to replicate most of the functionality of the [Terraform GitHub Provider](https://registry.terraform.io/providers/integrations/github/latest/docs).

Internally [AWS CloudFormation custom resources](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html) will be used to track GitHub resources (such as Secrets).

# Installation

JavaScript/TypeScript:  
`npm install cdk-github`

Python:  
`pip install cdk-github`


# Constructs

This library provides the following constructs:
- [ActionSecret](API.md#actionsecret-a-nameactionsecret-idcdk-githubactionsecreta) - Creates a [GitHub Action (repository) secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) from a given AWS Secrets Manager secret.
- [ActionEnvironmentSecret](API.md#actionenvironmentsecret-a-nameactionenvironmentsecret-idcdk-githubactionenvironmentsecreta) - Creates a [GitHub Action environment secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-an-environment) from a given AWS Secrets Manager secret.

# Authentication
Currently the constructs only support authentication via a [GitHub Personal Access Token](https://github.com/settings/tokens/new). The token needs to be a stored in a AWS SecretsManager Secret and passed to the construct as parameter.
# Examples

## ActionSecret

### TypeScript
```typescript
import { ActionSecret } from 'cdk-github';

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
```
See full example in [ActionSecretStack](src/examples/action-secret/action-secret-stack.ts)

### Python
```python
import cdkgithub

class ActionSecretStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        source_secret = sm.Secret.from_secret_name_v2(
            self, "secretToStoreInGitHub", "testcdkgithub"
        )
        github_token_secret = sm.Secret.from_secret_name_v2(
            self, "ghSecret", "GITHUB_TOKEN"
        )
        cdkgithub.ActionSecret(
            self,
            "GitHubActionSecret",
            github_token_secret=github_token_secret,
            repository_name="cdk-github",
            repository_owner="wtfjoke",
            repository_secret_name="aRandomPythonGitHubSecret",
            source_secret=source_secret,
        )
```


## ActionEnvironmentSecret
```typescript
import { ActionEnvironmentSecret } from 'cdk-github';

export class ActionEnvironmentSecretStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const sourceSecret = Secret.fromSecretNameV2(this, 'secretToStoreInGitHub', 'testcdkgithub');
    const githubTokenSecret = Secret.fromSecretNameV2(this, 'ghSecret', 'GITHUB_TOKEN');

    new ActionEnvironmentSecret(this, 'GitHubActionEnvironmentSecret', {
      githubTokenSecret,
      environment: 'dev',
      repositoryName: 'cdk-github',
      repositoryOwner: 'wtfjoke',
      repositorySecretName: 'aRandomGitHubSecret',
      sourceSecret,
    });
  }
}
```
See full example in [ActionEnvironmentSecretStack](src/examples/action-environment-secret/action-environment-secret-stack.ts)
