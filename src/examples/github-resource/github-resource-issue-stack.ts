import { Stack, StackProps } from 'aws-cdk-lib';
import { Secret } from 'aws-cdk-lib/aws-secretsmanager';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';
import { GitHubResource } from '../../constructs';


export class GitHubResourceIssueStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const githubTokenSecret = Secret.fromSecretNameV2(this, 'ghSecret', 'GITHUB_TOKEN');
    const createRequestResultParameter = 'number';
    const writeResponseToSSMParameter = StringParameter.fromSecureStringParameterAttributes(this, 'responseBody', { parameterName: '/cdk-github/encrypted-response' });

    new GitHubResource(this, 'GitHubIssue', {
      githubTokenSecret,
      createRequestEndpoint: 'POST /repos/WtfJoke/dummytest/issues',
      createRequestPayload: JSON.stringify({ title: 'Testing cdk-github', body: "I'm opening an issue by using aws cdk 🎉", labels: ['bug'] }),
      createRequestResultParameter,
      deleteRequestEndpoint: `PATCH /repos/WtfJoke/dummytest/issues/:${createRequestResultParameter}`,
      deleteRequestPayload: JSON.stringify({ state: 'closed' }),
      writeResponseToSSMParameter,
    });
  }
}
