// import { SecretsManagerSecretOptions } from 'aws-cdk-lib';


// https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/dynamic-references.html#dynamic-references-considerations
// export class SecretValue {

//   /**
//      * Creates a `SecretValue` with a value which is dynamically loaded from AWS Secrets Manager.
//      * @param secretId The ID or ARN of the secret
//      * @param options Options
//      */
//   static fromSecretsManager(secretId: string, options?: SecretsManagerSecretOptions = {}): SecretValue {
//     if (options.versionStage && options.versionId) {
//       throw new Error(`verionStage: '${options.versionStage}' and versionId: '${options.versionId}' were both provided but only one is allowed`);
//     }

//     const parts = [
//       secretId,
//       'SecretString',
//       options.jsonField || '',
//       options.versionStage || '',
//       options.versionId || '',
//     ];
//     return new SecretValue();;
//   }
//   /**
//        * Use a secret value stored from a Systems Manager (SSM) parameter.
//        *
//        * @param parameterName The name of the parameter in the Systems Manager
//        * Parameter Store. The parameter name is case-sensitive.
//        *
//        * @param version An integer that specifies the version of the parameter to
//        * use. If you don't specify the exact version, AWS CloudFormation uses the
//        * latest version of the parameter.
//        */
//   static fromSsmSecure(parameterName: string, version?: string): SecretValue {
//     return new SecretValue();
//   }


//   constructor() {
//     console.log('hi');
//   }
// }
