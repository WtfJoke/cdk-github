import { Octokit } from '@octokit/core';

export const getOwner = async (octokit: Octokit, owner: string | undefined): Promise<string> => {
  if (owner) {
    return owner;
  }

  return octokit.request('GET /user').then(({ data }) => (data.login));
};
