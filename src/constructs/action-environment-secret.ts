import { CustomResource, Duration, Names, Stack } from 'aws-cdk-lib';
import { Architecture } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { ISecret } from 'aws-cdk-lib/aws-secretsmanager';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { ActionEnvironmentSecretHandlerFunction } from '../handler/secrets/action-environment-secrets';
import { ActionEnvironmentSecretEventProps } from '../types';
import { IGitHubRepository } from '../types/exported';

export interface ActionEnvironmentSecretProps {
  /**
   * The AWS secret in which the OAuth GitHub (personal) access token is stored
   */
  readonly githubTokenSecret: ISecret;

  /**
   * The GitHub repository information (owner and name)
   */
  readonly repository: IGitHubRepository;

  /**
   * The GitHub secret name to be stored
   */
  readonly repositorySecretName: string;

  /**
   * The GithHub environment name which the secret should be stored in
   */
  readonly environment: string;

  /**
   * This AWS secret value will be stored in GitHub as a secret (under the name of repositorySecretName)
   */
  readonly sourceSecret: ISecret;

  /**
   * The key of a JSON field to retrieve in sourceSecret.
   * This can only be used if the secret stores a JSON object.
   *
   * @default - returns all the content stored in the Secrets Manager secret.
   */
  readonly sourceSecretJsonField?: string;
}

export class ActionEnvironmentSecret extends Construct {
  constructor(scope: Construct, id: string, props: ActionEnvironmentSecretProps) {
    super(scope, id);
    const { githubTokenSecret, repositorySecretName, repository, sourceSecret, sourceSecretJsonField, environment } = props;
    const awsRegion = Stack.of(this).region;
    const shortId = Names.uniqueId(this).slice(-8);

    const handler = new ActionEnvironmentSecretHandlerFunction(this, 'CustomResourceHandler', {
      functionName: 'GitHubActionEnvironmentSecretCustomResourceHandler' + shortId,
      description: 'Handles the creation/deletion of a GitHub Action environment secret - created by cdk-github',
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
      repositoryOwner: repository.owner,
      repositoryName: repository.name,
      sourceSecretArn: sourceSecret.secretArn,
      sourceSecretJsonField,
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
