import * as path from 'path';
import { CustomResource, Duration, Stack } from 'aws-cdk-lib';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { ActionEnvironmentSecretEventProps } from '../types';

export interface ActionEnvironmentSecretProps {
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
   * The GithHub environment which the secret should be stored in
   */
  readonly environment: string;

  /**
   * The AWS secret which should be stored as a GitHub as a secret
   */
  readonly sourceSecret: ISecret;
}

export class ActionEnvironmentSecret extends Construct {
  constructor(scope: Construct, id: string, props: ActionEnvironmentSecretProps) {
    super(scope, id);
    const { githubTokenSecret, repositorySecretName, repositoryName, repositoryOwner, sourceSecret, environment } = props;
    const awsRegion = Stack.of(this).region;

    const handler = new NodejsFunction(this, 'CustomResourceHandler', {
      functionName: 'GitHubActionEnvironmentSecretCustomResourceHandler',
      description: 'Handles the creation/deletion of a GitHub Action environment secret - created by cdk-github',
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, '..', 'handler', 'action-environment-secrets', 'action-environment-secret-handler.ts'),
      architecture: Architecture.ARM_64,
      timeout: Duration.minutes(10),
    });

    githubTokenSecret.grantRead(handler);
    sourceSecret.grantRead(handler);

    const provider = new Provider(this, 'CustomResourceProvider', {
      onEventHandler: handler,
      logRetention: RetentionDays.ONE_WEEK,
    });

    const githubRepositorySecretEventProps: ActionEnvironmentSecretEventProps = {
      environment,
      githubTokenSecret: githubTokenSecret.secretArn,
      repositoryOwner,
      repositoryName,
      sourceSecretArn: sourceSecret.secretArn,
      repositorySecretName,
      awsRegion,
    };

    new CustomResource(this, 'CustomResource', {
      serviceToken: provider.serviceToken,
      resourceType: 'Custom::GitHubActionEnvironmentSecret',
      properties: githubRepositorySecretEventProps,
    });
  }
}
