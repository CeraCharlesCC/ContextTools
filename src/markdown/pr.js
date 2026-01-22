import { formatDate, formatUser } from '../lib/format.js'

function renderLabels(labels) {
  if (!labels || !labels.length) return 'None'
  return labels.map((label) => `\`${label.name}\``).join(', ')
}

function renderBody(lines, body, fallback) {
  lines.push(body?.trim() ? body.trim() : fallback)
}

function renderFileDiff(lines, file, heading) {
  const additions = typeof file.additions === 'number' ? file.additions : 0
  const deletions = typeof file.deletions === 'number' ? file.deletions : 0
  const status = file.status || 'modified'
  lines.push(`${heading} ${file.filename} (${status}, +${additions} -${deletions})`)
  if (file.patch) {
    lines.push('```diff')
    lines.push(file.patch)
    lines.push('```')
  } else {
    lines.push('_Binary file or no patch available._')
  }
}

function formatCommitAuthor(commit) {
  if (commit?.author?.login) {
    return formatUser(commit.author)
  }
  const name = commit?.commit?.author?.name || commit?.commit?.committer?.name
  return name || 'Unknown'
}

function commitSubject(message) {
  if (!message) return 'No commit message'
  return message.split('\n')[0].trim() || 'No commit message'
}

function commitBody(message) {
  if (!message) return ''
  const body = message.split('\n').slice(1).join('\n').trim()
  return body
}

export function prToMarkdown({
  pr,
  files,
  issueComments,
  reviewComments,
  reviews,
  commits,
  historicalMode,
  includeFiles,
}) {
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
  renderBody(lines, pr.body, '_No description provided._')

  if (historicalMode) {
    const events = []

    if (commits?.length) {
      commits.forEach((commit) => {
        const date = commit?.commit?.author?.date || commit?.commit?.committer?.date
        events.push({ type: 'commit', date, commit })
      })
    }

    if (issueComments?.length) {
      issueComments.forEach((comment) => {
        events.push({ type: 'issue-comment', date: comment.created_at, comment })
      })
    }

    if (reviewComments?.length) {
      reviewComments.forEach((comment) => {
        events.push({ type: 'review-comment', date: comment.created_at, comment })
      })
    }

    if (reviews?.length) {
      reviews.forEach((review) => {
        const date = review.submitted_at || review.created_at
        events.push({ type: 'review', date, review })
      })
    }

    const indexedEvents = events.map((event, index) => ({ ...event, index }))
    indexedEvents.sort((a, b) => {
      const aTime = a.date ? new Date(a.date).getTime() : 0
      const bTime = b.date ? new Date(b.date).getTime() : 0
      if (aTime === bTime) return a.index - b.index
      return aTime - bTime
    })

    if (indexedEvents.length) {
      lines.push('')
      lines.push(`## Timeline (${indexedEvents.length})`)
      indexedEvents.forEach((event, index) => {
        if (event.type === 'commit') {
          const commit = event.commit
          const sha = commit?.sha ? commit.sha.slice(0, 7) : 'unknown'
          const message = commit?.commit?.message || ''
          const subject = commitSubject(message)
          const body = commitBody(message)
          lines.push('')
          lines.push(`### ${index + 1}. Commit ${sha} — ${subject}`)
          lines.push(`Author: ${formatCommitAuthor(commit)} on ${formatDate(event.date)}`)
          if (body) {
            lines.push(body)
          }
          if (includeFiles && commit?.files?.length) {
            commit.files.forEach((file) => {
              lines.push('')
              renderFileDiff(lines, file, '####')
            })
          }
          return
        }

        if (event.type === 'issue-comment') {
          const comment = event.comment
          lines.push('')
          lines.push(`### ${index + 1}. Issue Comment — ${formatUser(comment.user)} on ${formatDate(comment.created_at)}`)
          renderBody(lines, comment.body, '_No comment body._')
          return
        }

        if (event.type === 'review-comment') {
          const comment = event.comment
          const location = comment.path ? ` — ${comment.path}${comment.line ? `:${comment.line}` : ''}` : ''
          lines.push('')
          lines.push(
            `### ${index + 1}. Review Comment — ${formatUser(comment.user)} on ${formatDate(
              comment.created_at
            )}${location}`
          )
          renderBody(lines, comment.body, '_No comment body._')
          if (comment.diff_hunk) {
            lines.push('```diff')
            lines.push(comment.diff_hunk)
            lines.push('```')
          }
          return
        }

        if (event.type === 'review') {
          const review = event.review
          const stateLabel = review.state?.toLowerCase() || 'commented'
          lines.push('')
          lines.push(
            `### ${index + 1}. Review — ${formatUser(review.user)} (${stateLabel}) on ${formatDate(
              review.submitted_at || review.created_at
            )}`
          )
          renderBody(lines, review.body, '_No review body._')
        }
      })
    }
  } else {
    if (files?.length) {
      lines.push('')
      lines.push(`## Files (${files.length})`)
      files.forEach((file) => {
        lines.push('')
        renderFileDiff(lines, file, '###')
      })
    }

    if (issueComments?.length) {
      lines.push('')
      lines.push(`## Issue Comments (${issueComments.length})`)
      issueComments.forEach((comment, index) => {
        lines.push('')
        lines.push(`### ${index + 1}. ${formatUser(comment.user)} on ${formatDate(comment.created_at)}`)
        renderBody(lines, comment.body, '_No comment body._')
      })
    }

    if (reviewComments?.length) {
      lines.push('')
      lines.push(`## Review Comments (${reviewComments.length})`)
      reviewComments.forEach((comment, index) => {
        const location = comment.path ? ` — ${comment.path}${comment.line ? `:${comment.line}` : ''}` : ''
        lines.push('')
        lines.push(`### ${index + 1}. ${formatUser(comment.user)} on ${formatDate(comment.created_at)}${location}`)
        renderBody(lines, comment.body, '_No comment body._')
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
        renderBody(lines, review.body, '_No review body._')
      })
    }
  }

  return lines.join('\n')
}
