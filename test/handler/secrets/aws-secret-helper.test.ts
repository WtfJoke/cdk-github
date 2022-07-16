import { GetSecretValueCommand, SecretsManager } from '@aws-sdk/client-secrets-manager';
import { mockClient } from 'aws-sdk-client-mock';
import { getSecretString } from '../../../src/handler/secrets/aws-secret-helper';

describe('aws-secret-helper', () => {

  const smMock = mockClient(SecretsManager);
  const SecretId = 'arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id';
  const sm = new SecretsManager({});
  const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();

  it('getSecretValue', async () => {
    smMock.on(GetSecretValueCommand, {
      SecretId,
    }).resolves({
      SecretString: 'mySecretValue',
    });
    expect(await getSecretString(SecretId, sm)).toBe('mySecretValue');
    expect(consoleLogSpy).toHaveBeenCalledWith('Get Secret of secretId: arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id with options: {}');
  });

  it('getSecretValue with jsonField', async () => {
    smMock.on(GetSecretValueCommand, {
      SecretId,
    }).resolves({
      SecretString: JSON.stringify({ mySecretKey: 'mySecretValue' }),
    });
    expect(await getSecretString(SecretId, sm, { jsonField: 'mySecretKey' })).toBe('mySecretValue');
    expect(consoleLogSpy).toHaveBeenCalledWith('Get Secret of secretId: arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id with options: {\"jsonField\":\"mySecretKey\"}');
  });

  it('getSecretValue with jsonField without json structure', async () => {
    smMock.on(GetSecretValueCommand, {
      SecretId,
    }).resolves({
      SecretString: 'mySecretValue',
    });

    await expect(getSecretString(SecretId, sm, { jsonField: 'mySecretKey' }))
      .rejects
      .toThrowError('Error while parsing SecretString with id: arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id and jsonField: mySecretKey: Unexpected token m in JSON at position 0');
  });

  it('getSecretValue with empty jsonField', async () => {
    smMock.on(GetSecretValueCommand, {
      SecretId,
    }).resolves({
      SecretString: JSON.stringify({ mySecretKey: '' }),
    });

    await expect(getSecretString(SecretId, sm, { jsonField: 'mySecretKey' }))
      .rejects
      .toThrowError('SecretString is empty from secret with id: arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id');
  });

  it('getSecretValue with empty secret value', async () => {
    smMock.on(GetSecretValueCommand, {
      SecretId,
    }).resolves({
      SecretString: '',
    });
    await expect(getSecretString(SecretId, sm, { jsonField: 'mySecretKey' }))
      .rejects
      .toThrowError('SecretString is empty from secret with id: arn:aws:secretsmanager:eu-central-1:123456789012:secret:secret-id');
  });

});
