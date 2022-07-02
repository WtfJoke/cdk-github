import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { SSM } from '@aws-sdk/client-ssm';
import { Octokit } from '@octokit/core';
import { CdkCustomResourceResponse } from 'aws-lambda';
import type { OnEventRequest, GitHubResourceEventProps } from '../../types';

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
    responseBodySSMParameterName,
  } = event.ResourceProperties;

  const requestResult = await executeRequest(octokit, createRequestEndpoint, createRequestPayload);
  console.log('Created GitHub Resource');

  const PhysicalResourceId = await extractIdFromRequestResult(event, requestResult);
  await writeResponseBodyToSSMParameterIfNeeded(ssmClient, requestResult.data, responseBodySSMParameterName);

  return { PhysicalResourceId };
};

const onUpdate = async (
  event: OnEventRequest<GitHubResourceEventProps>,
  octokit: Octokit,
  ssmClient: SSM,
): Promise<CdkCustomResourceResponse> => {
  const {
    updateRequestEndpoint, updateRequestPayload,
    createRequestResultParameter,
    responseBodySSMParameterName,
  } = event.ResourceProperties;
  const PhysicalResourceId = event.PhysicalResourceId;
  if (!updateRequestEndpoint) {
    console.log("No update request endpoint specified, so we'll just ignore the update request");
    return { PhysicalResourceId };
  }

  const updateEndpoint = replaceResultParamterInEndpoint(updateRequestEndpoint, createRequestResultParameter, PhysicalResourceId);
  const requestResult = await executeRequest(octokit, updateEndpoint, updateRequestPayload);
  console.log(`Updated GitHub Resource with id '${event.PhysicalResourceId}'`);
  await writeResponseBodyToSSMParameterIfNeeded(ssmClient, requestResult.data, responseBodySSMParameterName);

  return { PhysicalResourceId };
};

const onDelete = async (
  event: OnEventRequest<GitHubResourceEventProps>,
  octokit: Octokit,
  ssmClient: SSM,
): Promise<CdkCustomResourceResponse> => {
  const {
    deleteRequestEndpoint, deleteRequestPayload,
    createRequestResultParameter,
    responseBodySSMParameterName,
  } = event.ResourceProperties;

  const PhysicalResourceId = event.PhysicalResourceId;
  const deleteEndpoint = replaceResultParamterInEndpoint(deleteRequestEndpoint, createRequestResultParameter, PhysicalResourceId);

  const requestResult = await executeRequest(octokit, deleteEndpoint, deleteRequestPayload);
  const responseBody = requestResult.data;
  console.log(`Deleted GitHub Resource with id '${event.PhysicalResourceId}'`);
  await writeResponseBodyToSSMParameterIfNeeded(ssmClient, responseBody, responseBodySSMParameterName);

  return { PhysicalResourceId };
};

const executeRequest = async (octokit: Octokit, endpoint: string, payload?: string) => {
  const payloadToSend = payload ? JSON.parse(payload) : undefined;
  console.log(`Making a request to '${endpoint}'.`);
  const requestResult = await octokit.request(endpoint, payloadToSend);
  return requestResult;
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

const extractIdFromRequestResult = async (event: OnEventRequest<GitHubResourceEventProps>, requestResult: any) => {
  const { createRequestResultParameter } = event.ResourceProperties;
  console.log('Going to extract the parameter from the create result (if needed)');

  const createRequestResultOriginalValue = createRequestResultParameter ?
    requestResult.data[createRequestResultParameter] : undefined;
  const createRequestResultValue = toStringIfNotUndefined(createRequestResultOriginalValue);

  if (!createRequestResultValue && createRequestResultParameter) {
    throw new Error("Could not find '" + createRequestResultParameter + "' in request result: " + JSON.stringify(requestResult));
  }
  return createRequestResultValue;
};

export const handler = onEvent;
