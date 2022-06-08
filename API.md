# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### GitHubRepositorySecret <a name="GitHubRepositorySecret" id="cdk-github.GitHubRepositorySecret"></a>

#### Initializers <a name="Initializers" id="cdk-github.GitHubRepositorySecret.Initializer"></a>

```typescript
import { GitHubRepositorySecret } from 'cdk-github'

new GitHubRepositorySecret(scope: Construct, id: string, props: GitHubRepositorySecretProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.GitHubRepositorySecret.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-github.GitHubRepositorySecret.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-github.GitHubRepositorySecret.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-github.GitHubRepositorySecretProps">GitHubRepositorySecretProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-github.GitHubRepositorySecret.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-github.GitHubRepositorySecret.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-github.GitHubRepositorySecret.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-github.GitHubRepositorySecretProps">GitHubRepositorySecretProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-github.GitHubRepositorySecret.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="cdk-github.GitHubRepositorySecret.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-github.GitHubRepositorySecret.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-github.GitHubRepositorySecret.isConstruct"></a>

```typescript
import { GitHubRepositorySecret } from 'cdk-github'

GitHubRepositorySecret.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-github.GitHubRepositorySecret.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.GitHubRepositorySecret.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-github.GitHubRepositorySecret.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### GitHubRepositorySecretProps <a name="GitHubRepositorySecretProps" id="cdk-github.GitHubRepositorySecretProps"></a>

#### Initializer <a name="Initializer" id="cdk-github.GitHubRepositorySecretProps.Initializer"></a>

```typescript
import { GitHubRepositorySecretProps } from 'cdk-github'

const gitHubRepositorySecretProps: GitHubRepositorySecretProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-github.GitHubRepositorySecretProps.property.githubTokenSecret">githubTokenSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | The AWS secret in which the OAuth GitHub (personal) access token is stored. |
| <code><a href="#cdk-github.GitHubRepositorySecretProps.property.repositoryName">repositoryName</a></code> | <code>string</code> | The GitHub repository name. |
| <code><a href="#cdk-github.GitHubRepositorySecretProps.property.repositoryOwner">repositoryOwner</a></code> | <code>string</code> | The GitHub repository owner. |
| <code><a href="#cdk-github.GitHubRepositorySecretProps.property.repositorySecretName">repositorySecretName</a></code> | <code>string</code> | The GitHub secret name to be stored. |
| <code><a href="#cdk-github.GitHubRepositorySecretProps.property.sourceSecret">sourceSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | The AWS secret which should be stored as a GitHub as a secret. |

---

##### `githubTokenSecret`<sup>Required</sup> <a name="githubTokenSecret" id="cdk-github.GitHubRepositorySecretProps.property.githubTokenSecret"></a>

```typescript
public readonly githubTokenSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

The AWS secret in which the OAuth GitHub (personal) access token is stored.

---

##### `repositoryName`<sup>Required</sup> <a name="repositoryName" id="cdk-github.GitHubRepositorySecretProps.property.repositoryName"></a>

```typescript
public readonly repositoryName: string;
```

- *Type:* string

The GitHub repository name.

---

##### `repositoryOwner`<sup>Required</sup> <a name="repositoryOwner" id="cdk-github.GitHubRepositorySecretProps.property.repositoryOwner"></a>

```typescript
public readonly repositoryOwner: string;
```

- *Type:* string

The GitHub repository owner.

---

##### `repositorySecretName`<sup>Required</sup> <a name="repositorySecretName" id="cdk-github.GitHubRepositorySecretProps.property.repositorySecretName"></a>

```typescript
public readonly repositorySecretName: string;
```

- *Type:* string

The GitHub secret name to be stored.

---

##### `sourceSecret`<sup>Required</sup> <a name="sourceSecret" id="cdk-github.GitHubRepositorySecretProps.property.sourceSecret"></a>

```typescript
public readonly sourceSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

The AWS secret which should be stored as a GitHub as a secret.

---



