# Create GitHub Secret Action

This action can create or updates a GitHub secret in the repository where it is
executed

## Usage

```yaml
steps:
  - uses: gliech/create-github-secret@v1
    with:
      name: FRONT_DOOR_PASSWORD
      value: Eternia
      pa_token: ${{ secrets.PA_TOKEN }}
```

