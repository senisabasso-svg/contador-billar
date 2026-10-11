import { useCallback, useEffect, useRef, useState } from 'react'

interface UseShotClockOptions {
  seconds: number
  turnKey: number
  enabled: boolean
  onExpire: () => void
}

export function useShotClock({
  seconds,
  turnKey,
  enabled,
  onExpire,
}: UseShotClockOptions) {
  const [left, setLeft] = useState(seconds)
  const [running, setRunning] = useState(false)
  const [expired, setExpired] = useState(false)
  const onExpireRef = useRef(onExpire)
  const alarmPlayed = useRef(false)

  onExpireRef.current = onExpire

  // Al cambiar turno o duración: dejar listo, sin correr hasta "Iniciar"
  useEffect(() => {
    alarmPlayed.current = false
    setExpired(false)
    setLeft(seconds)
    setRunning(false)
  }, [turnKey, seconds])

  useEffect(() => {
    if (!enabled) {
      setRunning(false)
    }
  }, [enabled])

  useEffect(() => {
    if (!running || !enabled || expired) return

    const startedAt = Date.now()
    const initialLeft = left
    const id = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000
      const next = Math.max(0, initialLeft - elapsed)
      setLeft(next)
      if (next <= 0) {
        window.clearInterval(id)
        setRunning(false)
        setExpired(true)
        if (!alarmPlayed.current) {
          alarmPlayed.current = true
          playAlarm()
          onExpireRef.current()
        }
      }
    }, 100)

    return () => window.clearInterval(id)
    // Solo arranca/reinicia el interval cuando running cambia a true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, enabled, turnKey])

  const start = useCallback(() => {
    if (!enabled) return
    alarmPlayed.current = false
    setExpired(false)
    setLeft((current) => (current <= 0 ? seconds : current))
    setRunning(true)
  }, [enabled, seconds])

  const restart = useCallback(() => {
    alarmPlayed.current = false
    setExpired(false)
    setLeft(seconds)
    setRunning(false)
  }, [seconds])

  return {
    left,
    running,
    expired,
    start,
    restart,
  }
}

function playAlarm() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    const ctx = new Ctx()
    const now = ctx.currentTime
    for (let i = 0; i < 3; i += 1) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.0001, now + i * 0.22)
      gain.gain.exponentialRampToValueAtTime(0.2, now + i * 0.22 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.22 + 0.18)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(now + i * 0.22)
      osc.stop(now + i * 0.22 + 0.2)
    }
    window.setTimeout(() => void ctx.close(), 1200)
  } catch {
    // sin audio
  }
}
