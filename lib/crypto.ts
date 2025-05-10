// Simple encryption/decryption functions for history data
// Note: This is not military-grade encryption, but sufficient for classroom use

export function encryptData(data: string, password: string): string {
  try {
    // First convert to UTF-8 encoded string
    const encoder = new TextEncoder()
    const dataBytes = encoder.encode(data)

    // Create a password-derived key
    const passwordBytes = encoder.encode(password)

    // Simple XOR encryption with password
    const result = new Uint8Array(dataBytes.length)
    for (let i = 0; i < dataBytes.length; i++) {
      result[i] = dataBytes[i] ^ passwordBytes[i % passwordBytes.length]
    }

    // Convert to base64 for better storage
    // First convert to string
    let binaryString = ""
    result.forEach((byte) => {
      binaryString += String.fromCharCode(byte)
    })

    return btoa(binaryString)
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt data")
  }
}

export function decryptData(encryptedData: string, password: string): string {
  try {
    // Decode from base64
    const binaryString = atob(encryptedData)
    const dataBytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      dataBytes[i] = binaryString.charCodeAt(i)
    }

    // Create a password-derived key
    const encoder = new TextEncoder()
    const passwordBytes = encoder.encode(password)

    // XOR decryption with password
    const result = new Uint8Array(dataBytes.length)
    for (let i = 0; i < dataBytes.length; i++) {
      result[i] = dataBytes[i] ^ passwordBytes[i % passwordBytes.length]
    }

    // Convert back to string
    const decoder = new TextDecoder()
    return decoder.decode(result)
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt data")
  }
}
