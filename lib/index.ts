import * as cdk from '@aws-cdk/core';

export interface CdkGithubProps {
  // Define construct properties here
}

export class CdkGithub extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props: CdkGithubProps = {}) {
    super(scope, id);

    // Define construct contents here
  }
}
