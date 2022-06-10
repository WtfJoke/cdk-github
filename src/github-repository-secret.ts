import * as path from 'path';
import { CustomResource, Duration, Stack } from 'aws-cdk-lib';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export interface GitHubRepositorySecretProps {
  /**
   * The AWS secret in which the OAuth GitHub (personal) access token is stored
   */
  readonly githubTokenSecret: ISecret;

  /**
   * The GitHub repository owner
   */
  readonly repositoryOwner: string;

  /**
   * The GitHub repository name
   */
  readonly repositoryName: string;

  /**
   * The GitHub secret name to be stored
   */
  readonly repositorySecretName: string;

  /**
   * The AWS secret which should be stored as a GitHub as a secret
   */
  readonly sourceSecret: ISecret;
}

export class GitHubRepositorySecret extends Construct {
  constructor(scope: Construct, id: string, props: GitHubRepositorySecretProps) {
    super(scope, id);
    const { githubTokenSecret, repositorySecretName, repositoryName, repositoryOwner, sourceSecret } = props;
    const awsRegion = Stack.of(this).region;

    const handler = new NodejsFunction(this, 'CustomResourceHandler', {
      functionName: 'GitHubRepositorySecretCustomResourceHandler',
      description: 'Handles the creation/deletion of a GitHub repository secret - created by cdk-github',
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, 'handler', 'github-repository-secret', 'github-repository-secret-handler.ts'),
      architecture: Architecture.ARM_64,
      timeout: Duration.minutes(10),
    });

    githubTokenSecret.grantRead(handler);
    sourceSecret.grantRead(handler);

    const provider = new Provider(this, 'SecretProvider', {
      onEventHandler: handler,
      logRetention: RetentionDays.ONE_WEEK,
    });

    new CustomResource(this, 'CustomResource', {
      serviceToken: provider.serviceToken,
      resourceType: 'Custom::GithubRepositorySecret',
      properties: {
        githubTokenSecret: githubTokenSecret.secretArn,
        repositoryOwner,
        repositoryName,
        sourceSecretArn: sourceSecret.secretArn,
        repositorySecretName,
        awsRegion,
      },
    });
  }
}
