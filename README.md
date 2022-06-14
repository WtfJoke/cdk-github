[![npm version](https://badge.fury.io/js/cdk-github.svg)](https://badge.fury.io/js/cdk-github)
[![PyPI version](https://badge.fury.io/py/cdk-github.svg)](https://badge.fury.io/py/cdk-github)
[![NuGet version](https://badge.fury.io/nu/cdkgithub.svg)](https://badge.fury.io/nu/cdkgithub)
[![release](https://github.com/wtfjoke/cdk-github/actions/workflows/release.yml/badge.svg)](https://github.com/wtfjoke/cdk-github/actions/workflows/release.yml)  
![cdk-constructs: Experimental](https://img.shields.io/badge/cdk--constructs-experimental-important.svg?style=for-the-badge)
# CDK-GitHub

GitHub Constructs for use in [AWS CDK](https://aws.amazon.com/cdk/) .

This project aims to make GitHub's API accessible through CDK with various helper constructs to create resources in GitHub.    
The target is to replicate most of the functionality of the official [Terraform GitHub Provider](https://registry.terraform.io/providers/integrations/github/latest/docs).

Internally [AWS CloudFormation custom resources](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/template-custom-resources.html) and [octokit](https://github.com/octokit/core.js) are used to manage GitHub resources (such as Secrets).

# 🔧 Installation

JavaScript/TypeScript:  
`npm install cdk-github`

Python:  
`pip install cdk-github`


# 📚 Constructs

This library provides the following constructs:
- [ActionSecret](API.md#actionsecret-a-nameactionsecret-idcdk-githubactionsecreta) - Creates a [GitHub Action (repository) secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) from a given AWS Secrets Manager secret.
- [ActionEnvironmentSecret](API.md#actionenvironmentsecret-a-nameactionenvironmentsecret-idcdk-githubactionenvironmentsecreta) - Creates a [GitHub Action environment secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-an-environment) from a given AWS Secrets Manager secret.

# 🔓 Authentication
Currently the constructs only support authentication via a [GitHub Personal Access Token](https://github.com/settings/tokens/new). The token needs to be a stored in a AWS SecretsManager Secret and passed to the construct as parameter.    

# 👩‍🏫 Examples
The API documentation and examples in different languages are available on [Construct Hub](https://constructs.dev/packages/cdk-github).   
All (typescript) examples can be found in the folder [examples](src/examples/).

## ActionSecret
```typescript
import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
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


## ActionEnvironmentSecret
```typescript
import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
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

# 💖 Contributing

Contributions of all kinds are welcome! Check out our [contributing guide](CONTRIBUTING.md).