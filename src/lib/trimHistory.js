// Groq's llama-3.1-8b-instant is capped at a small tokens-per-minute
// budget on the free tier (6000 TPM as of writing). Sending the full
// chat history on every message eventually blows past that in a single
// request. There's no tokenizer available client-side, so we estimate
// ~4 characters per token (a reasonable approximation for English) and
// trim from the oldest messages first, always keeping the most recent
// turns intact since those matter most for context.
const CHARS_PER_TOKEN_ESTIMATE = 4
const MAX_HISTORY_TOKENS = 3200 // leaves headroom under 6000 for the system prompt + new message + response

export function trimHistory(messages) {
  let budget = MAX_HISTORY_TOKENS * CHARS_PER_TOKEN_ESTIMATE
  const kept = []

  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]
    const len = (msg.content || '').length
    if (len > budget && kept.length > 0) break // stop once budget's gone, but always keep at least the latest message
    kept.unshift(msg)
    budget -= len
  }

  return kept
}