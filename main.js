import './style.css'

// Page components
const HomePage = () => `
  <div class="home">
    <h1>ContextTools</h1>
    <p class="tagline">Utilities for converting GitHub content to Markdown for LLM context</p>

    <div class="tools-grid">
      <a href="#/issue-to-markdown" class="tool-card">
        <div class="tool-icon">📋</div>
        <h2>Issue to Markdown</h2>
        <p>Convert GitHub Issues into clean Markdown format, perfect for providing context to LLMs.</p>
      </a>

      <a href="#/pr-to-markdown" class="tool-card">
        <div class="tool-icon">🔀</div>
        <h2>PR to Markdown</h2>
        <p>Convert GitHub Pull Requests into Markdown, including diffs, comments, and review threads.</p>
      </a>
    </div>
  </div>
`

const IssueToMarkdownPage = () => `
  <div class="page">
    <nav class="breadcrumb">
      <a href="#">Home</a> / <span>Issue to Markdown</span>
    </nav>

    <h1>Issue to Markdown</h1>
    <p class="description">Convert GitHub Issues into clean Markdown format for LLM context.</p>

    <div class="card">
      <div class="input-group">
        <label for="issue-url">GitHub Issue URL</label>
        <input type="text" id="issue-url" placeholder="https://github.com/owner/repo/issues/123" />
      </div>

      <button class="primary-btn" disabled>Convert to Markdown</button>

      <p class="placeholder-notice">This feature is coming soon.</p>
    </div>
  </div>
`

const PRToMarkdownPage = () => `
  <div class="page">
    <nav class="breadcrumb">
      <a href="#">Home</a> / <span>PR to Markdown</span>
    </nav>

    <h1>PR to Markdown</h1>
    <p class="description">Convert GitHub Pull Requests into Markdown for LLM context.</p>

    <div class="card">
      <div class="input-group">
        <label for="pr-url">GitHub PR URL</label>
        <input type="text" id="pr-url" placeholder="https://github.com/owner/repo/pull/456" />
      </div>

      <button class="primary-btn" disabled>Convert to Markdown</button>

      <p class="placeholder-notice">This feature is coming soon.</p>
    </div>
  </div>
`

const NotFoundPage = () => `
  <div class="page">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <a href="#" class="primary-btn">Go Home</a>
  </div>
`

// Simple hash-based router
const routes = {
  '': HomePage,
  '/': HomePage,
  '/issue-to-markdown': IssueToMarkdownPage,
  '/pr-to-markdown': PRToMarkdownPage,
}

function router() {
  const hash = window.location.hash.slice(1) || '/'
  const page = routes[hash] || NotFoundPage
  document.querySelector('#app').innerHTML = page()
}

// Initialize router
window.addEventListener('hashchange', router)
window.addEventListener('DOMContentLoaded', router)

// Run router immediately
router()
