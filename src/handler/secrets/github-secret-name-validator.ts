export const isValidSecretName = (secretName: string): boolean => {
  if (secretName.startsWith('GITHUB_')) {
    return false;
  }
  const secretNameRegex = /^[a-zA-Z0-9_]+$/;
  return secretNameRegex.test(secretName);
};

export const validateSecretName = (secretName: string) => {
  if (!isValidSecretName(secretName)) {
    throw new Error(`Invalid GitHub secret name: ${secretName}`);
  }
};
