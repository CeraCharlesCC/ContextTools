import { formatDate, formatUser } from '../lib/format.js'

function renderLabels(labels) {
  if (!labels || !labels.length) return 'None'
  return labels.map((label) => `\`${label.name}\``).join(', ')
}

export function prToMarkdown({ pr, files, issueComments, reviewComments, reviews }) {
  const lines = []
  const state = pr.merged ? 'merged' : pr.state

  lines.push(`# PR: ${pr.title}`)
  lines.push('')
  lines.push(`- URL: ${pr.html_url}`)
  lines.push(`- State: ${state}`)
  lines.push(`- Author: ${formatUser(pr.user)}`)
  lines.push(`- Created: ${formatDate(pr.created_at)}`)
  lines.push(`- Updated: ${formatDate(pr.updated_at)}`)
  if (pr.closed_at) {
    lines.push(`- Closed: ${formatDate(pr.closed_at)}`)
  }
  if (pr.merged_at) {
    lines.push(`- Merged: ${formatDate(pr.merged_at)}`)
  }
  const baseRef = pr.base?.repo?.full_name && pr.base?.ref ? `${pr.base.repo.full_name}:${pr.base.ref}` : pr.base?.ref
  const headRef = pr.head?.repo?.full_name && pr.head?.ref ? `${pr.head.repo.full_name}:${pr.head.ref}` : pr.head?.ref
  lines.push(`- Base: ${baseRef || 'Unknown'}`)
  lines.push(`- Head: ${headRef || 'Unknown'}`)
  lines.push(`- Commits: ${pr.commits}`)
  lines.push(`- Changed files: ${pr.changed_files}`)
  lines.push(`- Additions: ${pr.additions}`)
  lines.push(`- Deletions: ${pr.deletions}`)
  if (pr.labels?.length) {
    lines.push(`- Labels: ${renderLabels(pr.labels)}`)
  }
  lines.push('')
  lines.push('## Description')
  lines.push(pr.body?.trim() ? pr.body.trim() : '_No description provided._')

  if (files?.length) {
    lines.push('')
    lines.push(`## Files (${files.length})`)
    files.forEach((file) => {
      const additions = typeof file.additions === 'number' ? file.additions : 0
      const deletions = typeof file.deletions === 'number' ? file.deletions : 0
      const status = file.status || 'modified'
      lines.push('')
      lines.push(`### ${file.filename} (${status}, +${additions} -${deletions})`)
      if (file.patch) {
        lines.push('```diff')
        lines.push(file.patch)
        lines.push('```')
      } else {
        lines.push('_Binary file or no patch available._')
      }
    })
  }

  if (issueComments?.length) {
    lines.push('')
    lines.push(`## Issue Comments (${issueComments.length})`)
    issueComments.forEach((comment, index) => {
      lines.push('')
      lines.push(`### ${index + 1}. ${formatUser(comment.user)} on ${formatDate(comment.created_at)}`)
      lines.push(comment.body?.trim() ? comment.body.trim() : '_No comment body._')
    })
  }

  if (reviewComments?.length) {
    lines.push('')
    lines.push(`## Review Comments (${reviewComments.length})`)
    reviewComments.forEach((comment, index) => {
      const location = comment.path ? ` — ${comment.path}${comment.line ? `:${comment.line}` : ''}` : ''
      lines.push('')
      lines.push(`### ${index + 1}. ${formatUser(comment.user)} on ${formatDate(comment.created_at)}${location}`)
      lines.push(comment.body?.trim() ? comment.body.trim() : '_No comment body._')
      if (comment.diff_hunk) {
        lines.push('```diff')
        lines.push(comment.diff_hunk)
        lines.push('```')
      }
    })
  }

  if (reviews?.length) {
    lines.push('')
    lines.push(`## Reviews (${reviews.length})`)
    reviews.forEach((review, index) => {
      const stateLabel = review.state?.toLowerCase() || 'commented'
      const summary = `${index + 1}. ${formatUser(review.user)} — ${stateLabel}`
      lines.push('')
      lines.push(`### ${summary}`)
      if (review.submitted_at) {
        lines.push(`Submitted: ${formatDate(review.submitted_at)}`)
      }
      lines.push(review.body?.trim() ? review.body.trim() : '_No review body._')
    })
  }

  return lines.join('\n')
}
