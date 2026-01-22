const OWNER_REPO = '([A-Za-z0-9_.-]+)\\/([A-Za-z0-9_.-]+)'

const ISSUE_URL = new RegExp(`github\\.com\\/${OWNER_REPO}\\/issues\\/(\\d+)`, 'i')
const PR_URL = new RegExp(`github\\.com\\/${OWNER_REPO}\\/pull\\/(\\d+)`, 'i')
const ISSUE_PATH = new RegExp(`^${OWNER_REPO}\\/issues\\/(\\d+)$`, 'i')
const PR_PATH = new RegExp(`^${OWNER_REPO}\\/pull\\/(\\d+)$`, 'i')
const SHORT_HAND = new RegExp(`^${OWNER_REPO}#(\\d+)$`, 'i')

function normalizeMatch(match) {
  if (!match) return null
  const [, owner, repo, number] = match
  return { owner, repo, number: Number(number) }
}

export function parseIssueInput(value) {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error('Paste a GitHub issue URL or shorthand like owner/repo#123.')
  }

  const prUrlMatch = trimmed.match(PR_URL)
  if (prUrlMatch) {
    throw new Error('That looks like a pull request URL. Switch to PR to Markdown.')
  }

  return (
    normalizeMatch(trimmed.match(ISSUE_URL)) ||
    normalizeMatch(trimmed.match(ISSUE_PATH)) ||
    normalizeMatch(trimmed.match(SHORT_HAND)) ||
    (() => {
      throw new Error('Could not parse the issue reference. Use a GitHub issue URL or owner/repo#123.')
    })()
  )
}

export function parsePrInput(value) {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new Error('Paste a GitHub PR URL or shorthand like owner/repo#456.')
  }

  const issueUrlMatch = trimmed.match(ISSUE_URL)
  if (issueUrlMatch) {
    throw new Error('That looks like an issue URL. Switch to Issue to Markdown.')
  }

  return (
    normalizeMatch(trimmed.match(PR_URL)) ||
    normalizeMatch(trimmed.match(PR_PATH)) ||
    normalizeMatch(trimmed.match(SHORT_HAND)) ||
    (() => {
      throw new Error('Could not parse the PR reference. Use a GitHub PR URL or owner/repo#456.')
    })()
  )
}
