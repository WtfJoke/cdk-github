import { Octokit } from '@octokit/core';

let cachedOwner: string | undefined;

export const getOwner = async (octokit: Octokit, owner: string | undefined): Promise<string> => {
  if (owner) {
    return owner;
  } else if (cachedOwner) {
    return cachedOwner;
  }

  const fetchedOwner = await octokit.request('GET /user').then(({ data }) => (data.login));
  cachedOwner = fetchedOwner;
  return fetchedOwner;

};
