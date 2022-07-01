import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { ActionSecret } from '../../src';

describe('ActionSecretStack', () => {
  let template: Template;

  beforeAll(() => {
    template = getTemplate();
  });

  it('Should include custom resource handler', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: Match.stringLikeRegexp('GitHubActionSecretCustomResourceHandler'),
      Description: Match.stringLikeRegexp('created by cdk-github'),
    });
  });

  it('Should include github action secret', () => {
    template.hasResourceProperties('Custom::GitHubActionSecret', {
      repositoryName: 'cdk-github',
      repositorySecretName: 'A_RANDOM_TEST_GITHUB_SECRET',
    });
  });

  it('Should include github action secret with predefined owner', () => {
    getTemplate({ repositoryOwner: 'octocat', repositoryName: 'cdk-octocat', repositorySecretName: 'MY_SECRET_FISH_SPOT' })
      .hasResourceProperties('Custom::GitHubActionSecret', {
        repositoryName: 'cdk-octocat',
        repositorySecretName: 'MY_SECRET_FISH_SPOT',
        repositoryOwner: 'octocat',
      });
  });

  const getTemplate = (props?: ActionSecretStackProps) => {
    const app = new App();
    const stack = new ActionSecretTestStack(app, 'ActionSecretTestStack', props ? props : defaultProps);

    return Template.fromStack(stack);
  };
});

type ActionSecretStackProps = StackProps & {
  repositoryOwner?: string;
  repositoryName?: string;
  repositorySecretName?: string;
  githubTokenSecretName?: string;
  sourceSecretName?: string;
}

const defaultProps = {
  repositoryName: 'cdk-github',
  repositorySecretName: 'A_RANDOM_TEST_GITHUB_SECRET',
  githubTokenSecretName: 'GITHUB_TOKEN',
  sourceSecretName: 'testcdkgithub',
};

class ActionSecretTestStack extends Stack {
  constructor(scope: Construct, id: string, props: ActionSecretStackProps) {
    super(scope, id, props);
    const {
      repositoryName = defaultProps.repositoryName,
      repositorySecretName = defaultProps.repositorySecretName,
      githubTokenSecretName = defaultProps.githubTokenSecretName,
      sourceSecretName = defaultProps.sourceSecretName,
      repositoryOwner,
    } = props;

    new ActionSecret(this, 'ActionSecret', {
      repositoryName,
      repositorySecretName,
      githubTokenSecret: Secret.fromSecretNameV2(this, 'ghSecret', githubTokenSecretName),
      sourceSecret: Secret.fromSecretNameV2(this, 'secretToStoreInGitHub', sourceSecretName),
      repositoryOwner,
    });
  }
}
