import { HomePage } from './pages/home.js'
import { IssuePage } from './pages/issue.js'
import { PRPage } from './pages/pr.js'
import { NotFoundPage } from './pages/not-found.js'

const routes = {
  '/': HomePage,
  '/issue-to-markdown': IssuePage,
  '/pr-to-markdown': PRPage,
}

function getRoute() {
  const hash = window.location.hash.slice(1) || '/'
  return routes[hash] || NotFoundPage
}

export function startRouter() {
  const root = document.querySelector('#app')
  if (!root) return

  const render = () => {
    const page = getRoute()
    root.innerHTML = page.render()
    if (page.mount) {
      page.mount()
    }
  }

  window.addEventListener('hashchange', render)
  window.addEventListener('DOMContentLoaded', render)
  render()
}
