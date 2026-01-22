export function formatDate(value) {
  if (!value) return 'Unknown'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toISOString()
}

export function formatUser(user) {
  if (!user || !user.login) return 'Unknown'
  return `@${user.login}`
}

export function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural
}
