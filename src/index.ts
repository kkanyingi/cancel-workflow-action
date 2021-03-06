import * as core from '@actions/core';
import * as github from '@actions/github';

if (!github) {
  throw new Error('Module not found: github');
}

if (!core) {
  throw new Error('Module not found: core');
}

async function main() {
  const { eventName, sha, ref, repo: { owner, repo }, payload } = github.context;
  let actionRunId = process.env.GITHUB_RUN_ID;
  let branch = ref.slice(11);
  let headSha = sha;
  let currentRunId: number | undefined;
  if (payload.pull_request) {
    branch = payload.pull_request.head.ref;
    headSha = payload.pull_request.head.sha;
  }

  if(actionRunId) {
    currentRunId = parseInt(actionRunId);
  }

  console.log({ eventName, sha, headSha, branch, owner, repo, currentRunId });
  const workflow_id = core.getInput('workflow_id', { required: true });
  const workflow_ids = workflow_id.replace(/\s/g, '').split(',').map(s => Number(s));
  const token = core.getInput('access_token', { required: true });
  console.log(`Found input: ${workflow_id}`);
  console.log(`Found token: ${token ? 'yes' : 'no'}`);
  const octokit = new github.GitHub(token);

  await Promise.all(workflow_ids.map(async (workflow_id) => {
    try {
      const {data} = await octokit.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id,
        branch
      });
      console.log(`Found ${data.total_count} runs total.`);
      const runningWorkflows = data.workflow_runs.filter(
        workflow => workflow.id != currentRunId && !['in_progress', 'completed'].includes(workflow.status)
      );
      console.log(`Found ${runningWorkflows.length} runs in progress.`);
      for (const {id, head_sha, status} of runningWorkflows) {
        console.log('Cancelling another run: ', {id, head_sha, status});
        const res = await octokit.actions.cancelWorkflowRun({
          owner,
          repo,
          run_id: id
        });
        console.log(`Status ${res.status}`);
      }
    } catch (e) {
      const msg = e.message || e;
      console.log(`Error while cancelling workflow_id ${workflow_id}: ${msg}`);
    }
  }));

  console.log('Done.');
}

main()
  .then(() => core.info('Cancel Complete.'))
  .catch(e => core.setFailed(e.message));
