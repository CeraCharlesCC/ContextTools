const safeStorage = () => {
  try {
    return window.localStorage
  } catch (err) {
    return null
  }
}

export function loadSetting(key, fallback = '') {
  const storage = safeStorage()
  if (!storage) return fallback
  const value = storage.getItem(key)
  return value ?? fallback
}

export function saveSetting(key, value) {
  const storage = safeStorage()
  if (!storage) return
  if (value === null || value === undefined) {
    storage.removeItem(key)
  } else {
    storage.setItem(key, value)
  }
}
