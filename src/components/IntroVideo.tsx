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
  const shellRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('fullscreen')
  const [muted, setMuted] = useState(true)
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
    const playPromise = video.play()
    if (playPromise) {
      playPromise.catch(() => {
        // Autoplay bloqueado: se reintenta al primer gesto del usuario
      })
    }

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
      el && 'ResizeObserver' in window
        ? new ResizeObserver(sync)
        : null
    if (el && observer) observer.observe(el)

    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('scroll', sync, true)
      observer?.disconnect()
    }
  }, [phase, dockSelector])

  useEffect(() => {
    const unlock = () => {
      const video = videoRef.current
      if (!video) return
      video.muted = false
      setMuted(false)
      void video.play()
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }

    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', unlock, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', unlock)
    }
  }, [])

  const toggleMute = (event: React.MouseEvent) => {
    event.stopPropagation()
    const video = videoRef.current
    if (!video) return
    const next = !video.muted
    video.muted = next
    setMuted(next)
    void video.play()
  }

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
      ref={shellRef}
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
      {phase !== 'fullscreen' && (
        <button
          type="button"
          className="intro-video__mute"
          onClick={toggleMute}
          aria-label={muted ? 'Activar sonido' : 'Silenciar'}
          title={muted ? 'Activar sonido' : 'Silenciar'}
        >
          {muted ? 'Sin audio' : 'Audio'}
        </button>
      )}
    </div>
  )
}
