const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Manuel',
  authorAddress: 'wtfjoke@livenet.ch',
  cdkVersion: '2.25.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-github',
  repositoryUrl: 'https://github.com/wtfjoke/cdk-github.git',
  license: 'MIT',
  copyrightOwner: 'Manuel <WtfJoke>',
  copyrightPeriod: '2022',

  deps: ['@octokit/rest', 'libsodium', 'libsodium-wrappers', '@aws-sdk/client-secrets-manager'], /* Runtime dependencies of this module. */
  bundledDeps: ['@octokit/rest', 'libsodium', 'libsodium-wrappers', '@aws-sdk/client-secrets-manager'], /* Dependencies that are bundled with this module. */
  description: 'A CDK library for GitHub',
  devDeps: ['esbuild', '@types/libsodium-wrappers', '@types/aws-lambda', 'nock', 'aws-sdk-client-mock'], /* Build dependencies for this module. */
  gitignore: ['cdk.out'],
  scripts: {
    'cdk:actionsecret:deploy': 'npx cdk deploy --app "npx ts-node --prefer-ts-exts src/examples/action-secret/action-secret-app.ts"',
  },
  codeCov: true,
});
project.synth();