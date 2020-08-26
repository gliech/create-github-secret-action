# Create GitHub Secret Action

![release](https://github.com/gliech/create-github-secret-action/workflows/release/badge.svg)

This action can create or update secrets in the GitHub Actions API. It supports
both repository and organization secrets in a unified input syntax.

## Usage

Basic example (creates a secret in the repository where the workflow file is
located):
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

Create a secret in an organization:
```yaml
steps:
  - uses: gliech/create-github-secret-action@v1
    with:
      location: united-states-air-force
      name: NUCLEAR_LAUNCH_CODES
      value: '00000000'
      org_visibility: all
      pa_token: ${{ secrets.PAT_STRATEGIC_AIR_COMMAND }}
```

## Inputs

#### `name`
**Required** Name of the secret that you want to create/update.

#### `value`
**Required** Value of the secret that you want to create/update.
> This action cannot mask the provided secret value in workflow logs. If you do
> not want the value to appear the outputs of your workflow runs, it has to be
> masked before it is provided to this action as input.

#### `location`
Name of a GitHub repository or organization where you want to create/update a
secret. Expects the notation `owner/repo` for repositories. Defaults to the
repository that invoked the workflow.

#### `pa_token`
**Required** Personal access token with permission to modify repository or
organization secrets.
> For more information on PATs see the GitHub docs article on [creating a
> personal access token][1]. The GitHub Secrets API requires the `repo` scope to
> modify secrets in private repositories and the `public_repo` scope for public
> repositories. It requires `admin:org` scope to modify secrets in an
> organization.

#### `org_visibility`
Only used for organization secrets. Can be set to one of 3 values:
- `all` will make the secret visible to all repositories in the organization
- `private` makes it visible only to repositories that are not public
- any other input value will be interpreted as a list of comma-seperated GitHub
  repository IDs, which will cause the created secret to be selectively visible
  only from these repositories

Defaults to `private`.
> GitHub repository IDs are not repository URLs or names. They are a number used
> to identify repositories on GitHub specifically. For more information see the
> [GitHub API documentation on repositories][2] or [this question on Stack
> Overflow][3].

## Outputs

#### `status`
HTTP Status Code of the request against the GitHub API that created/updated the
secret.

## License

This project is licensed under the terms of the [MIT License](LICENSE)

[1]: https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token
[2]: https://docs.github.com/en/rest/reference/repos#get-a-repository
[3]: https://stackoverflow.com/questions/13902593/how-does-one-find-out-ones-own-repo-id
