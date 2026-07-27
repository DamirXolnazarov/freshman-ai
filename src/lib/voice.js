// Web Speech API wrapper — free, no API keys, runs entirely in the browser.
// SpeechRecognition (listening): Chrome/Edge/Chromium only. No Firefox, partial Safari.
// SpeechSynthesis (speaking): supported in effectively all modern browsers.

const SpeechRecognitionImpl =
  typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null

export function isRecognitionSupported() {
  return !!SpeechRecognitionImpl
}

export function isSynthesisSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function createRecognizer({ lang = 'en-US', onResult, onEnd, onError, interim = true } = {}) {
  if (!SpeechRecognitionImpl) return null

  const recognizer = new SpeechRecognitionImpl()
  recognizer.lang = lang
  recognizer.continuous = false
  recognizer.interimResults = interim
  recognizer.maxAlternatives = 1

  recognizer.onresult = (event) => {
    let finalTranscript = ''
    let interimTranscript = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i][0].transcript
      if (event.results[i].isFinal) finalTranscript += chunk
      else interimTranscript += chunk
    }
    onResult?.({ finalTranscript, interimTranscript })
  }

  recognizer.onend = () => onEnd?.()
  recognizer.onerror = (e) => onError?.(e)

  return recognizer
}

export function loadVoices() {
  return new Promise((resolve) => {
    if (!isSynthesisSupported()) return resolve([])
    const existing = window.speechSynthesis.getVoices()
    if (existing.length) return resolve(existing)
    window.speechSynthesis.onvoiceschanged = () => resolve(window.speechSynthesis.getVoices())
  })
}

// Picks the most natural-sounding free OS voice available, in preference
// order. No paid API — just whichever voices the user's browser/OS ships.
export function pickPreferredVoice(voices) {
  const preferredNames = ['Samantha', 'Google US English', 'Microsoft Aria Online (Natural)', 'Karen', 'Daniel']
  for (const name of preferredNames) {
    const match = voices.find((v) => v.name.includes(name))
    if (match) return match
  }
  return voices.find((v) => v.lang?.startsWith('en')) || voices[0] || null
}

export function speak(text, { voice, rate = 1.02, pitch = 1, onStart, onEnd, onError } = {}) {
  if (!isSynthesisSupported() || !text) return
  window.speechSynthesis.cancel() // clear any previous utterance first

  const utterance = new SpeechSynthesisUtterance(text)
  if (voice) utterance.voice = voice
  utterance.rate = rate
  utterance.pitch = pitch
  utterance.onstart = () => onStart?.()
  utterance.onend = () => onEnd?.()
  utterance.onerror = (e) => onError?.(e)

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (isSynthesisSupported()) window.speechSynthesis.cancel()
}