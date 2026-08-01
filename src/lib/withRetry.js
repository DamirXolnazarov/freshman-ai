export async function withRetry(fn, { retries = 2, baseDelayMs = 1000 } = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const is429 = err?.message?.includes('429')
      if (attempt < retries) {
        const delay = is429 ? baseDelayMs * 3 * (attempt + 1) : baseDelayMs * 2 ** attempt
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastError
}