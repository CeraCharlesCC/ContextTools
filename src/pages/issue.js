import { initIssueToMarkdown } from '../features/issue-to-markdown.js'

export const IssuePage = {
  render() {
    return `
      <div class="page">
        <nav class="breadcrumb">
          <a href="#/">Home</a>
          <span>/</span>
          <span>Issue to Markdown</span>
        </nav>

        <header class="page-header">
          <h1>Issue to Markdown</h1>
          <p class="lede">Turn an issue thread into a single Markdown bundle for LLM context.</p>
        </header>

        <section class="panel">
          <div class="field">
            <label for="issue-token">GitHub Personal Access Token</label>
            <div class="input-row">
              <input type="password" id="issue-token" placeholder="ghp_..." autocomplete="off" />
              <button class="btn ghost" type="button" id="issue-token-toggle">Show</button>
            </div>
            <p class="hint">Optional for public repositories. Stored locally in your browser.</p>
          </div>

          <div class="field">
            <label for="issue-input">Issue URL or shorthand</label>
            <input type="text" id="issue-input" placeholder="https://github.com/owner/repo/issues/123 or owner/repo#123" />
          </div>

          <div class="options">
            <label class="toggle">
              <input type="checkbox" id="issue-include-comments" checked />
              <span>Include comments</span>
            </label>
          </div>

          <div class="actions">
            <button class="btn primary" id="issue-convert" type="button">Convert to Markdown</button>
            <button class="btn ghost" id="issue-clear" type="button">Clear</button>
          </div>

          <div class="status is-hidden" id="issue-status" role="status"></div>
        </section>

        <section class="output is-hidden" id="issue-output-panel">
          <div class="output-header">
            <h2>Markdown output</h2>
            <div class="output-actions">
              <button class="btn ghost" type="button" id="issue-copy">Copy</button>
            </div>
          </div>
          <textarea id="issue-output" rows="18" readonly></textarea>
        </section>
      </div>
    `
  },
  mount() {
    initIssueToMarkdown()
  },
}
