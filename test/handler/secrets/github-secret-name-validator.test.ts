import { isValidSecretName, validateSecretName } from '../../../src/handler/secrets/github-secret-name-validator';

describe('github-secret-name-validator', () => {
  describe('valid secret names', () => {
    it.each`
      secretName
      ${'my_secret'}
      ${'anotherSecr3tName'}
      ${'anotherGithubSecret'}
      `("should return true for valid secret name '$secretName'", ({ secretName }) => {
      expect(isValidSecretName(secretName)).toBe(true);
      expect(() => validateSecretName(secretName)).not.toThrowError();
    });
  });

  describe('invalid secret names', () => {
    it.each`
    secretName
    ${'GITHUB_my_secret'}
    ${'anotherSecret@Name'}
    ${'another-Gith3ubSecret'}
    ${'thats a space'}
    `("should return false for invalid secret name '$secretName'", ({ secretName }) => {
      expect(isValidSecretName(secretName)).toBe(false);
      expect(() => validateSecretName(secretName)).toThrowError();
    });
  });
});
