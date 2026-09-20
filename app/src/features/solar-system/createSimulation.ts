import { createSignal, onCleanup, untrack } from 'solid-js'

export const DEFAULT_SPEED = 30

export function createSimulation(initiallyPlaying = true) {
  const [simulatedDays, setSimulatedDays] = createSignal(0)
  const [playing, setPlaying] = createSignal(
    initiallyPlaying &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const [speed, setSpeed] = createSignal(DEFAULT_SPEED)
  let frame: number | undefined
  let previousTimestamp: number | undefined
  let disposed = false

  function stopFrame() {
    if (frame !== undefined) cancelAnimationFrame(frame)
    frame = undefined
    previousTimestamp = undefined
  }

  function scheduleFrame() {
    if (!disposed && playing() && !document.hidden && frame === undefined) {
      frame = requestAnimationFrame(advance)
    }
  }

  function advance(timestamp: number) {
    frame = undefined
    if (disposed || !playing() || document.hidden) return
    if (previousTimestamp !== undefined) {
      const elapsedSeconds = (timestamp - previousTimestamp) / 1000
      setSimulatedDays((days) => days + elapsedSeconds * speed())
    }
    previousTimestamp = timestamp
    scheduleFrame()
  }

  function pause() {
    setPlaying(false)
    stopFrame()
  }

  function visibilityChanged() {
    stopFrame()
    scheduleFrame()
  }

  document.addEventListener('visibilitychange', visibilityChanged)
  untrack(scheduleFrame)
  onCleanup(() => {
    disposed = true
    stopFrame()
    document.removeEventListener('visibilitychange', visibilityChanged)
  })

  return {
    simulatedDays,
    playing,
    speed,
    setSpeed,
    play() {
      if (disposed) return
      setPlaying(true)
      scheduleFrame()
    },
    pause,
  }
}
