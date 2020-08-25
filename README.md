# Create GitHub Secret Action

![release](https://github.com/gliech/create-github-secret-action/workflows/release/badge.svg)

This action can be used to create or update a GitHub repository secret.

## Usage

Basic example:
```yaml
steps:
  - uses: gliech/create-github-secret-action@v1
    with:
      name: FRONT_DOOR_PASSWORD
      value: Eternia
      pa_token: ${{ secrets.PA_TOKEN }}
```

Create a secret in a different repository:
```yaml
steps:
  - uses: gliech/create-github-secret-action@v1
    with:
      location: horde-prime/spire-network
      name: BROADCAST_FREQUENCY
      value: ${{ secrets.JAMMING_FREQUENCY }}
      pa_token: ${{ secrets.PAT_WRONG_HORDAK }}
```

## Inputs

#### `name`
**Required** Name of the secret that you want to create/update.

#### `value`
**Required** Value of the secret that you want to create/update.
> This action cannot mask the provided secret value in workflow logs. If you do
> not want the value to appear the outputs of your workflow runs, you has to be
> masked before it is provided to this action as input.

#### `location`
GitHub Repository where you want to create/update a secret. Expects the notation
`owner/repo`. Defaults to the repository that invoked the workflow.

#### `pa_token`
**Required** Personal access token with permission to modify repository secrets.
> For more information on PATs see the GitHub docs article on [creating a
> personal access token][1]. The GitHub Secrets API requires the `repo` scope to
> modify secrets in private repositories and the `public_repo` scope for public
> repositories.

## Outputs

#### `status`
HTTP Status Code of the request against the GitHub API that created/updated the
secret.

## License

This project is licensed under the terms of the [MIT License](LICENSE)

[1]: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token
