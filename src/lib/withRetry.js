export async function withRetry(fn, { retries = 2, baseDelayMs = 600 } = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, baseDelayMs * 2 ** attempt))
      }
    }
  }
  throw lastError
}