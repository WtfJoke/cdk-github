const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Manuel',
  authorAddress: 'wtfjoke@livenet.ch',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'cdk-github',
  repositoryUrl: 'https://github.com/wtfjoke/cdk-github.git',
  license: 'MIT',
  copyrightOwner: 'Manuel <WtfJoke>',
  copyrightPeriod: '2022',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});
project.synth();