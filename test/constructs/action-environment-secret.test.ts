import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { ActionEnvironmentSecret } from '../../src';

describe('ActionEnvironmentSecretStack', () => {
  let template: Template;

  beforeAll(() => {
    template = getTemplate();
  });

  it('Should match snapshot', () => {
    expect(template).toMatchSnapshot();
  });

  it('Should include custom resource handler', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: Match.stringLikeRegexp('GitHubActionEnvironmentSecretCustomResourceHandler'),
      Description: Match.stringLikeRegexp('created by cdk-github'),
    });
  });

  it('Should include github action environment secret', () => {
    template.hasResourceProperties('Custom::GitHubActionEnvironmentSecret', {
      repositoryName: 'cdk-github',
      repositorySecretName: 'A_RANDOM_TEST_GITHUB_ENVIRONMENT_SECRET',
      environment: 'dev',
    });
  });

  it('Should include github action environment secret with predefined owner', () => {
    getTemplate({ repositoryOwner: 'octocat', repositoryName: 'cdk-octocat', repositorySecretName: 'MY_SECRET_FISH_SPOT', environment: 'nature' })
      .hasResourceProperties('Custom::GitHubActionEnvironmentSecret', {
        repositoryName: 'cdk-octocat',
        repositorySecretName: 'MY_SECRET_FISH_SPOT',
        repositoryOwner: 'octocat',
        environment: 'nature',
      });
  });

  const getTemplate = (props?: ActionEnvironmentSecretStackProps) => {
    const app = new App();
    const stack = new ActionEnvironmentSecretTestStack(app, 'ActionEnvironmentSecretTestStack', props ? props : defaultProps);

    return Template.fromStack(stack);
  };
});

type ActionEnvironmentSecretStackProps = StackProps & {
  repositoryOwner?: string;
  repositoryName?: string;
  repositorySecretName?: string;
  githubTokenSecretName?: string;
  sourceSecretName?: string;
  environment?: string;
}

const defaultProps = {
  repositoryName: 'cdk-github',
  repositorySecretName: 'A_RANDOM_TEST_GITHUB_ENVIRONMENT_SECRET',
  githubTokenSecretName: 'GITHUB_TOKEN',
  sourceSecretName: 'testcdkgithub',
  environment: 'dev',
};

class ActionEnvironmentSecretTestStack extends Stack {
  constructor(scope: Construct, id: string, props: ActionEnvironmentSecretStackProps) {
    super(scope, id, props);
    const {
      repositoryName = defaultProps.repositoryName,
      repositorySecretName = defaultProps.repositorySecretName,
      githubTokenSecretName = defaultProps.githubTokenSecretName,
      sourceSecretName = defaultProps.sourceSecretName,
      environment = defaultProps.environment,
      repositoryOwner,
    } = props;

    new ActionEnvironmentSecret(this, 'ActionEnvironmentSecret', {
      repository: { name: repositoryName, owner: repositoryOwner },
      repositorySecretName,
      githubTokenSecret: Secret.fromSecretNameV2(this, 'ghSecret', githubTokenSecretName),
      sourceSecret: Secret.fromSecretNameV2(this, 'secretToStoreInGitHub', sourceSecretName),
      environment,
    });
  }
}
