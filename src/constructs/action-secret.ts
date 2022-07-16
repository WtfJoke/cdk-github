import { CustomResource, Duration, Names, Stack } from 'aws-cdk-lib';
import { Architecture } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { ActionSecretHandlerFunction } from '../handler/secrets/action-secrets';
import { ActionSecretEventProps } from '../types';
import { IGitHubRepository, ISecretString } from '../types/exported';

export interface ActionSecretProps {
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
}

export class ActionSecret extends Construct {
  constructor(scope: Construct, id: string, props: ActionSecretProps) {
    super(scope, id);
    const { githubToken, actionSecretName, repository, secretToBeStored } = props;
    const stack = Stack.of(this);
    const awsRegion = stack.region;
    const shortId = Names.uniqueId(this).slice(-8);

    const handler = new ActionSecretHandlerFunction(this, 'CustomResourceHandler', {
      functionName: 'GitHubActionSecretCustomResourceHandler' + shortId,
      description: 'Handles the creation/deletion of a GitHub Action (repository) secret - created by cdk-github',
      architecture: Architecture.ARM_64,
      timeout: Duration.minutes(10),
    });

    githubToken.grantRead(handler);
    secretToBeStored.grantRead(handler);

    const provider = new Provider(this, 'SecretProvider', {
      onEventHandler: handler,
      logRetention: RetentionDays.ONE_WEEK,
    });

    const githubRepositorySecretEventProps: ActionSecretEventProps = {
      githubTokenSecret: githubToken.serialize(stack),
      repositoryOwner: repository.owner,
      repositoryName: repository.name,
      sourceSecret: secretToBeStored.serialize(stack),
      actionSecretName,
      awsRegion,
    };

    new CustomResource(this, 'CustomResource', {
      serviceToken: provider.serviceToken,
      resourceType: 'Custom::GitHubActionSecret',
      properties: githubRepositorySecretEventProps,
    });
  }
}
