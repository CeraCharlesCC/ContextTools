import { copyToClipboard } from '../lib/clipboard.js'
import { getIssue, getIssueComments } from '../lib/github.js'
import { parseIssueInput } from '../lib/parse.js'
import { loadSetting, saveSetting } from '../lib/storage.js'
import { issueToMarkdown } from '../markdown/issue.js'

const STORAGE_TOKEN = 'gh_token'
const STORAGE_ISSUE_INPUT = 'issue_input'

export function initIssueToMarkdown() {
  const els = {
    token: document.getElementById('issue-token'),
    tokenToggle: document.getElementById('issue-token-toggle'),
    input: document.getElementById('issue-input'),
    includeComments: document.getElementById('issue-include-comments'),
    convert: document.getElementById('issue-convert'),
    clear: document.getElementById('issue-clear'),
    status: document.getElementById('issue-status'),
    outputPanel: document.getElementById('issue-output-panel'),
    output: document.getElementById('issue-output'),
    copy: document.getElementById('issue-copy'),
  }

  if (!els.input) return

  els.token.value = loadSetting(STORAGE_TOKEN)
  els.input.value = loadSetting(STORAGE_ISSUE_INPUT)

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
    saveSetting(STORAGE_ISSUE_INPUT, '')
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
  els.convert.textContent = isLoading ? 'Fetching issue…' : 'Convert to Markdown'
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
    parsed = parseIssueInput(els.input.value)
  } catch (err) {
    setStatus(els, err.message, 'error')
    return
  }

  const token = els.token.value.trim()
  saveSetting(STORAGE_TOKEN, token)
  saveSetting(STORAGE_ISSUE_INPUT, els.input.value.trim())

  setLoading(els, true)

  try {
    const issue = await getIssue({ ...parsed, token })
    if (issue.pull_request) {
      setStatus(els, 'Note: This issue is also a pull request. Consider using PR to Markdown for richer data.', 'warning')
    }

    const comments = els.includeComments.checked
      ? await getIssueComments({ ...parsed, token })
      : []

    const markdown = issueToMarkdown(issue, comments)
    setOutput(els, markdown)
    if (!issue.pull_request) {
      setStatus(els, `Ready — ${comments.length} comment${comments.length === 1 ? '' : 's'}.`, 'success')
    }
  } catch (err) {
    setStatus(els, err.message, 'error')
  } finally {
    setLoading(els, false)
  }
}
