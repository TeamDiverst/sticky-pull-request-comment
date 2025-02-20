import * as core from "@actions/core"
import {ReportedContentClassifiers} from "@octokit/graphql-schema"
import {context} from "@actions/github"
import {readFileSync} from "fs"

export const pullRequestNumber =
  context?.payload?.pull_request?.number ||
  +core.getInput("number", {required: false})

export const repo = buildRepo()
export const header = core.getInput("header", {required: false})
export const append = core.getBooleanInput("append", {required: true})
export const hideDetails = core.getBooleanInput("hide_details", {
  required: true
})
export const recreate = core.getBooleanInput("recreate", {required: true})
export const hideAndRecreate = core.getBooleanInput("hide_and_recreate", {
  required: true
})
export const hideClassify = core.getInput("hide_classify", {
  required: true
}) as ReportedContentClassifiers
export const deleteOldComment = core.getBooleanInput("delete", {required: true})
export const hideOldComment = core.getBooleanInput("hide", {required: true})
export const githubToken = core.getInput("GITHUB_TOKEN", {required: true})

export const body = buildBody()

function buildRepo(): {repo: string; owner: string} {
  return {
    owner: context.repo.owner,
    repo: core.getInput("repo", {required: false}) || context.repo.repo
  }
}

function buildBody(): string {
  const path = core.getInput("path", {required: false})
  if (path) {
    try {
      return readFileSync(path, "utf-8")
    } catch (error) {
      if (error instanceof Error) {
        core.setFailed(error.message)
      }
      return ""
    }
  } else {
    return core.getInput("message", {required: false})
  }
}
