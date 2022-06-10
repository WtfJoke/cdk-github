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
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.environment">environment</a></code> | <code>string</code> | The GithHub environment which the secret should be stored in. |
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.githubTokenSecret">githubTokenSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | The AWS secret in which the OAuth GitHub (personal) access token is stored. |
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.repositoryName">repositoryName</a></code> | <code>string</code> | The GitHub repository name. |
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.repositoryOwner">repositoryOwner</a></code> | <code>string</code> | The GitHub repository owner. |
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.repositorySecretName">repositorySecretName</a></code> | <code>string</code> | The GitHub secret name to be stored. |
| <code><a href="#cdk-github.ActionEnvironmentSecretProps.property.sourceSecret">sourceSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | The AWS secret which should be stored as a GitHub as a secret. |

---

##### `environment`<sup>Required</sup> <a name="environment" id="cdk-github.ActionEnvironmentSecretProps.property.environment"></a>

```typescript
public readonly environment: string;
```

- *Type:* string

The GithHub environment which the secret should be stored in.

---

##### `githubTokenSecret`<sup>Required</sup> <a name="githubTokenSecret" id="cdk-github.ActionEnvironmentSecretProps.property.githubTokenSecret"></a>

```typescript
public readonly githubTokenSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

The AWS secret in which the OAuth GitHub (personal) access token is stored.

---

##### `repositoryName`<sup>Required</sup> <a name="repositoryName" id="cdk-github.ActionEnvironmentSecretProps.property.repositoryName"></a>

```typescript
public readonly repositoryName: string;
```

- *Type:* string

The GitHub repository name.

---

##### `repositoryOwner`<sup>Required</sup> <a name="repositoryOwner" id="cdk-github.ActionEnvironmentSecretProps.property.repositoryOwner"></a>

```typescript
public readonly repositoryOwner: string;
```

- *Type:* string

The GitHub repository owner.

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

The AWS secret which should be stored as a GitHub as a secret.

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
| <code><a href="#cdk-github.ActionSecretProps.property.repositoryName">repositoryName</a></code> | <code>string</code> | The GitHub repository name. |
| <code><a href="#cdk-github.ActionSecretProps.property.repositoryOwner">repositoryOwner</a></code> | <code>string</code> | The GitHub repository owner. |
| <code><a href="#cdk-github.ActionSecretProps.property.repositorySecretName">repositorySecretName</a></code> | <code>string</code> | The GitHub secret name to be stored. |
| <code><a href="#cdk-github.ActionSecretProps.property.sourceSecret">sourceSecret</a></code> | <code>aws-cdk-lib.aws_secretsmanager.ISecret</code> | The AWS secret which should be stored as a GitHub as a secret. |

---

##### `githubTokenSecret`<sup>Required</sup> <a name="githubTokenSecret" id="cdk-github.ActionSecretProps.property.githubTokenSecret"></a>

```typescript
public readonly githubTokenSecret: ISecret;
```

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

The AWS secret in which the OAuth GitHub (personal) access token is stored.

---

##### `repositoryName`<sup>Required</sup> <a name="repositoryName" id="cdk-github.ActionSecretProps.property.repositoryName"></a>

```typescript
public readonly repositoryName: string;
```

- *Type:* string

The GitHub repository name.

---

##### `repositoryOwner`<sup>Required</sup> <a name="repositoryOwner" id="cdk-github.ActionSecretProps.property.repositoryOwner"></a>

```typescript
public readonly repositoryOwner: string;
```

- *Type:* string

The GitHub repository owner.

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

The AWS secret which should be stored as a GitHub as a secret.

---



