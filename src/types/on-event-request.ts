/**
 * Taken from https://github.com/aws/aws-cdk/blob/master/packages/%40aws-cdk/custom-resources/lib/provider-framework/types.d.ts
 */
interface OriginalOnEventRequest extends AWSLambda.CloudFormationCustomResourceEventCommon {
  /**
   * The request type is set by the AWS CloudFormation stack operation
   * (create-stack, update-stack, or delete-stack) that was initiated by the
   * template developer for the stack that contains the custom resource.
   */
  readonly RequestType: 'Create' | 'Update' | 'Delete';

  /**
   * Used only for Update requests. Contains the resource properties that were
   * declared previous to the update request.
   */
  readonly OldResourceProperties?: { [key: string]: any };

  /**
   * A required custom resource provider-defined physical ID that is unique for
   * that provider.
   *
   * Always sent with 'Update' and 'Delete' requests; never sent with 'Create'.
   */
  readonly PhysicalResourceId?: string;
}

export interface OnEventRequest<Type> extends Omit<OriginalOnEventRequest, 'ResourceProperties'> {
  readonly ResourceProperties: Type;
}
