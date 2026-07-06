// @ts-check

import { readFile } from 'node:fs/promises'

const templateMarkers = ["what's changed", 'checklist', '[x] I agree to respect and uphold the']

const exemptAuthors = ['renovate[bot]', 'dependabot[bot]']

const driveByLabel = ':car: driveby'

/**
 * @param {object} params
 * @param {ReturnType<typeof import('@actions/github').getOctokit>} params.github
 * @param {typeof import('@actions/github').context} params.context
 */
export default async function ({ github, context }) {
  const pr = context.payload.pull_request
  if (!pr) {
    return
  }
  if (exemptAuthors.includes(pr.user?.login)) {
    return
  }
  const { owner, repo } = context.repo
  const body = (pr.body || '').toLowerCase()

  const templateHonoured =
    templateMarkers.filter((m) => body.includes(m)).length === templateMarkers.length

  if (templateHonoured) {
    const reviews = await github.rest.pulls.listReviews({ owner, repo, pull_number: pr.number })
    const dismissableReviews = reviews.data.filter(
      (r) => r.user?.login === 'github-actions[bot]' && r.state === 'CHANGES_REQUESTED'
    )
    for (const review of dismissableReviews) {
      await github.rest.pulls.dismissReview({
        owner,
        repo,
        pull_number: pr.number,
        review_id: review.id,
        message: 'Thanks for updating the description.',
      })
    }

    try {
      await github.rest.issues.removeLabel({
        owner,
        repo,
        issue_number: pr.number,
        name: driveByLabel,
      })
    } catch {
      // label wasn't there
    }

    return
  }

  await github.rest.issues.addLabels({
    owner,
    repo,
    issue_number: pr.number,
    labels: [driveByLabel],
  })

  const reviews = await github.rest.pulls.listReviews({ owner, repo, pull_number: pr.number })
  const alreadyAsked = reviews.data.some(
    (r) => r.user?.login === 'github-actions[bot]' && r.state === 'CHANGES_REQUESTED'
  )
  if (alreadyAsked) {
    return
  }

  const reviewComment = await readFile(new URL('./driveby-comment.md', import.meta.url), {
    encoding: 'utf-8',
  })

  await github.rest.pulls.createReview({
    owner,
    repo,
    pull_number: pr.number,
    event: 'REQUEST_CHANGES',
    body: reviewComment,
  })
}
