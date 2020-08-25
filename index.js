const core = require("@actions/core");
const github = require("@actions/github");
const sodium = require('tweetsodium');

class GithubLocation {
  contructor(location_input) {
    if (location_input) {
      const [owner, repo] = location_input.split('/')
      this.data = {owner, repo}
    } else {
      const context = github.context;
      this.data = context.repo;
    }
  }
  toString() {
    return [this.data.owner, this.data.repo].join('/')
  }
}

async function run() {
  try {
    // Get all inputs
    const input_pat = core.getInput('pa_token');
    const input_location = core.getInput('location');
    const input_name = core.getInput('name');
    const input_value = core.getInput('value');

    const secret_location = new GithubLocation(input_location)

    // Retrieve repository public key and encrypt secret value
    const octokit = github.getOctokit(input_pat);
    core.info(`Retrieving public key for repository ${secret_location}`)
    const { data: repo_public_key } = await octokit.actions.getRepoPublicKey(secret_location.data);

    core.info("Encrypting secret value")
    const plain_value_bytes = Buffer.from(input_value);
    const public_key_bytes = Buffer.from(repo_public_key.key, 'base64');
    const secret_value_bytes = sodium.seal(plain_value_bytes, public_key_bytes);
    const signed_secret_value = Buffer.from(secret_value_bytes).toString('base64');

    // Create or update secret
    core.info(`Setting repository secret "${input_name}"`)
    const { status } = await octokit.actions.createOrUpdateRepoSecret({
      ...secret_location.data,
      secret_name: input_name,
      encrypted_value: signed_secret_value,
      key_id: repo_public_key.key_id
    });

    const response_codes = {
      201: 'created',
      204: 'updated'
    }

    if (status in response_codes) {
      core.info(`Successfully ${response_codes[status]} repository secret "${input_name}"`)
    }

    core.setOutput("status", status);
  } catch (err) {
    core.setFailed(err.message);
  }
}

run();
