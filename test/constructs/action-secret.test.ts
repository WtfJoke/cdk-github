import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { ActionSecret, SecretString } from '../../src';

describe('ActionSecretStack', () => {
  let template: Template;

  beforeAll(() => {
    template = getTemplate();
  });


  it('Should match snapshot', () => {
    expect(template).toMatchSnapshot();
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
      actionSecretName: 'A_RANDOM_TEST_GITHUB_SECRET',
    });
  });

  it('Should include github action secret with predefined owner', () => {
    getTemplate({ repositoryOwner: 'octocat', repositoryName: 'cdk-octocat', actionSecretName: 'MY_SECRET_FISH_SPOT' })
      .hasResourceProperties('Custom::GitHubActionSecret', {
        repositoryName: 'cdk-octocat',
        repositoryOwner: 'octocat',
        actionSecretName: 'MY_SECRET_FISH_SPOT',
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
  actionSecretName?: string;
  githubTokenSecretName?: string;
  secretNameToBeStored?: string;
}

const defaultProps = {
  repositoryName: 'cdk-github',
  actionSecretName: 'A_RANDOM_TEST_GITHUB_SECRET',
  githubTokenSecretName: 'GITHUB_TOKEN',
  secretNameToBeStored: 'testcdkgithub',
};

class ActionSecretTestStack extends Stack {
  constructor(scope: Construct, id: string, props: ActionSecretStackProps) {
    super(scope, id, props);
    const {
      repositoryName = defaultProps.repositoryName,
      actionSecretName = defaultProps.actionSecretName,
      githubTokenSecretName = defaultProps.githubTokenSecretName,
      secretNameToBeStored = defaultProps.secretNameToBeStored,
      repositoryOwner,
    } = props;

    new ActionSecret(this, 'ActionSecret', {
      repository: { name: repositoryName, owner: repositoryOwner },
      githubToken: SecretString.fromSecretsManager(Secret.fromSecretNameV2(this, 'ghSecret', githubTokenSecretName)),
      secretToBeStored: SecretString.fromSecretsManager(Secret.fromSecretNameV2(this, 'secretToStoreInGitHub', secretNameToBeStored)),
      actionSecretName,
    });
  }
}
