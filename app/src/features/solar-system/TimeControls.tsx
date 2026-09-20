import { For, Show } from 'solid-js'
import { MAX_SIMULATED_DAYS, SPEED_CHOICES } from './createSimulation'

type TimeControlsProps = {
  simulatedDays: number
  playing: boolean
  speed: number
  onPlay: () => void
  onPause: () => void
  onSpeedChange: (speed: number) => void
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
      <p class="simulation-time">
        Simulated day:{' '}
        <span>{Math.floor(props.simulatedDays).toLocaleString('en-US')}</span>
      </p>
      <Show when={props.simulatedDays >= MAX_SIMULATED_DAYS}>
        <p class="time-limit">
          End of the 60,000-day illustration. Playback is paused.
        </p>
      </Show>
    </section>
  )
}
