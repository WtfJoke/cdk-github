export interface IGitHubRepository {
  /**
   * The GitHub repository name
   */
  name: string;

  /**
   * The GitHub repository owner
   * @default - user account which owns the personal access token
   */
  owner?: string;
}
