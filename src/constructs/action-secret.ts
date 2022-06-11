import * as fs from 'fs';
import * as path from 'path';
import { CustomResource, Duration, Stack } from 'aws-cdk-lib';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { ActionSecretEventProps } from '../types';

export interface ActionSecretProps {
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

export class ActionSecret extends Construct {
  constructor(scope: Construct, id: string, props: ActionSecretProps) {
    super(scope, id);
    const { githubTokenSecret, repositorySecretName, repositoryName, repositoryOwner, sourceSecret } = props;
    const awsRegion = Stack.of(this).region;
    const codeBasePath = path.join(__dirname, '..', 'handler', 'action-secrets');
    const handlerFileName = 'action-secret-handler';
    // When installed as a package, there are no .ts files in the node modules folder
    const extension = fs.existsSync(path.join(codeBasePath, `${handlerFileName}.js`)) ? '.js' : '.ts';

    const handler = new NodejsFunction(this, 'CustomResourceHandler', {
      functionName: 'GitHubActionSecretCustomResourceHandler',
      description: 'Handles the creation/deletion of a GitHub Action (repository) secret - created by cdk-github',
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(codeBasePath, handlerFileName + extension),
      architecture: Architecture.ARM_64,
      timeout: Duration.minutes(10),
    });

    githubTokenSecret.grantRead(handler);
    sourceSecret.grantRead(handler);

    const provider = new Provider(this, 'SecretProvider', {
      onEventHandler: handler,
      logRetention: RetentionDays.ONE_WEEK,
    });

    const githubRepositorySecretEventProps: ActionSecretEventProps = {
      githubTokenSecret: githubTokenSecret.secretArn,
      repositoryOwner,
      repositoryName,
      sourceSecretArn: sourceSecret.secretArn,
      repositorySecretName,
      awsRegion,
    };

    new CustomResource(this, 'CustomResource', {
      serviceToken: provider.serviceToken,
      resourceType: 'Custom::GitHubActionSecret',
      properties: githubRepositorySecretEventProps,
    });
  }
}
