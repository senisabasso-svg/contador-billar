import { useEffect, useRef, useState } from 'react'

const FULLSCREEN_MS = 2200
const SHRINK_MS = 1100

type Phase = 'fullscreen' | 'shrinking' | 'docked'

interface DockRect {
  top: number
  left: number
  width: number
  height: number
}

interface IntroVideoProps {
  dockSelector?: string
}

export function IntroVideo({ dockSelector = '#video-dock' }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [phase, setPhase] = useState<Phase>('fullscreen')
  const [dock, setDock] = useState<DockRect | null>(null)

  const measureDock = () => {
    const el = document.querySelector(dockSelector)
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.muted = true
    video.volume = 0
    const playPromise = video.play()
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay bloqueado: se reintenta al primer gesto del usuario
      })
    }

    const retryPlay = () => {
      const current = videoRef.current
      if (!current) return
      current.muted = true
      current.volume = 0
      void current.play()
    }

    window.addEventListener('pointerdown', retryPlay, { once: true })

    const shrinkTimer = window.setTimeout(() => {
      setDock(measureDock())
      setPhase('shrinking')
    }, FULLSCREEN_MS)

    const dockTimer = window.setTimeout(() => {
      setDock(measureDock())
      setPhase('docked')
    }, FULLSCREEN_MS + SHRINK_MS)

    return () => {
      window.clearTimeout(shrinkTimer)
      window.clearTimeout(dockTimer)
      window.removeEventListener('pointerdown', retryPlay)
    }
  }, [dockSelector])

  useEffect(() => {
    if (phase === 'fullscreen') return

    const sync = () => setDock(measureDock())
    sync()

    window.addEventListener('resize', sync)
    window.addEventListener('scroll', sync, true)

    const el = document.querySelector(dockSelector)
    const observer =
      el && 'ResizeObserver' in window ? new ResizeObserver(sync) : null
    if (el && observer) observer.observe(el)

    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, true)
      observer?.disconnect()
    }
  }, [phase, dockSelector])

  const style =
    phase !== 'fullscreen' && dock
      ? {
          top: dock.top,
          left: dock.left,
          width: dock.width,
          height: dock.height,
        }
      : undefined

  return (
    <div
      className={`intro-video intro-video--${phase}`}
      style={style}
      aria-hidden={phase === 'fullscreen' ? true : undefined}
    >
      <video
        ref={videoRef}
        className="intro-video__media"
        src="/login-video.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  )
}
