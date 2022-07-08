const { awscdk, vscode, Task, DevEnvironmentDockerImage } = require('projen');
const { UpgradeDependenciesSchedule } = require('projen/lib/javascript');

const project = new awscdk.AwsCdkConstructLibrary({
  author: 'WtfJoke',
  authorName: 'Manuel',
  authorAddress: 'https://github.com/wtfjoke/',
  copyrightOwner: 'Manuel <WtfJoke>',
  copyrightPeriod: '2022',
  license: 'MIT',
  repositoryUrl: 'https://github.com/WtfJoke/cdk-github',
  description: "AWS CDK Construct Library to interact with GitHub's API.",
  keywords: ['cdk', 'github', 'constructs', 'aws', 'ci/cd'],
  stability: 'experimental',

  name: 'cdk-github',
  cdkVersion: '2.25.0',
  defaultReleaseBranch: 'main',
  deps: ['@octokit/core', 'libsodium', 'libsodium-wrappers', '@aws-sdk/client-secrets-manager', '@aws-sdk/client-ssm'], /* Runtime dependencies of this module. */
  bundledDeps: ['@octokit/core', 'libsodium', 'libsodium-wrappers', '@aws-sdk/client-secrets-manager', '@aws-sdk/client-ssm'], /* Dependencies that are bundled with this module. */
  devDeps: ['esbuild', '@types/libsodium-wrappers', '@types/aws-lambda', 'nock', 'aws-sdk-client-mock'], /* Build dependencies for this module. */
  gitignore: ['cdk.out'],
  scripts: {
    'cdk:actionsecret:deploy': 'npx cdk deploy --app "npx ts-node --prefer-ts-exts src/examples/action-secret/action-secret-app.ts"',
    'cdk:actionenvironmentsecret:deploy': 'npx cdk deploy --app "npx ts-node --prefer-ts-exts src/examples/action-environment-secret/action-environment-secret-app.ts"',
    'cdk:githubresourceissue:deploy': 'npx cdk deploy --app "npx ts-node --prefer-ts-exts src/examples/github-resource/github-resource-issue-app.ts"',
  },
  depsUpgradeOptions: {
    workflowOptions: {
      schedule: UpgradeDependenciesSchedule.MONTHLY,
    },
  },
  autoApproveUpgrades: true,
  autoApproveOptions: {
    allowedUsernames: ['BAutoBot'],
    secret: 'PR_APPROVE_GITHUB_TOKEN',
  },
  lambdaOptions: {
    runtime: awscdk.LambdaRuntime.NODEJS_16_X,
  },
  publishToPypi: {
    distName: 'cdk-github',
    module: 'cdkgithub',
  },
  publishToNuget: {
    packageId: 'CdkGithub',
    dotNetNamespace: 'WtfJoke.CdkGithub',
  },
  publishToGo: {
    moduleName: 'github.com/WtfJoke/cdk-github-go',
  },
  publishToMaven: {
    mavenGroupId: 'io.github.wtfjoke',
    javaPackage: 'io.github.wtfjoke.cdk.github',
    mavenArtifactId: 'cdk-github',
    mavenEndpoint: 'https://s01.oss.sonatype.org/',
  },
  codeCov: true,
});

new vscode.DevContainer(project, {
  dockerImage: DevEnvironmentDockerImage.fromImage('jsii/superchain:1-buster-slim-node16'),
  tasks: [new Task('yarn install', { exec: 'yarn install' }), new Task('yarn lint')],
  vscodeExtensions: ['dbaeumer.vscode-eslint@2.1.5'],
});

project.synth();