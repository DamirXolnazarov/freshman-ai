import { useState, useRef, useCallback, useEffect } from 'react'
import {
  createRecognizer,
  isRecognitionSupported,
  isSynthesisSupported,
  loadVoices,
  pickPreferredVoice,
  speak,
  stopSpeaking,
} from '../lib/voice.js'

// Ties mic -> transcript -> onSend(text) together, and exposes speakReply()
// for the caller to invoke once the assistant's response text is ready.
export function useVoiceMode({ onSend }) {
  const [status, setStatus] = useState('idle') // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState('')
  const [supported] = useState(() => isRecognitionSupported() && isSynthesisSupported())
  const voiceRef = useRef(null)
  const recognizerRef = useRef(null)

  useEffect(() => {
    if (!isSynthesisSupported()) return
    loadVoices().then((voices) => {
      voiceRef.current = pickPreferredVoice(voices)
    })
  }, [])

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop()
  }, [])

  const startListening = useCallback(() => {
    if (!supported) return
    setTranscript('')
    setStatus('listening')

    const recognizer = createRecognizer({
      onResult: ({ finalTranscript, interimTranscript }) => {
        setTranscript(finalTranscript || interimTranscript)
      },
      onEnd: () => setStatus((prev) => (prev === 'listening' ? 'idle' : prev)),
      onError: () => setStatus('idle'),
    })
    if (!recognizer) return
    recognizerRef.current = recognizer
    recognizer.start()
  }, [supported])

  // Call with the final transcript to actually send it to chat
  const submitTranscript = useCallback(
    (text) => {
      const finalText = (text ?? transcript).trim()
      stopListening()
      if (!finalText) {
        setStatus('idle')
        return
      }
      setStatus('thinking')
      onSend?.(finalText)
    },
    [transcript, onSend, stopListening]
  )

  const speakReply = useCallback((text) => {
    setStatus('speaking')
    speak(text, {
      voice: voiceRef.current,
      onEnd: () => setStatus('idle'),
      onError: () => setStatus('idle'),
    })
  }, [])

  const cancelVoice = useCallback(() => {
    stopListening()
    stopSpeaking()
    setStatus('idle')
    setTranscript('')
  }, [stopListening])

  return { supported, status, transcript, startListening, stopListening, submitTranscript, speakReply, cancelVoice }
}