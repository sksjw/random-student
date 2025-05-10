export function saveToStorage<T>(key: string, data: T): void {
  try {
    const serializedData = JSON.stringify(data)
    localStorage.setItem(key, serializedData)
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`)
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const serializedData = localStorage.getItem(key)
    if (serializedData === null) {
      return defaultValue
    }
    return JSON.parse(serializedData) as T
  } catch (error) {
    console.error(`Error loading from localStorage: ${error}`)
    return defaultValue
  }
}

export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error(`Error removing from localStorage: ${error}`)
  }
}

export function clearStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`)
  }
}
