[![npm version](https://badge.fury.io/js/cdk-github.svg)](https://badge.fury.io/js/cdk-github)
[![PyPI version](https://badge.fury.io/py/cdk-github.svg)](https://badge.fury.io/py/cdk-github)
[![NuGet version](https://badge.fury.io/nu/cdkgithub.svg)](https://badge.fury.io/nu/cdkgithub)
[![Maven Central](https://maven-badges.herokuapp.com/maven-central/io.github.wtfjoke/cdk-github/badge.svg)](https://maven-badges.herokuapp.com/maven-central/io.github.wtfjoke/cdk-github/)
[![release](https://github.com/wtfjoke/cdk-github/actions/workflows/release.yml/badge.svg)](https://github.com/wtfjoke/cdk-github/actions/workflows/release.yml)
![cdk-constructs: Experimental](https://img.shields.io/badge/cdk--constructs-experimental-important.svg?style=for-the-badge) [![View on Construct Hub](https://constructs.dev/badge?package=cdk-github)](https://constructs.dev/packages/cdk-github)
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

Java
<details>
  <summary>Maven:</summary>

  ```xml
<dependency>
    <groupId>io.github.wtfjoke</groupId>
    <artifactId>cdk-github</artifactId>
    <version>VERSION</version>
</dependency>
  ```
</details>
<details>
  <summary>Gradle:</summary>

   `implementation 'io.github.wtfjoke:cdk-github:VERSION'`
</details>
<details>
  <summary>Gradle (Kotlin):</summary>

   `implementation("io.github.wtfjoke:cdk-github:VERSION")`
</details>

C#
See https://www.nuget.org/packages/CdkGithub

# 📚 Constructs

This library provides the following constructs:
- [ActionEnvironmentSecret](API.md#actionenvironmentsecret-) - Creates a [GitHub Action environment secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-an-environment) from a given AWS Secrets Manager secret.
- [ActionSecret](API.md#actionsecret-) - Creates a [GitHub Action (repository) secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) from a given AWS Secrets Manager secret.
- [GitHubResource](API.md#githubresource-) - Creates an arbitrary GitHub resource. When no suitable construct fits your needs, this construct can be used to create most GitHub resources. It is an L1 construct.

# 🔓 Authentication
Currently the constructs only support authentication via a [GitHub Personal Access Token](https://github.com/settings/tokens/new). The token needs to be a stored in a AWS SecretsManager Secret and passed to the construct as parameter.

# 👩‍🏫 Examples
The API documentation and examples in different languages are available on [Construct Hub](https://constructs.dev/packages/cdk-github).
All (typescript) examples can be found in the folder [examples](src/examples/).

## ActionSecret
```typescript
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { ActionSecret } from 'cdk-github';

export class ActionSecretStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const githubTokenSecret = Secret.fromSecretNameV2(this, 'ghSecret', 'GITHUB_TOKEN');
    const sourceSecret = Secret.fromSecretNameV2(this, 'secretToStoreInGitHub', 'testcdkgithub');

    new ActionSecret(this, 'GitHubActionSecret', {
      githubTokenSecret,
      repository: { name: 'cdk-github', owner: 'wtfjoke' },
      repositorySecretName: 'A_RANDOM_GITHUB_SECRET',
      sourceSecret,
    });
  }
}
```


## ActionEnvironmentSecret
```typescript
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { ActionEnvironmentSecret } from 'cdk-github';

export class ActionEnvironmentSecretStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const githubTokenSecret = Secret.fromSecretNameV2(this, 'ghSecret', 'GITHUB_TOKEN');
    const sourceSecret = Secret.fromSecretNameV2(this, 'secretToStoreInGitHub', 'testcdkgithub');

    new ActionEnvironmentSecret(this, 'GitHubActionEnvironmentSecret', {
      githubTokenSecret,
      environment: 'dev',
      repository: { name: 'cdk-github', owner: 'wtfjoke' },
      repositorySecretName: 'A_RANDOM_GITHUB_SECRET',
      sourceSecret,
    });
  }
}
```

## GitHubResource
```typescript
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { GitHubResource } from 'cdk-github';


export class GitHubResourceIssueStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const githubTokenSecret = Secret.fromSecretNameV2(this, 'ghSecret', 'GITHUB_TOKEN');
    // optional
    const writeResponseToSSMParameter = StringParameter.fromSecureStringParameterAttributes(this, 'responseBody', { parameterName: '/cdk-github/encrypted-response' });

    new GitHubResource(this, 'GitHubIssue', {
      githubTokenSecret,
      createRequestEndpoint: 'POST /repos/WtfJoke/dummytest/issues',
      createRequestPayload: JSON.stringify({ title: 'Testing cdk-github', body: "I'm opening an issue by using aws cdk 🎉", labels: ['bug'] }),
      createRequestResultParameter: 'number',
      deleteRequestEndpoint: 'PATCH /repos/WtfJoke/dummytest/issues/:number',
      deleteRequestPayload: JSON.stringify({ state: 'closed' }),
      writeResponseToSSMParameter,
    });
  }
}
```

# 💖 Contributing

Contributions of all kinds are welcome! Check out our [contributing guide](CONTRIBUTING.md).
# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### ActionEnvironmentSecret <a name="ActionEnvironmentSecret" id="cdk-github.ActionEnvironmentSecret"></a>

#### Initializers <a name="Initializers" id="cdk-github.ActionEnvironmentSecret.Initializer"></a>

```typescript
import { ActionEnvironmentSecret } from 'cdk-github'

new ActionEnvironmentSecret(scope: Construct, id: string, props: ActionEnvironmentSecretProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.ActionEnvironmentSecret.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-github.ActionEnvironmentSecret.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-github.ActionEnvironmentSecret.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-github.ActionEnvironmentSecretProps">ActionEnvironmentSecretProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-github.ActionEnvironmentSecret.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-github.ActionEnvironmentSecret.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-github.ActionEnvironmentSecret.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-github.ActionEnvironmentSecretProps">ActionEnvironmentSecretProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-github.ActionEnvironmentSecret.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-github.ActionEnvironmentSecret.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-github.ActionEnvironmentSecret.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-github.ActionEnvironmentSecret.isConstruct"></a>

```typescript
import { ActionEnvironmentSecret } from 'cdk-github'

ActionEnvironmentSecret.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-github.ActionEnvironmentSecret.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.ActionEnvironmentSecret.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-github.ActionEnvironmentSecret.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### ActionSecret <a name="ActionSecret" id="cdk-github.ActionSecret"></a>

#### Initializers <a name="Initializers" id="cdk-github.ActionSecret.Initializer"></a>

```typescript
import { ActionSecret } from 'cdk-github'

new ActionSecret(scope: Construct, id: string, props: ActionSecretProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.ActionSecret.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-github.ActionSecret.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-github.ActionSecret.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-github.ActionSecretProps">ActionSecretProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-github.ActionSecret.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-github.ActionSecret.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-github.ActionSecret.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-github.ActionSecretProps">ActionSecretProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-github.ActionSecret.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-github.ActionSecret.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-github.ActionSecret.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-github.ActionSecret.isConstruct"></a>

```typescript
import { ActionSecret } from 'cdk-github'

ActionSecret.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-github.ActionSecret.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.ActionSecret.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-github.ActionSecret.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


### GitHubResource <a name="GitHubResource" id="cdk-github.GitHubResource"></a>

#### Initializers <a name="Initializers" id="cdk-github.GitHubResource.Initializer"></a>

```typescript
import { GitHubResource } from 'cdk-github'

new GitHubResource(scope: Construct, id: string, props: GitHubResourceProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.GitHubResource.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-github.GitHubResource.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-github.GitHubResource.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-github.GitHubResourceProps">GitHubResourceProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-github.GitHubResource.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-github.GitHubResource.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-github.GitHubResource.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-github.GitHubResourceProps">GitHubResourceProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-github.GitHubResource.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-github.GitHubResource.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-github.GitHubResource.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-github.GitHubResource.isConstruct"></a>

```typescript
import { GitHubResource } from 'cdk-github'

GitHubResource.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-github.GitHubResource.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.GitHubResource.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-github.GitHubResource.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### ActionEnvironmentSecretProps <a name="ActionEnvironmentSecretProps" id="cdk-github.ActionEnvironmentSecretProps"></a>

#### Initializer <a name="Initializer" id="cdk-github.ActionEnvironmentSecretProps.Initializer"></a>

```typescript
import { ActionEnvironmentSecretProps } from 'cdk-github'

const actionEnvironmentSecretProps: ActionEnvironmentSecretProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.environment">environment</a></code> | <code>string</code> | The GithHub environment name which the secret should be stored in. |
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.githubTokenSecret">githubTokenSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | The AWS secret in which the OAuth GitHub (personal) access token is stored. |
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.repository">repository</a></code> | <code><a href="#cdk-github.IGitHubRepository">IGitHubRepository</a></code> | The GitHub repository information (owner and name). |
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.repositorySecretName">repositorySecretName</a></code> | <code>string</code> | The GitHub secret name to be stored. |
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.sourceSecret">sourceSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | This AWS secret value will be stored in GitHub as a secret (under the name of repositorySecretName). |
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.sourceSecretJsonField">sourceSecretJsonField</a></code> | <code>string</code> | The key of a JSON field to retrieve in sourceSecret. |

---

##### `environment`<sup>Required</sup> <a name="environment" id="cdk-github.ActionEnvironmentSecretProps.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

The GithHub environment name which the secret should be stored in.

---

##### `githubTokenSecret`<sup>Required</sup> <a name="githubTokenSecret" id="cdk-github.ActionEnvironmentSecretProps.property.githubTokenSecret"></a>

```typescript
public readonly githubTokenSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

The AWS secret in which the OAuth GitHub (personal) access token is stored.

---

##### `repository`<sup>Required</sup> <a name="repository" id="cdk-github.ActionEnvironmentSecretProps.property.repository"></a>

```typescript
public readonly repository: IGitHubRepository;
```

- *Type:* <a href="#cdk-github.IGitHubRepository">IGitHubRepository</a>

The GitHub repository information (owner and name).

---

##### `repositorySecretName`<sup>Required</sup> <a name="repositorySecretName" id="cdk-github.ActionEnvironmentSecretProps.property.repositorySecretName"></a>

```typescript
public readonly repositorySecretName: string;
```

- *Type:* string

The GitHub secret name to be stored.

---

##### `sourceSecret`<sup>Required</sup> <a name="sourceSecret" id="cdk-github.ActionEnvironmentSecretProps.property.sourceSecret"></a>

```typescript
public readonly sourceSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

This AWS secret value will be stored in GitHub as a secret (under the name of repositorySecretName).

---

##### `sourceSecretJsonField`<sup>Optional</sup> <a name="sourceSecretJsonField" id="cdk-github.ActionEnvironmentSecretProps.property.sourceSecretJsonField"></a>

```typescript
public readonly sourceSecretJsonField: string;
```

- *Type:* string
- *Default:* returns all the content stored in the Secrets Manager secret.

The key of a JSON field to retrieve in sourceSecret.

This can only be used if the secret stores a JSON object.

---

### ActionSecretProps <a name="ActionSecretProps" id="cdk-github.ActionSecretProps"></a>

#### Initializer <a name="Initializer" id="cdk-github.ActionSecretProps.Initializer"></a>

```typescript
import { ActionSecretProps } from 'cdk-github'

const actionSecretProps: ActionSecretProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.ActionSecretProps.property.githubTokenSecret">githubTokenSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | The AWS secret in which the OAuth GitHub (personal) access token is stored. |
| <code><a href="#cdk-github.ActionSecretProps.property.repository">repository</a></code> | <code><a href="#cdk-github.IGitHubRepository">IGitHubRepository</a></code> | The GitHub repository information (owner and name). |
| <code><a href="#cdk-github.ActionSecretProps.property.repositorySecretName">repositorySecretName</a></code> | <code>string</code> | The GitHub secret name to be stored. |
| <code><a href="#cdk-github.ActionSecretProps.property.sourceSecret">sourceSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | This AWS secret value will be stored in GitHub as a secret (under the name of repositorySecretName). |
| <code><a href="#cdk-github.ActionSecretProps.property.sourceSecretJsonField">sourceSecretJsonField</a></code> | <code>string</code> | The key of a JSON field to retrieve in sourceSecret. |

---

##### `githubTokenSecret`<sup>Required</sup> <a name="githubTokenSecret" id="cdk-github.ActionSecretProps.property.githubTokenSecret"></a>

```typescript
public readonly githubTokenSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

The AWS secret in which the OAuth GitHub (personal) access token is stored.

---

##### `repository`<sup>Required</sup> <a name="repository" id="cdk-github.ActionSecretProps.property.repository"></a>

```typescript
public readonly repository: IGitHubRepository;
```

- *Type:* <a href="#cdk-github.IGitHubRepository">IGitHubRepository</a>

The GitHub repository information (owner and name).

---

##### `repositorySecretName`<sup>Required</sup> <a name="repositorySecretName" id="cdk-github.ActionSecretProps.property.repositorySecretName"></a>

```typescript
public readonly repositorySecretName: string;
```

- *Type:* string

The GitHub secret name to be stored.

---

##### `sourceSecret`<sup>Required</sup> <a name="sourceSecret" id="cdk-github.ActionSecretProps.property.sourceSecret"></a>

```typescript
public readonly sourceSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

This AWS secret value will be stored in GitHub as a secret (under the name of repositorySecretName).

---

##### `sourceSecretJsonField`<sup>Optional</sup> <a name="sourceSecretJsonField" id="cdk-github.ActionSecretProps.property.sourceSecretJsonField"></a>

```typescript
public readonly sourceSecretJsonField: string;
```

- *Type:* string
- *Default:* returns all the content stored in the Secrets Manager secret.

The key of a JSON field to retrieve in sourceSecret.

This can only be used if the secret stores a JSON object.

---

### GitHubResourceProps <a name="GitHubResourceProps" id="cdk-github.GitHubResourceProps"></a>

#### Initializer <a name="Initializer" id="cdk-github.GitHubResourceProps.Initializer"></a>

```typescript
import { GitHubResourceProps } from 'cdk-github'

const gitHubResourceProps: GitHubResourceProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.GitHubResourceProps.property.createRequestEndpoint">createRequestEndpoint</a></code> | <code>string</code> | The GitHub api endpoint url for creating resources in format: `POST /repos/OWNER/REPO/issues`. |
| <code><a href="#cdk-github.GitHubResourceProps.property.deleteRequestEndpoint">deleteRequestEndpoint</a></code> | <code>string</code> | The GitHub api endpoint url to delete this resource in format: `POST /repos/OWNER/REPO/issues`. |
| <code><a href="#cdk-github.GitHubResourceProps.property.githubTokenSecret">githubTokenSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | The AWS secret in which the OAuth GitHub (personal) access token is stored. |
| <code><a href="#cdk-github.GitHubResourceProps.property.createRequestPayload">createRequestPayload</a></code> | <code>string</code> | The GitHub api request payload for creating resources. This is a JSON parseable string. |
| <code><a href="#cdk-github.GitHubResourceProps.property.createRequestResultParameter">createRequestResultParameter</a></code> | <code>string</code> | Used to extract a value from the result of the createRequest(Endpoint) to be used in update/deleteRequests. |
| <code><a href="#cdk-github.GitHubResourceProps.property.deleteRequestPayload">deleteRequestPayload</a></code> | <code>string</code> | The GitHub api request payload to delete this resource. This is a JSON parseable string. |
| <code><a href="#cdk-github.GitHubResourceProps.property.updateRequestEndpoint">updateRequestEndpoint</a></code> | <code>string</code> | The GitHub api endpoint url to update this resource in format: `POST /repos/OWNER/REPO/issues`. |
| <code><a href="#cdk-github.GitHubResourceProps.property.updateRequestPayload">updateRequestPayload</a></code> | <code>string</code> | The GitHub api request payload to update this resources. This is a JSON parseable string. |
| <code><a href="#cdk-github.GitHubResourceProps.property.writeResponseToSSMParameter">writeResponseToSSMParameter</a></code> | <code>aws-cdk-lib.aws_ssm.IParameter</code> | The response body of the last GitHub api request will be written to this ssm parameter. |

---

##### `createRequestEndpoint`<sup>Required</sup> <a name="createRequestEndpoint" id="cdk-github.GitHubResourceProps.property.createRequestEndpoint"></a>

```typescript
public readonly createRequestEndpoint: string;
```

- *Type:* string

The GitHub api endpoint url for creating resources in format: `POST /repos/OWNER/REPO/issues`.

This is called when the GitHubResource is created.

Example:
```
const createRequestEndpoint = 'POST /repos/octocat/Hello-World/issues'
```

---

##### `deleteRequestEndpoint`<sup>Required</sup> <a name="deleteRequestEndpoint" id="cdk-github.GitHubResourceProps.property.deleteRequestEndpoint"></a>

```typescript
public readonly deleteRequestEndpoint: string;
```

- *Type:* string

The GitHub api endpoint url to delete this resource in format: `POST /repos/OWNER/REPO/issues`.

This is called when the GitHubResource is deleted/destroyed.

Example:
```
const deleteRequestEndpoint = 'PATCH repos/octocat/Hello-World/issues/1'
```
If you want to use the  @see {@link GitHubResourceProps#createRequestResultParameter}, you can use the following syntax (assuming you have set createRequestResultParameter to `"number"`):
```
const deleteRequestEndpoint = 'PATCH repos/octocat/Hello-World/:number'
```

---

##### `githubTokenSecret`<sup>Required</sup> <a name="githubTokenSecret" id="cdk-github.GitHubResourceProps.property.githubTokenSecret"></a>

```typescript
public readonly githubTokenSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

The AWS secret in which the OAuth GitHub (personal) access token is stored.

---

##### `createRequestPayload`<sup>Optional</sup> <a name="createRequestPayload" id="cdk-github.GitHubResourceProps.property.createRequestPayload"></a>

```typescript
public readonly createRequestPayload: string;
```

- *Type:* string

The GitHub api request payload for creating resources. This is a JSON parseable string.

Used for  @see {@link GitHubResourceProps#createRequestEndpoint}.

Example:
```
const createRequestPayload = JSON.stringify({ title: 'Found a bug', body: "I'm having a problem with this.", assignees: ['octocat'], milestone: 1, labels: ['bug'] })
```

---

##### `createRequestResultParameter`<sup>Optional</sup> <a name="createRequestResultParameter" id="cdk-github.GitHubResourceProps.property.createRequestResultParameter"></a>

```typescript
public readonly createRequestResultParameter: string;
```

- *Type:* string

Used to extract a value from the result of the createRequest(Endpoint) to be used in update/deleteRequests.

Example: `"number"` (for the issue number)

When this parameter is set and can be extracted from the result, the extracted value will be used for the PhyscialResourceId of the CustomResource.
Changing the parameter once the stack is deployed is not supported.

---

##### `deleteRequestPayload`<sup>Optional</sup> <a name="deleteRequestPayload" id="cdk-github.GitHubResourceProps.property.deleteRequestPayload"></a>

```typescript
public readonly deleteRequestPayload: string;
```

- *Type:* string

The GitHub api request payload to delete this resource. This is a JSON parseable string.

Used for  @see {@link GitHubResourceProps#deleteRequestEndpoint}.

Example:
```
const deleteRequestPayload = JSON.stringify({ state: 'closed' })
```

---

##### `updateRequestEndpoint`<sup>Optional</sup> <a name="updateRequestEndpoint" id="cdk-github.GitHubResourceProps.property.updateRequestEndpoint"></a>

```typescript
public readonly updateRequestEndpoint: string;
```

- *Type:* string

The GitHub api endpoint url to update this resource in format: `POST /repos/OWNER/REPO/issues`.

This is called when the GitHubResource is updated.

In most of the cases you want to either omit this or use the same value as createRequestEndpoint.

Example:
```
const updateRequestEndpoint = 'PATCH repos/octocat/Hello-World/issues/1'
```
If you want to use the  @see {@link GitHubResourceProps#createRequestResultParameter}, you can use the following syntax (assuming you have set createRequestResultParameter to `"number"`):
```
const updateRequestEndpoint = 'PATCH repos/octocat/Hello-World/:number'
```

---

##### `updateRequestPayload`<sup>Optional</sup> <a name="updateRequestPayload" id="cdk-github.GitHubResourceProps.property.updateRequestPayload"></a>

```typescript
public readonly updateRequestPayload: string;
```

- *Type:* string

The GitHub api request payload to update this resources. This is a JSON parseable string.

Used for  @see {@link GitHubResourceProps#createRequestEndpoint}.

Example:
```
const updateRequestPayload = JSON.stringify({ title: 'Found a bug', body: "I'm having a problem with this.", assignees: ['octocat'], milestone: 1, state: 'open', labels: ['bug'] })
```

---

##### `writeResponseToSSMParameter`<sup>Optional</sup> <a name="writeResponseToSSMParameter" id="cdk-github.GitHubResourceProps.property.writeResponseToSSMParameter"></a>

```typescript
public readonly writeResponseToSSMParameter: IParameter;
```

- *Type:* aws-cdk-lib.aws_ssm.IParameter

The response body of the last GitHub api request will be written to this ssm parameter.

---


## Protocols <a name="Protocols" id="Protocols"></a>

### IGitHubRepository <a name="IGitHubRepository" id="cdk-github.IGitHubRepository"></a>

- *Implemented By:* <a href="#cdk-github.IGitHubRepository">IGitHubRepository</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.IGitHubRepository.property.name">name</a></code> | <code>string</code> | The GitHub repository name. |
| <code><a href="#cdk-github.IGitHubRepository.property.owner">owner</a></code> | <code>string</code> | The GitHub repository owner. |

---

##### `name`<sup>Required</sup> <a name="name" id="cdk-github.IGitHubRepository.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

The GitHub repository name.

---

##### `owner`<sup>Optional</sup> <a name="owner" id="cdk-github.IGitHubRepository.property.owner"></a>

```typescript
public readonly owner: string;
```

- *Type:* string
- *Default:* user account which owns the personal access token

The GitHub repository owner.

---

