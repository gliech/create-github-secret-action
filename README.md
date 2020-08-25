# Create GitHub Secret Action

This action can create or updates a GitHub repository secret.

![release](https://github.com/gliech/create-github-secret-action/workflows/release/badge.svg)

## Usage

```yaml
steps:
  - uses: gliech/create-github-secret-action@v1
    with:
      name: FRONT_DOOR_PASSWORD
      value: Eternia
      pa_token: ${{ secrets.PA_TOKEN }}
```

## Inputs

### `name`
**Required** Name of the secret that you want to create/update.

### `value`
**Required** Value of the secret that you want to create/update.
> This action cannot mask the provided secret value in workflow logs. If you do
> not want the value to appear the outputs of your workflow runs, you has to be
> masked before it is provided to this action as input.

### `location`
GitHub Repository where you want to create/update a secret. Expects the notation
`owner/repo`. Defaults to the repository that invoked the workflow.

### `pa_token`
**Required** Personal access token with permission to modify repository secrets.

## Outputs

### `status`
HTTP Status Code of the request against the GitHub API that created/updated the
secret.

# License

This project is licensed under the terms of the [MIT License](LICENSE)

