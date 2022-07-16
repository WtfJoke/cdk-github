
// @ts-nocheck
import { ISecretsManagerSecretString, SecretString } from '../../../src';


describe('secret-string', () => {

  const grantReadMock = jest.fn();
  const granteeMock = jest.fn();

  const secretMock = jest.fn();
  secretMock.secretName = 'secretName';
  secretMock.grantRead = grantReadMock;

  const secureParameterMock = jest.fn();
  secureParameterMock.parameterName = 'parameterName';
  secureParameterMock.grantRead = grantReadMock;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('when called with Secrets Manager secret expect type and id filled', () => {
    const secretString = SecretString.fromSecretsManager(secretMock);

    expect(secretString.type).toStrictEqual('SECRETS_MANAGER');
    expect(secretString.id).toBe('secretName');
    const castedSecretString = secretString as ISecretsManagerSecretString;
    expect(castedSecretString.options).toBeUndefined();
  });

  it('when called with SecureString Parameter expect type and id filled', () => {
    const secretString = SecretString.fromSecureParameter(secureParameterMock);

    expect(secretString.type).toStrictEqual('SECURE_PARAMETER');
    expect(secretString.id).toBe('parameterName');
  });

  it('when called from a serializedValue secret expect type and id filled', () => {
    const secretString = SecretString.fromSerializedValue(JSON.stringify({ type: 'SECRETS_MANAGER', id: 'secretName' }));

    expect(secretString.type).toStrictEqual('SECRETS_MANAGER');
    expect(secretString.id).toBe('secretName');
    const castedSecretString = secretString as ISecretsManagerSecretString;
    expect(castedSecretString.options).toBeUndefined();
  });

  it('when called from a serializedValue parameter expect type and id filled', () => {
    const secretString = SecretString.fromSerializedValue(JSON.stringify({ type: 'SECURE_PARAMETER', id: 'parameterName' }));

    expect(secretString.type).toStrictEqual('SECURE_PARAMETER');
    expect(secretString.id).toBe('parameterName');
  });

  it('when called grantRead expect inner secret grantRead is called with grantee', () => {
    SecretString.fromSecretsManager(secretMock).grantRead(granteeMock);

    expect(grantReadMock).toHaveBeenCalledWith(granteeMock);
  });

  it('when called grantRead expect inner parameter grantRead is called with grantee', () => {
    SecretString.fromSecureParameter(secureParameterMock).grantRead(granteeMock);

    expect(grantReadMock).toHaveBeenCalledWith(granteeMock);
  });
});

