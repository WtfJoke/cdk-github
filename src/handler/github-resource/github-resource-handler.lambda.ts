import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { SSM } from '@aws-sdk/client-ssm';
import { Octokit } from '@octokit/core';
import { CdkCustomResourceResponse } from 'aws-lambda';
import type { OnEventRequest, GitHubResourceEventProps } from '../../types';

export const SSMPARAMETERDEFAULTVALUE = 'UNFILLED';

const onEvent = async (event: OnEventRequest<GitHubResourceEventProps>): Promise<CdkCustomResourceResponse> => {
  console.log(`Event: ${JSON.stringify(event)}`);
  const clientConfig = { region: event.ResourceProperties.awsRegion };
  const ssmClient = new SSM(clientConfig);
  const smClient = new SecretsManager(clientConfig);
  const githubTokenSecret = await smClient.getSecretValue(({ SecretId: event.ResourceProperties.githubTokenSecret }));
  const octokit = new Octokit({ auth: githubTokenSecret.SecretString });

  const requestType = event.RequestType;
  switch (requestType) {
    case 'Create':
      return onCreate(event, octokit, ssmClient);
    case 'Update':
      return onUpdate(event, octokit, ssmClient);
    case 'Delete':
      return onDelete(event, octokit, ssmClient);
    default:
      throw new Error(`Unexpected request type: '${requestType}'`);
  }
};

const onCreate = async (
  event: OnEventRequest<GitHubResourceEventProps>,
  octokit: Octokit,
  ssmClient: SSM,
): Promise<CdkCustomResourceResponse> => {
  const {
    createRequestEndpoint,
    createRequestPayload,
    createRequestResultParameter,
    createRequestResultValueSSMParameterName: parameterName,
    responseBodySSMParameterName,
  } = event.ResourceProperties;

  const requestResult = await executeRequest(octokit, createRequestEndpoint, createRequestPayload);
  console.log('Created GitHub Resource');

  console.log('Going to extract the parameter from the result (if needed)');
  const responseBody = requestResult.data;
  const createRequestResultOriginalValue = createRequestResultParameter ?
    responseBody[createRequestResultParameter] : undefined;
  const createRequestResultValue = toStringIfNotUndefined(createRequestResultOriginalValue);

  if (!createRequestResultValue && createRequestResultParameter) {
    throw new Error("Could not find '" + createRequestResultParameter + "' in request result: " + JSON.stringify(requestResult));
  }
  if (createRequestResultValue && !parameterName) {
    throw new Error('createRequestResultValueSSMParameterName is not defined, but needs to be defined if createRequestResultValue is defined');
  }
  if (createRequestResultValue && parameterName) {
    console.log(`Write create result value '${createRequestResultValue}' to the ssm parameter '${parameterName}'`);
    await ssmClient.putParameter({ Name: parameterName, Value: createRequestResultValue, Overwrite: true });
  }
  await writeResponseBodyToSSMParameterIfNeeded(ssmClient, responseBody, responseBodySSMParameterName);

  return { PhysicalResourceId: createRequestResultValue };
};

const onUpdate = async (
  event: OnEventRequest<GitHubResourceEventProps>,
  octokit: Octokit,
  ssmClient: SSM,
): Promise<CdkCustomResourceResponse> => {
  const {
    updateRequestEndpoint, updateRequestPayload,
    createRequestResultParameter, createRequestResultValueSSMParameterName: parameterName,
    responseBodySSMParameterName,
  } = event.ResourceProperties;
  const createRequestResultValue = await getCreateRequestResultValue(ssmClient, parameterName, createRequestResultParameter);
  if (!updateRequestEndpoint) {
    console.log("No update request endpoint specified, so we'll just ignore the update request");
    return { PhysicalResourceId: createRequestResultValue };
  }

  const updateEndpoint = replaceResultParamterInEndpoint(updateRequestEndpoint, createRequestResultParameter, createRequestResultValue);
  const requestResult = await executeRequest(octokit, updateEndpoint, updateRequestPayload);
  // @ts-ignore - physical resource id is part of CloudFormationCustomResourceUpdateEvent
  console.log(`Updated GitHub Resource with id '${event.PhysicalResourceId}'`);
  await writeResponseBodyToSSMParameterIfNeeded(ssmClient, requestResult.data, responseBodySSMParameterName);

  return { PhysicalResourceId: createRequestResultValue };
};

const onDelete = async (
  event: OnEventRequest<GitHubResourceEventProps>,
  octokit: Octokit,
  ssmClient: SSM,
): Promise<CdkCustomResourceResponse> => {
  const {
    deleteRequestEndpoint, deleteRequestPayload,
    createRequestResultParameter, createRequestResultValueSSMParameterName: parameterName,
    responseBodySSMParameterName,
  } = event.ResourceProperties;

  const createRequestResultValue = await getCreateRequestResultValue(ssmClient, parameterName, createRequestResultParameter);
  const deleteEndpoint = replaceResultParamterInEndpoint(deleteRequestEndpoint, createRequestResultParameter, createRequestResultValue);

  const requestResult = await executeRequest(octokit, deleteEndpoint, deleteRequestPayload);
  const responseBody = requestResult.data;
  // @ts-ignore - physical resource id is part of CloudFormationCustomResourceDeleteEvent
  console.log(`Deleted GitHub Resource with id '${event.PhysicalResourceId}'`);
  await writeResponseBodyToSSMParameterIfNeeded(ssmClient, responseBody, responseBodySSMParameterName);

  return { PhysicalResourceId: createRequestResultValue };
};

const executeRequest = async (octokit: Octokit, endpoint: string, payload?: string) => {
  const payloadToSend = payload ? JSON.parse(payload) : undefined;
  console.log(`Making a request to '${endpoint}'.`);
  const requestResult = await octokit.request(endpoint, payloadToSend);
  return requestResult;
};

const getCreateRequestResultValue =
  async (ssmClient: SSM, parameterName?: string, createRequestResultParameter?: string): Promise<string | undefined> => {
    if (createRequestResultParameter && parameterName) {
      console.log(`Fetch the ssm parameter '${parameterName}' to get the value referenced in the 'createRequestResultParameter'`);
      const ssmCreateParameterResult = await ssmClient.getParameter({ Name: parameterName });
      const parameterValue = ssmCreateParameterResult.Parameter?.Value;
      if (SSMPARAMETERDEFAULTVALUE === parameterValue) {
        throw new Error(`The ssm parameter '${parameterName}' was not set`);
      }
      return parameterValue;
    }
    return undefined;
  };

const replaceResultParamterInEndpoint = (endpoint: string, createRequestResultParameter?: string, createRequestResultValue?: string) =>
  createRequestResultParameter && createRequestResultValue ? endpoint.replace(':' + createRequestResultParameter, createRequestResultValue) : endpoint;

const toStringIfNotUndefined = (value: any): string | undefined => value !== undefined ? String(value) : undefined;

const writeResponseBodyToSSMParameterIfNeeded = async (ssmClient: SSM, responseBody: any, parameterName?: string) => {
  if (parameterName) {
    console.log(`Write the response body to the ssm parameter '${parameterName}'`);
    await ssmClient.putParameter({ Name: parameterName, Value: JSON.stringify(responseBody), Overwrite: true });
  }
};

export const handler = onEvent;
