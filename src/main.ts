import * as core from "@actions/core"
import * as github from "@actions/github"
import {
  append,
  body,
  deleteOldComment,
  githubToken,
  header,
  hideAndRecreate,
  hideClassify,
  hideDetails,
  hideOldComment,
  pullRequestNumber,
  recreate,
  repo
} from "./config"
import {
  createComment,
  deleteComment,
  findPreviousComment,
  getBodyOf,
  minimizeComment,
  updateComment
} from "./comment"

async function run(): Promise<undefined> {
  if (isNaN(pullRequestNumber) || pullRequestNumber < 1) {
    core.info("no pull request numbers given: skip step")
    return
  }

  try {
    if (!deleteOldComment && !hideOldComment && !body) {
      throw new Error("Either message or path input is required")
    }

    if (deleteOldComment && recreate) {
      throw new Error("delete and recreate cannot be both set to true")
    }

    if (hideOldComment && hideAndRecreate) {
      throw new Error("hide and hide_and_recreate cannot be both set to true")
    }

    const octokit = github.getOctokit(githubToken)
    const previous = await findPreviousComment(
      octokit,
      repo,
      pullRequestNumber,
      header
    )
    if (previous) core.info("Found previous comment")
    else core.info("Did not find previous comment")

    if (deleteOldComment) {
      if (previous) {
        await deleteComment(octokit, previous.id)
        core.info("Deleted comment")
      }
      return
    }

    if (hideOldComment) {
      if (previous) {
        await minimizeComment(octokit, previous.id, hideClassify)
        core.info("Hid comment")
      }
      return
    }

    if (!previous) {
      await createComment(octokit, repo, pullRequestNumber, body, header)
      core.info("Created comment")
      return
    }

    const previousBody = getBodyOf(previous, append, hideDetails)
    if (recreate) {
      await deleteComment(octokit, previous.id)
      core.info("Deleted comment")
      await createComment(
        octokit,
        repo,
        pullRequestNumber,
        body,
        header,
        previousBody
      )
      core.info("Created comment")
      return
    }

    if (hideAndRecreate) {
      await minimizeComment(octokit, previous.id, hideClassify)
      core.info("Hid comment")
      await createComment(octokit, repo, pullRequestNumber, body, header)
      core.info("Created comment")
      return
    }

    await updateComment(octokit, previous.id, body, header, previousBody)
    core.info("Updated comment")
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
