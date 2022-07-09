import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import { SSM } from '@aws-sdk/client-ssm';
import { SecretValue } from '../../../src/handler/helper';

it('something', async () => {
  expect(await SecretValue.fromUnwrappedValue('{{resolve:secretsmanager:GITHUB_TOKEN:SecretString:::}}').getValue(new SecretsManager({ region: 'eu-central-1' }), new SSM({ region: 'eu-central-1' }))).toBe('hiho');
});
