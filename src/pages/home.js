export const HomePage = {
  render() {
    return `
      <div class="home">
        <header class="hero">
          <p class="eyebrow">ContextTools</p>
          <h1>Turn GitHub threads into sharp Markdown context.</h1>
          <p class="lede">Paste an Issue or Pull Request link and get a clean, copy-ready Markdown bundle for LLM context or documentation.</p>
        </header>

        <section class="tools-grid">
          <a href="#/issue-to-markdown" class="tool-card" style="--delay: 80ms">
            <div class="tool-icon">📋</div>
            <h2>Issue to Markdown</h2>
            <p>Capture the full issue story: metadata, description, and comment timeline.</p>
          </a>

          <a href="#/pr-to-markdown" class="tool-card" style="--delay: 160ms">
            <div class="tool-icon">🔀</div>
            <h2>PR to Markdown</h2>
            <p>Bundle PR details, file diffs, and review discussion into one markdown export.</p>
          </a>
        </section>

        <section class="callout" style="--delay: 220ms">
          <div>
            <h3>No backend. Runs in your browser.</h3>
            <p>Your token (optional) stays in local storage and is only sent to api.github.com.</p>
          </div>
          <span class="badge">Local-first</span>
        </section>
      </div>
    `
  },
}
