// ~~ Generated by projen. To modify, edit .projenrc.js and run "npx projen".
import * as path from 'path';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

/**
 * Props for ActionEnvironmentSecretHandlerFunction
 */
export interface ActionEnvironmentSecretHandlerFunctionProps extends lambda.FunctionOptions {
}

/**
 * An AWS Lambda function which executes src/handler/action-environment-secrets/action-environment-secret-handler.
 */
export class ActionEnvironmentSecretHandlerFunction extends lambda.Function {
  constructor(scope: Construct, id: string, props?: ActionEnvironmentSecretHandlerFunctionProps) {
    super(scope, id, {
      description: 'src/handler/action-environment-secrets/action-environment-secret-handler.lambda.ts',
      ...props,
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../../assets/handler/action-environment-secrets/action-environment-secret-handler.lambda')),
    });
    this.addEnvironment('AWS_NODEJS_CONNECTION_REUSE_ENABLED', '1', { removeInEdge: true });
  }
}