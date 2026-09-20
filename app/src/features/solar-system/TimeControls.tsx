import { For, Show } from 'solid-js'
import {
  MAX_SIMULATED_DAYS,
  SCRUB_STEP,
  SPEED_CHOICES,
} from './createSimulation'

type TimeControlsProps = {
  simulatedDays: number
  playing: boolean
  speed: number
  onPlay: () => void
  onPause: () => void
  onSpeedChange: (speed: number) => void
  onScrub: (days: number) => void
  onReset: () => void
}

export default function TimeControls(props: TimeControlsProps) {
  return (
    <section class="time-controls" aria-label="Simulation controls">
      <button
        type="button"
        disabled={props.simulatedDays >= MAX_SIMULATED_DAYS}
        onClick={() => (props.playing ? props.onPause() : props.onPlay())}
      >
        {props.playing ? 'Pause' : 'Play'}
      </button>
      <label class="speed-control">
        Speed (simulated days per real second)
        <select
          value={props.speed}
          onChange={(event) =>
            props.onSpeedChange(Number(event.currentTarget.value))
          }
        >
          <For each={SPEED_CHOICES}>
            {(speed) => <option value={speed}>{speed}</option>}
          </For>
        </select>
      </label>
      <label class="scrub-control">
        Scrub simulated day
        <input
          type="range"
          min={0}
          max={MAX_SIMULATED_DAYS}
          step={SCRUB_STEP}
          value={Math.floor(props.simulatedDays)}
          aria-describedby="scrub-hint"
          onPointerDown={() => props.onPause()}
          onKeyDown={(event) => {
            if (
              [
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'Home',
                'End',
                'PageUp',
                'PageDown',
              ].includes(event.key)
            )
              props.onPause()
          }}
          onInput={(event) => props.onScrub(event.currentTarget.valueAsNumber)}
        />
      </label>
      <button type="button" onClick={() => props.onReset()}>
        Reset
      </button>
      <p class="simulation-time">
        Simulated day:{' '}
        <span>{Math.floor(props.simulatedDays).toLocaleString('en-US')}</span>
      </p>
      <p class="time-limit" id="scrub-hint">
        Scrubbing pauses time. Select Play to resume.
      </p>
      <Show when={props.simulatedDays >= MAX_SIMULATED_DAYS}>
        <p class="time-limit">
          End of the 60,000-day illustration. Scrub backward or reset to explore
          again.
        </p>
      </Show>
    </section>
  )
}
