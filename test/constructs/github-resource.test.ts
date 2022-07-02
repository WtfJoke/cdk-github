import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { GitHubResource } from '../../src';
import { GitHubResourceEventProps } from '../../src/types';

describe('GithubResourceTestStack', () => {
  let template: Template;

  beforeAll(() => {
    template = getTemplate();
  });

  it('Should include custom resource handler', () => {
    template.hasResourceProperties('AWS::Lambda::Function', {
      FunctionName: Match.stringLikeRegexp('GitHubResourceCustomResourceHandler'),
      Description: Match.stringLikeRegexp('created by cdk-github'),
    });
  });

  it('Should include ssm parameter', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/cdk-github/github-resource/GitHubResourceIssueTestStack',
      Type: 'String',
      Value: 'UNFILLED',
    });
  });

  it('Should include github resource', () => {
    template.hasResourceProperties('Custom::GitHubResource', {
      createRequestEndpoint: 'POST /repos/WtfJoke/dummytest/issues',
      createRequestPayload: defaultProps.createRequestPayload,
      createRequestResultParameter: 'number',
      deleteRequestEndpoint: 'PATCH /repos/WtfJoke/dummytest/issues/:number',
      deleteRequestPayload: '{"state":"closed"}',
      createRequestResultValueSSMParameterName: Match.anyValue(),
    });
  });

  it('Should include github resource with update endpoint', () => {
    const updateProps = { ...defaultProps, updateRequestEndpoint: 'PATCH /repos/WtfJoke/dummytest/issues/:number', updateRequestPayload: JSON.stringify({ body: "I'm editing this issue ;)" }) };
    getTemplate(updateProps).hasResourceProperties('Custom::GitHubResource', {
      createRequestEndpoint: 'POST /repos/WtfJoke/dummytest/issues',
      createRequestPayload: defaultProps.createRequestPayload,
      createRequestResultParameter: 'number',
      updateRequestEndpoint: 'PATCH /repos/WtfJoke/dummytest/issues/:number',
      updateRequestPayload: '{"body":"I\'m editing this issue ;)"}',
      deleteRequestEndpoint: 'PATCH /repos/WtfJoke/dummytest/issues/:number',
      deleteRequestPayload: '{"state":"closed"}',
      createRequestResultValueSSMParameterName: Match.anyValue(),
    });
  });

  const getTemplate = (props?: GithubResourceTestStackProps) => {
    const app = new App();
    const stack = new GithubResourceTestStack(app, 'GitHubResourceIssueTestStack', props ? props : defaultProps);

    return Template.fromStack(stack);
  };
});

type GithubResourceTestStackProps = StackProps & Partial<GitHubResourceEventProps>

const defaultProps: GitHubResourceEventProps = {
  githubTokenSecret: 'GITHUB_TOKEN',
  awsRegion: 'eu-central-1',
  createRequestEndpoint: 'POST /repos/WtfJoke/dummytest/issues',
  createRequestPayload: JSON.stringify({ title: 'Testing cdk-github', body: "I'm opening an issue by using aws cdk 🎉", labels: ['bug'] }),
  createRequestResultParameter: 'number',
  deleteRequestEndpoint: 'PATCH /repos/WtfJoke/dummytest/issues/:number',
  deleteRequestPayload: JSON.stringify({ state: 'closed' }),
};

class GithubResourceTestStack extends Stack {
  constructor(scope: Construct, id: string, props: GithubResourceTestStackProps) {
    super(scope, id, props);
    const {
      githubTokenSecret = defaultProps.githubTokenSecret,
      createRequestEndpoint = defaultProps.createRequestEndpoint,
      createRequestPayload = defaultProps.createRequestPayload,
      createRequestResultParameter = defaultProps.createRequestResultParameter,
      createRequestResultValueSSMParameterName = defaultProps.createRequestResultValueSSMParameterName,
      deleteRequestEndpoint = defaultProps.deleteRequestEndpoint,
      deleteRequestPayload = defaultProps.deleteRequestPayload,
      updateRequestEndpoint,
      updateRequestPayload,
    } = props;

    new GitHubResource(this, 'Issue', {
      createRequestEndpoint,
      createRequestPayload,
      createRequestResultParameter,
      deleteRequestEndpoint,
      deleteRequestPayload,
      updateRequestEndpoint,
      updateRequestPayload,
      writeResponseToSSMParameter: createRequestResultValueSSMParameterName ? StringParameter.fromStringParameterName(this, 'resultParam', createRequestResultValueSSMParameterName) : undefined,
      githubTokenSecret: Secret.fromSecretNameV2(this, 'ghSecret', githubTokenSecret),
    });
  }
}
