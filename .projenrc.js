const { awscdk } = require('projen');
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
  deps: ['@octokit/core', 'libsodium', 'libsodium-wrappers', '@aws-sdk/client-secrets-manager'], /* Runtime dependencies of this module. */
  bundledDeps: ['@octokit/core', 'libsodium', 'libsodium-wrappers', '@aws-sdk/client-secrets-manager'], /* Dependencies that are bundled with this module. */
  devDeps: ['esbuild', '@types/libsodium-wrappers', '@types/aws-lambda', 'nock', 'aws-sdk-client-mock'], /* Build dependencies for this module. */
  gitignore: ['cdk.out'],
  scripts: {
    'cdk:actionsecret:deploy': 'npx cdk deploy --app "npx ts-node --prefer-ts-exts src/examples/action-secret/action-secret-app.ts"',
    'cdk:actionenvironmentsecret:deploy': 'npx cdk deploy --app "npx ts-node --prefer-ts-exts src/examples/action-environment-secret/action-environment-secret-app.ts"',
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
    moduleName: 'github.com/WtfJoke/cdk-github',
    githubTokenSecret: 'PROJEN_GITHUB_TOKEN',
  },
  codeCov: true,
});
project.synth();