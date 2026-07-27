import { useState, useEffect } from 'react'
import { getSavedUniversities, checklistProgress } from '../lib/universities.js'

export function useUniversityStrategyProgress(studentId) {
  const [progress, setProgress] = useState(0)
  const [detail, setDetail] = useState('No schools saved yet')
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!studentId) return
    let cancelled = false

    async function load() {
      const saved = await getSavedUniversities(studentId)
      if (cancelled) return

      if (saved.length === 0) {
        setProgress(0)
        setDetail('No schools saved yet')
        setCount(0)
        return
      }

      const avg = Math.round(
        saved.reduce((sum, s) => sum + checklistProgress(s.checklist || {}), 0) / saved.length
      )
      const reach = saved.filter((s) => s.category === 'reach').length
      const target = saved.filter((s) => s.category === 'target').length
      const likely = saved.filter((s) => s.category === 'likely').length

      setProgress(avg)
      setDetail(`${saved.length} saved · ${reach} reach, ${target} target, ${likely} likely`)
      setCount(saved.length)
    }

    load()
    return () => { cancelled = true }
  }, [studentId])

  return { progress, detail, count }
}