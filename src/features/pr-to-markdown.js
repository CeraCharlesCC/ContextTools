import { copyToClipboard } from '../lib/clipboard.js'
import {
  getIssueComments,
  getCommit,
  getPullFiles,
  getPullCommits,
  getPullRequest,
  getPullReviewComments,
  getPullReviews,
} from '../lib/github.js'
import { parsePrInput } from '../lib/parse.js'
import { loadSetting, saveSetting } from '../lib/storage.js'
import { prToMarkdown } from '../markdown/pr.js'

const STORAGE_TOKEN = 'gh_token'
const STORAGE_PR_INPUT = 'pr_input'

export function initPrToMarkdown() {
  const els = {
    token: document.getElementById('pr-token'),
    tokenToggle: document.getElementById('pr-token-toggle'),
    input: document.getElementById('pr-input'),
    includeFiles: document.getElementById('pr-include-files'),
    includeIssueComments: document.getElementById('pr-include-issue-comments'),
    includeReviewComments: document.getElementById('pr-include-review-comments'),
    includeReviews: document.getElementById('pr-include-reviews'),
    historicalMode: document.getElementById('pr-historical-mode'),
    convert: document.getElementById('pr-convert'),
    clear: document.getElementById('pr-clear'),
    status: document.getElementById('pr-status'),
    outputPanel: document.getElementById('pr-output-panel'),
    output: document.getElementById('pr-output'),
    copy: document.getElementById('pr-copy'),
  }

  if (!els.input) return

  els.token.value = loadSetting(STORAGE_TOKEN)
  els.input.value = loadSetting(STORAGE_PR_INPUT)

  els.tokenToggle.addEventListener('click', () => {
    const isHidden = els.token.type === 'password'
    els.token.type = isHidden ? 'text' : 'password'
    els.tokenToggle.textContent = isHidden ? 'Hide' : 'Show'
  })

  els.convert.addEventListener('click', () => {
    handleConvert(els)
  })

  els.input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      handleConvert(els)
    }
  })

  els.clear.addEventListener('click', () => {
    els.input.value = ''
    saveSetting(STORAGE_PR_INPUT, '')
    setStatus(els, '')
    setOutput(els, '')
  })

  els.copy.addEventListener('click', async () => {
    try {
      await copyToClipboard(els.output.value)
      setStatus(els, 'Copied to clipboard.', 'success')
    } catch (err) {
      setStatus(els, `Copy failed: ${err.message}`, 'error')
    }
  })
}

function setLoading(els, isLoading) {
  els.convert.disabled = isLoading
  els.convert.textContent = isLoading ? 'Fetching PR…' : 'Convert to Markdown'
}

function setStatus(els, message, tone = 'info') {
  if (!message) {
    els.status.classList.add('is-hidden')
    els.status.textContent = ''
    els.status.dataset.tone = ''
    return
  }
  els.status.textContent = message
  els.status.dataset.tone = tone
  els.status.classList.remove('is-hidden')
}

function setOutput(els, markdown) {
  if (!markdown) {
    els.outputPanel.classList.add('is-hidden')
    els.output.value = ''
    els.output.style.height = ''
    return
  }
  els.outputPanel.classList.remove('is-hidden')
  els.output.value = markdown
  els.output.style.height = 'auto'
  els.output.style.height = `${els.output.scrollHeight}px`
}

async function handleConvert(els) {
  setStatus(els, '')
  setOutput(els, '')

  let parsed
  try {
    parsed = parsePrInput(els.input.value)
  } catch (err) {
    setStatus(els, err.message, 'error')
    return
  }

  const token = els.token.value.trim()
  saveSetting(STORAGE_TOKEN, token)
  saveSetting(STORAGE_PR_INPUT, els.input.value.trim())

  setLoading(els, true)

  try {
    const historicalMode = Boolean(els.historicalMode?.checked)
    const pr = await getPullRequest({ ...parsed, token })

    const [files, issueComments, reviewComments, reviews, commits] = await Promise.all([
      els.includeFiles.checked && !historicalMode ? getPullFiles({ ...parsed, token }) : Promise.resolve([]),
      els.includeIssueComments.checked ? getIssueComments({ ...parsed, token }) : Promise.resolve([]),
      els.includeReviewComments.checked ? getPullReviewComments({ ...parsed, token }) : Promise.resolve([]),
      els.includeReviews.checked ? getPullReviews({ ...parsed, token }) : Promise.resolve([]),
      historicalMode ? getPullCommits({ ...parsed, token }) : Promise.resolve([]),
    ])

    let commitDetails = commits
    if (historicalMode && els.includeFiles.checked && commits.length) {
      commitDetails = await Promise.all(
        commits.map((commit) => getCommit({ owner: parsed.owner, repo: parsed.repo, sha: commit.sha, token }))
      )
    }

    const markdown = prToMarkdown({
      pr,
      files,
      issueComments,
      reviewComments,
      reviews,
      commits: commitDetails,
      historicalMode,
      includeFiles: els.includeFiles.checked,
    })
    setOutput(els, markdown)

    const statusParts = []
    if (historicalMode) {
      statusParts.push(`${commitDetails.length} commit${commitDetails.length === 1 ? '' : 's'}`)
      if (els.includeFiles.checked) {
        const changedFiles = typeof pr.changed_files === 'number' ? pr.changed_files : commitDetails.length
        statusParts.push(`${changedFiles} changed file${changedFiles === 1 ? '' : 's'}`)
      }
    } else {
      statusParts.push(`${files.length} file${files.length === 1 ? '' : 's'}`)
    }
    statusParts.push(`${issueComments.length} issue comment${issueComments.length === 1 ? '' : 's'}`)
    statusParts.push(`${reviewComments.length} review comment${reviewComments.length === 1 ? '' : 's'}`)

    setStatus(
      els,
      `Ready — ${statusParts.join(', ')}.`,
      'success'
    )
  } catch (err) {
    setStatus(els, err.message, 'error')
  } finally {
    setLoading(els, false)
  }
}
