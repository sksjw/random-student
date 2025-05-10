import { saveToStorage, loadFromStorage } from "./storage"
import { encryptData, decryptData } from "./crypto"

// Secret key for encryption (in a real app, this would be server-side only)
const SECRET_KEY = "RandomSelectorPro2025"

// Store selection count in a way that's harder to tamper with
export function saveSelectionCount(count: number): void {
  try {
    // Encrypt the count with a timestamp to make it harder to tamper with
    const data = {
      count,
      timestamp: Date.now(),
      checksum: generateChecksum(count.toString() + Date.now()),
    }

    const encrypted = encryptData(JSON.stringify(data), SECRET_KEY)
    saveToStorage("selection_count_secure", encrypted)

    // Also save a decoy value that's easy to find and modify
    saveToStorage("selection_count", count)
  } catch (error) {
    console.error("Error saving selection count:", error)
  }
}

// Load selection count with verification
export function loadSelectionCount(): number {
  try {
    // Try to load the encrypted value
    const encrypted = loadFromStorage<string>("selection_count_secure", "")

    if (!encrypted) {
      // If no encrypted value, check the decoy
      const decoyCount = loadFromStorage<number>("selection_count", 0)
      // Initialize the secure storage with the decoy value
      saveSelectionCount(decoyCount)
      return decoyCount
    }

    // Decrypt and verify
    const decrypted = decryptData(encrypted, SECRET_KEY)
    const data = JSON.parse(decrypted)

    // Verify checksum
    const expectedChecksum = generateChecksum(data.count.toString() + data.timestamp)
    if (data.checksum !== expectedChecksum) {
      console.warn("Selection count checksum verification failed")
      // Reset to 0 if tampering detected
      saveSelectionCount(0)
      return 0
    }

    return data.count
  } catch (error) {
    console.error("Error loading selection count:", error)
    return 0
  }
}

// Generate a simple checksum
function generateChecksum(data: string): string {
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString(16)
}

// Save membership information
export function saveMembershipInfo(info: any): void {
  try {
    const encrypted = encryptData(JSON.stringify(info), SECRET_KEY)
    saveToStorage("membership_info", encrypted)
  } catch (error) {
    console.error("Error saving membership info:", error)
  }
}

// Load membership information
export function loadMembershipInfo(): any {
  try {
    const encrypted = loadFromStorage<string>("membership_info", "")
    if (!encrypted) return null

    const decrypted = decryptData(encrypted, SECRET_KEY)
    return JSON.parse(decrypted)
  } catch (error) {
    console.error("Error loading membership info:", error)
    return null
  }
}

// Verify a license file
export function verifyLicenseFile(fileContent: string): { valid: boolean; data?: any } {
  try {
    // Decrypt the file content
    const decrypted = decryptData(fileContent, SECRET_KEY)
    const data = JSON.parse(decrypted)

    // Verify the signature
    const expectedSignature = generateSignature(data.username, data.key, data.timestamp)
    if (data.signature !== expectedSignature) {
      return { valid: false }
    }

    // Check if the license is expired (1 year from timestamp)
    const expiryDate = new Date(data.timestamp + 365 * 24 * 60 * 60 * 1000)
    if (expiryDate < new Date()) {
      return { valid: false }
    }

    return {
      valid: true,
      data: {
        username: data.username,
        key: data.key,
        expiryDate: expiryDate.toISOString(),
        verificationDate: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error("License verification error:", error)
    return { valid: false }
  }
}

// Generate a license file
export function generateLicenseFile(username: string): string {
  try {
    const timestamp = Date.now()
    const key = generateRandomKey()
    const signature = generateSignature(username, key, timestamp)

    const licenseData = {
      username,
      key,
      timestamp,
      signature,
    }

    return encryptData(JSON.stringify(licenseData), SECRET_KEY)
  } catch (error) {
    console.error("License generation error:", error)
    throw new Error("Failed to generate license")
  }
}

// Generate a random key
function generateRandomKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let result = ""
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Generate a signature for verification
function generateSignature(username: string, key: string, timestamp: number): string {
  const data = username + key + timestamp + SECRET_KEY
  return generateChecksum(data)
}
