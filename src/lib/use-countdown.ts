import { useEffect, useRef, useState } from 'react'

export function useCountdown(initialSeconds = 0) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds)
  const secondsLeftRef = useRef(secondsLeft)

  useEffect(() => {
    secondsLeftRef.current = secondsLeft
  }, [secondsLeft])

  useEffect(() => {
    const interval = setInterval(() => {
      if (secondsLeftRef.current <= 0) return
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  function start(seconds: number) {
    setSecondsLeft(seconds)
  }

  return { secondsLeft, start, isRunning: secondsLeft > 0 }
}
