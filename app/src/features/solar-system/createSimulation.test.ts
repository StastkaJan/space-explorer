// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRoot } from 'solid-js'
import {
  createSimulation,
  DEFAULT_SPEED,
  MAX_SIMULATED_DAYS,
} from './createSimulation'

let dispose: () => void
let nextId: number
let frames: Map<number, FrameRequestCallback>
let hidden: boolean
let reducedMotion: boolean

beforeEach(() => {
  frames = new Map()
  nextId = 0
  hidden = false
  reducedMotion = false
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden)
  vi.stubGlobal('matchMedia', () => ({ matches: reducedMotion }))
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(++nextId, callback)
    return nextId
  })
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id))
})

afterEach(() => {
  dispose?.()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function start(initiallyPlaying = true) {
  return createRoot((cleanup) => {
    dispose = cleanup
    return createSimulation(initiallyPlaying)
  })
}

function tick(timestamp: number) {
  const pending = [...frames.values()]
  frames.clear()
  pending.forEach((callback) => callback(timestamp))
}

function setHidden(value: boolean) {
  hidden = value
  document.dispatchEvent(new Event('visibilitychange'))
}

describe('shared simulation clock', () => {
  it('stops exactly at the illustration boundary and ignores Play at the end', () => {
    const clock = start()
    clock.setSpeed(1000)
    tick(0)
    tick(61_000)
    expect(clock.simulatedDays()).toBe(MAX_SIMULATED_DAYS)
    expect(clock.playing()).toBe(false)
    expect(frames.size).toBe(0)
    clock.play()
    expect(clock.playing()).toBe(false)
    expect(frames.size).toBe(0)
  })

  it('rejects invalid speeds without changing playback or time', () => {
    const clock = start()
    tick(0)
    tick(1000)
    for (const value of [NaN, Infinity, -1, 0]) clock.setSpeed(value)
    expect(clock.speed()).toBe(DEFAULT_SPEED)
    expect(clock.simulatedDays()).toBe(DEFAULT_SPEED)
    expect(clock.playing()).toBe(true)
  })
  it('uses one loop and advances days by elapsed seconds times the current speed', () => {
    const clock = start()
    clock.play()
    clock.play()
    expect(frames.size).toBe(1)
    tick(100)
    expect(clock.simulatedDays()).toBe(0)
    tick(600)
    expect(clock.simulatedDays()).toBe(DEFAULT_SPEED / 2)
    clock.setSpeed(120)
    expect(clock.simulatedDays()).toBe(DEFAULT_SPEED / 2)
    tick(850)
    expect(clock.simulatedDays()).toBe(DEFAULT_SPEED / 2 + 30)
    expect(frames.size).toBe(1)
  })

  it('pauses with no frames and resumes from a fresh timestamp', () => {
    const clock = start()
    tick(0)
    tick(1000)
    clock.pause()
    expect(clock.playing()).toBe(false)
    expect(frames.size).toBe(0)
    clock.setSpeed(60)
    expect(clock.playing()).toBe(false)
    clock.play()
    tick(100_000)
    expect(clock.simulatedDays()).toBe(30)
    tick(101_000)
    expect(clock.simulatedDays()).toBe(90)
  })

  it('suspends while hidden without catching up or restarting user-paused playback', () => {
    const clock = start()
    tick(0)
    tick(1000)
    setHidden(true)
    expect(frames.size).toBe(0)
    expect(clock.playing()).toBe(true)
    clock.play()
    expect(frames.size).toBe(0)
    setHidden(false)
    tick(100_000)
    expect(clock.simulatedDays()).toBe(30)
    tick(101_000)
    expect(clock.simulatedDays()).toBe(60)
    setHidden(true)
    clock.pause()
    setHidden(false)
    expect(frames.size).toBe(0)
    expect(clock.playing()).toBe(false)
  })

  it('starts hidden without a frame and starts reduced-motion or intermediate UI paused', () => {
    hidden = true
    const clock = start()
    expect(frames.size).toBe(0)
    setHidden(false)
    expect(frames.size).toBe(1)
    clock.pause()
    dispose()
    reducedMotion = true
    const reduced = start()
    expect(reduced.playing()).toBe(false)
    expect(frames.size).toBe(0)
    reduced.play()
    expect(frames.size).toBe(1)
    dispose()
    reducedMotion = false
    expect(start(false).playing()).toBe(false)
    expect(frames.size).toBe(0)
  })

  it('removes its listener and prevents frames from mutating disposed state', () => {
    const added = vi.spyOn(document, 'addEventListener')
    const removed = vi.spyOn(document, 'removeEventListener')
    const clock = start()
    tick(0)
    const staleFrame = [...frames.values()][0]!
    const listener = added.mock.calls.find(
      ([name]) => name === 'visibilitychange',
    )![1]
    dispose()
    expect(removed).toHaveBeenCalledWith('visibilitychange', listener)
    expect(frames.size).toBe(0)
    staleFrame(1000)
    clock.play()
    setHidden(false)
    expect(clock.simulatedDays()).toBe(0)
    expect(frames.size).toBe(0)
  })
})
