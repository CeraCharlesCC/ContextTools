const API_ROOT = 'https://api.github.com'

function buildHeaders(token) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

async function fetchJson(url, token) {
  const response = await fetch(url, { headers: buildHeaders(token) })
  if (!response.ok) {
    let message = `${response.status} ${response.statusText}`
    try {
      const errorData = await response.json()
      if (errorData?.message) {
        message = `${message} - ${errorData.message}`
      }
    } catch (err) {
      // ignore JSON parsing errors
    }
    throw new Error(`GitHub API error: ${message}`)
  }
  return response.json()
}

function nextLink(linkHeader) {
  if (!linkHeader) return null
  const parts = linkHeader.split(',')
  for (const part of parts) {
    const [urlPart, relPart] = part.split(';').map((section) => section.trim())
    if (relPart === 'rel="next"') {
      return urlPart.slice(1, -1)
    }
  }
  return null
}

async function fetchAllPages(url, token) {
  let results = []
  let nextUrl = url

  while (nextUrl) {
    const response = await fetch(nextUrl, { headers: buildHeaders(token) })
    if (!response.ok) {
      let message = `${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData?.message) {
          message = `${message} - ${errorData.message}`
        }
      } catch (err) {
        // ignore
      }
      throw new Error(`GitHub API error: ${message}`)
    }

    const data = await response.json()
    if (Array.isArray(data)) {
      results = results.concat(data)
    }

    const linkHeader = response.headers.get('link')
    nextUrl = nextLink(linkHeader)
  }

  return results
}

export async function getIssue({ owner, repo, number, token }) {
  return fetchJson(`${API_ROOT}/repos/${owner}/${repo}/issues/${number}`, token)
}

export async function getIssueComments({ owner, repo, number, token }) {
  const url = `${API_ROOT}/repos/${owner}/${repo}/issues/${number}/comments?per_page=100`
  return fetchAllPages(url, token)
}

export async function getPullRequest({ owner, repo, number, token }) {
  return fetchJson(`${API_ROOT}/repos/${owner}/${repo}/pulls/${number}`, token)
}

export async function getPullFiles({ owner, repo, number, token }) {
  const url = `${API_ROOT}/repos/${owner}/${repo}/pulls/${number}/files?per_page=100`
  return fetchAllPages(url, token)
}

export async function getPullReviews({ owner, repo, number, token }) {
  const url = `${API_ROOT}/repos/${owner}/${repo}/pulls/${number}/reviews?per_page=100`
  return fetchAllPages(url, token)
}

export async function getPullReviewComments({ owner, repo, number, token }) {
  const url = `${API_ROOT}/repos/${owner}/${repo}/pulls/${number}/comments?per_page=100`
  return fetchAllPages(url, token)
}
