const core = require("@actions/core");
const github = require("@actions/github");
const sodium = require('tweetsodium');

async function run() {
  try {
    // Get all inputs
    const pa_token = core.getInput('pa_token');
    const octokit = github.getOctokit(pa_token);

    const secret_name = core.getInput('name');

    const secret_value = core.getInput('value');
    core.setSecret(secret_value);

    const context = github.context;

    // Retrieve repository public key and encrypt secret value
    core.info(`Retrieving public key for repository ${context.repo.owner}/${context.repo.repo}`)
    const { data: repo_public_key } = await octokit.actions.getRepoPublicKey(context.repo);

    core.info("Encrypting secret value")
    const plain_value_bytes = Buffer.from(secret_value);
    const public_key_bytes = Buffer.from(repo_public_key.key, 'base64');
    const secret_value_bytes = sodium.seal(plain_value_bytes, public_key_bytes);
    const signed_secret_value = Buffer.from(secret_value_bytes).toString('base64');

    // Create or update secret
    core.info(`Setting repository secret "${secret_name}"`)
    const { status } = await octokit.actions.createOrUpdateRepoSecret({
      ...context.repo,
      secret_name: secret_name,
      encrypted_value: signed_secret_value,
      key_id: repo_public_key.key_id
    });

    const response_codes = {
      201: 'created',
      204: 'updated'
    }

    if (status in response_codes) {
      core.info(`Successfully ${response_codes[status]} repository secret "${secret_name}"`)
    }

    core.setOutput("status", status);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
