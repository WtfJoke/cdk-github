# CDK-Github

This project aims to make GitHub's API accessible through CDK with various helper Constructs to create resources in GitHub.

The target is to replicate most of the functionality of the [Terraform GitHub Provider](https://registry.terraform.io/providers/integrations/github/latest/docs).


# Progress

Up so far, the creation of a github repository (action) secret is supported, see [GitHubRepositorySecret](src/github-repository-secret.ts) and an example on how to use it in [GitHubSecretStack](src/examples/github-repository-secret/GitHubRepositorySecretStack.ts)