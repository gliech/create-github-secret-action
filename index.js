const core = require("@actions/core")
const github = require("@actions/github")
const sodium = require("tweetsodium")

class GithubLocation {
  constructor(location_input) {
    this.type = "repository"
    this.short_type = "Repo"
    if (!location_input) {
      const context = github.context
      this.data = context.repo
    } else if (location_input.includes("/")) {
      const [owner, repo] = location_input.split("/")
      this.data = {owner, repo}
    } else {
      this.type = "organization"
      this.short_type = "Org"
      this.data = {org: location_input}
    }
  }
  toString() {
    return Object.values(this.data).join("/")
  }
}

async function run() {
  try {
    // Get all inputs
    const input_name = core.getInput("name")
    const input_value = core.getInput("value")

    const input_location = core.getInput("location")
    const secret_target = new GithubLocation(input_location)

    const input_pat = core.getInput("pa_token")
    const octokit = github.getOctokit(input_pat)
    const get_public_key = octokit.actions[`get${secret_target.short_type}PublicKey`]
    const upsert_secret = octokit.actions[`createOrUpdate${secret_target.short_type}Secret`]

    let org_arguments = {}
    if (secret_target.type == "organization") {
      const input_visibility = core.getInput("org_visibility")
      if (["all", "private"].includes(input_visibility)) {
        org_arguments = { visibility: input_visibility }
      } else {
        org_arguments = {
          visibility: "selected",
          selected_repositoy_ids: input_visibility.split(",").map(i => i.trim())
        }
      }
    }

    // Retrieve repository public key and encrypt secret value
    core.info(`Retrieving public key for ${secret_target.type} '${secret_target}'`)
    const { data: public_key } = await get_public_key(secret_target.data)

    core.info("Encrypting secret value")
    const plain_value_bytes = Buffer.from(input_value)
    const public_key_bytes = Buffer.from(public_key.key, "base64")
    const secret_value_bytes = sodium.seal(plain_value_bytes, public_key_bytes)
    const signed_secret_value = Buffer.from(secret_value_bytes).toString("base64")

    // Create or update secret
    core.info(`Setting ${secret_target.type} secret '${input_name}'`)
    const { status } = await upsert_secret({
      ...secret_target.data,
      secret_name: input_name,
      encrypted_value: signed_secret_value,
      key_id: public_key.key_id,
      ...org_arguments
    })

    const response_codes = {
      201: "created",
      204: "updated"
    }

    if (status in response_codes) {
      core.info(
        `Successfully ${response_codes[status]} secret '${input_name}' in ` +
        `${secret_target.type} '${secret_target}'`
      )
    } else {
      core.warn(
        `Encountered unexpected HTTP status code while creating secret ` +
        `'${input_name}'. Epected one of '201', '204' but got '${status}'`
      )
    }

    core.setOutput("status", status)
  } catch (err) {
    core.setFailed(err.message)
  }
}

run()
