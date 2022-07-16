import { CustomResource, Duration, Names, Stack } from 'aws-cdk-lib';
import { Architecture } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { ActionEnvironmentSecretHandlerFunction } from '../handler/secrets/action-environment-secrets';
import { ActionEnvironmentSecretEventProps } from '../types';
import { IGitHubRepository, ISecretString } from '../types/exported';

export interface ActionEnvironmentSecretProps {
  /**
   * The AWS secret in which the OAuth GitHub (personal) access token is stored.
   */
  readonly githubToken: ISecretString;

  /**
   * The GitHub repository information (owner and name).
   */
  readonly repository: IGitHubRepository;

  /**
   * This AWS secret value will be stored in GitHub as a secret (under the name of actionSecretName).
   */
  readonly secretToBeStored: ISecretString;

  /**
   * The GitHub secret name to be stored.
   */
  readonly actionSecretName: string;

  /**
   * The GithHub environment name which the secret should be stored in.
   */
  readonly environment: string;
}

export class ActionEnvironmentSecret extends Construct {
  constructor(scope: Construct, id: string, props: ActionEnvironmentSecretProps) {
    super(scope, id);
    const { githubToken, actionSecretName, repository, secretToBeStored, environment } = props;
    const stack = Stack.of(this);
    const awsRegion = stack.region;
    const shortId = Names.uniqueId(this).slice(-8);

    const handler = new ActionEnvironmentSecretHandlerFunction(this, 'CustomResourceHandler', {
      functionName: 'GitHubActionEnvironmentSecretCustomResourceHandler' + shortId,
      description: 'Handles the creation/deletion of a GitHub Action environment secret - created by cdk-github',
      architecture: Architecture.ARM_64,
      timeout: Duration.minutes(10),
    });

    githubToken.grantRead(handler);
    secretToBeStored.grantRead(handler);

    const provider = new Provider(this, 'CustomResourceProvider', {
      onEventHandler: handler,
      logRetention: RetentionDays.ONE_WEEK,
    });

    const githubRepositorySecretEventProps: ActionEnvironmentSecretEventProps = {
      environment,
      githubTokenSecret: githubToken.serialize(stack),
      repositoryOwner: repository.owner,
      repositoryName: repository.name,
      sourceSecret: secretToBeStored.serialize(stack),
      actionSecretName,
      awsRegion,
    };

    new CustomResource(this, 'CustomResource', {
      serviceToken: provider.serviceToken,
      resourceType: 'Custom::GitHubActionEnvironmentSecret',
      properties: githubRepositorySecretEventProps,
    });
  }
}
