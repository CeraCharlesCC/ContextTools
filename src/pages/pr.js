import { initPrToMarkdown } from '../features/pr-to-markdown.js'

export const PRPage = {
  render() {
    return `
      <div class="page">
        <nav class="breadcrumb">
          <a href="#/">Home</a>
          <span>/</span>
          <span>PR to Markdown</span>
        </nav>

        <header class="page-header">
          <h1>PR to Markdown</h1>
          <p class="lede">Collect PR metadata, file diffs, and review discussion in Markdown.</p>
        </header>

        <section class="panel">
          <div class="field">
            <label for="pr-token">GitHub Personal Access Token</label>
            <div class="input-row">
              <input type="password" id="pr-token" placeholder="ghp_..." autocomplete="off" />
              <button class="btn ghost" type="button" id="pr-token-toggle">Show</button>
            </div>
            <p class="hint">Optional for public repositories. Stored locally in your browser.</p>
          </div>

          <div class="field">
            <label for="pr-input">Pull request URL or shorthand</label>
            <input type="text" id="pr-input" placeholder="https://github.com/owner/repo/pull/456 or owner/repo#456" />
          </div>

          <div class="options">
            <label class="toggle">
              <input type="checkbox" id="pr-include-files" checked />
              <span>Include file diffs</span>
            </label>
            <label class="toggle">
              <input type="checkbox" id="pr-include-issue-comments" />
              <span>Include issue comments</span>
            </label>
            <label class="toggle">
              <input type="checkbox" id="pr-include-review-comments" />
              <span>Include review comments</span>
            </label>
            <label class="toggle">
              <input type="checkbox" id="pr-include-reviews" />
              <span>Include review summaries</span>
            </label>
            <label class="toggle">
              <input type="checkbox" id="pr-historical-mode" />
              <span>Historical mode (commits + comments in order)</span>
            </label>
          </div>

          <div class="actions">
            <button class="btn primary" id="pr-convert" type="button">Convert to Markdown</button>
            <button class="btn ghost" id="pr-clear" type="button">Clear</button>
          </div>

          <div class="status is-hidden" id="pr-status" role="status"></div>
        </section>

        <section class="output is-hidden" id="pr-output-panel">
          <div class="output-header">
            <h2>Markdown output</h2>
            <div class="output-actions">
              <button class="btn ghost" type="button" id="pr-copy">Copy</button>
            </div>
          </div>
          <textarea id="pr-output" rows="18" readonly></textarea>
        </section>
      </div>
    `
  },
  mount() {
    initPrToMarkdown()
  },
}
