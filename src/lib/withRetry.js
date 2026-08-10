export async function withRetry(fn, { retries = 2, baseDelayMs = 1000 } = {}) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      const is429 = err?.message?.includes('429')
      // 413 / "request too large" means the payload itself is the
      // problem, not timing — retrying sends the exact same size again
      // and will fail identically every time, just wasting TPM budget
      // and stacking up duplicate error toasts. Fail fast instead.
      const isOversized = err?.message?.includes('413') || err?.message?.includes('rate_limit_exceeded') || err?.message?.includes('Request too large')
      if (isOversized) throw err

      if (attempt < retries) {
        const delay = is429 ? baseDelayMs * 3 * (attempt + 1) : baseDelayMs * 2 ** attempt
        await new Promise((r) => setTimeout(r, delay))
      }
    }
  }
  throw lastError
}