# Cancel All Previous Workflow Actions

This is a Github Action that will cancel any previous runs that are not `completed` or `in_progress` for a given workflow. Based off of [styfle/cancel-workflow-action](https://github.com/styfle/cancel-workflow-action).

This includes runs with a [status](https://developer.github.com/v3/checks/runs/#parameters-1) of `queued`.

## How does it work?

Add the cancel job script to the top of your jobs list in your .yml file to cancel any previous running job before a new job is triggered.

Read more about the [Workflow Runs API](https://developer.github.com/v3/actions/workflow_runs/).

## Usage

- Visit https://github.com/settings/tokens to generate a token with `public_repo` scope (or full `repo` scope for private repos).
- Visit `https://github.com/:org/:repo/settings/secrets` to add a secret called `GH_ACCESS_TOKEN` with the token as the value.
- Visit `https://api.github.com/repos/:org/:repo/actions/workflows` to find the Workflow ID you wish to auto-cancel.
- Update your `.github/workflows/your_workflow.yml` file by adding the `cancel` job as first job in your jobs list:

```yml
jobs:
  cancel:
    name: 'Cancel Previous Runs'
    runs-on: ubuntu-latest
    timeout-minutes: 3
    steps:
      - uses: styfle/cancel-workflow-action@0.3.1
        with:
          workflow_id: 479426
          access_token: ${{ secrets.GH_ACCESS_TOKEN }}
```

_Note_: `workflow_id` accepts a comma separated list of IDs.

At the time of writing `0.3.2` is the latest release that allows cancellation of all job but you can select any [release](https://github.com/kkanyingi/cancel-workflow-action/releases).
