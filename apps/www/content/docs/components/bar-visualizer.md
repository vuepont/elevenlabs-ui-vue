---
title: Bar Visualizer
description: Real-time audio frequency visualizer with state-based animations for voice agents and audio interfaces.
featured: true
component: true
---

::component-preview
---
name: bar-visualizer
description: A bar visualizer showing audio frequency bands with various states.
---
::

## Installation

::code-tabs
  ::tabs-list
    ::tabs-trigger{value="cli"}
      CLI
    ::
    ::tabs-trigger{value="manual"}
      Manual
    ::
  ::
  ::tabs-content{value="cli"}
    ```bash
    npx @elevenlabs/cli@latest add bar-visualizer
    ```
  ::

  ::tabs-content{value="manual"}
    ::steps
      ::step
        Install the following dependencies:
      ::

      ```bash
      npm install reka-ui lucide-vue-next
      ```

      ::step
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/bar-visualizer) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::

    ## Usage

```tsx showLineNumbers
import {
  BarVisualizer,
  useAudioVolume,
  useBarAnimator,
  useMultibandVolume,
  type AgentState,
  type AudioAnalyserOptions,
  type MultiBandVolumeOptions,
} from "@/components/elevenlabs-ui/bar-visualizer"
```


### Basic Visualizer

```vue showLineNumbers
<BarVisualizer :state="listening" :barCount="15" :mediaStream="stream" />
```

### Demo Mode

```vue showLineNumbers
<BarVisualizer :state="speaking" :demo="true" :centerAlign="true" />
```

## API Reference

### BarVisualizer

The main visualizer component that displays animated frequency bars.

```vue
<BarVisualizer :state="speaking" :mediaStream="stream" />
```

#### Props

| Prop        | Type             | Description                                                                    |
| ----------- | ---------------- | ------------------------------------------------------------------------------ |
| state       | `AgentState`     | Voice assistant state: connecting, initializing, listening, speaking, thinking |
| barCount    | `number`         | Number of bars to display. Default: 15                                         |
| mediaStream | `MediaStream`    | Audio source for real-time visualization                                       |
| minHeight   | `number`         | Minimum bar height as percentage. Default: 20                                  |
| maxHeight   | `number`         | Maximum bar height as percentage. Default: 100                                 |
| demo        | `boolean`        | Enable demo mode with fake audio data. Default: false                          |
| centerAlign | `boolean`        | Align bars from center instead of bottom. Default: false                       |
| ...props    | `HTMLAttributes` | All standard div element props                                                 |

### useAudioVolume Composable

Get the overall volume level from an audio stream.

```tsx
const volume = useAudioVolume(mediaStream, {
  fftSize: 32,
  smoothingTimeConstant: 0,
})
```

#### Parameters

| Parameter   | Type                   | Description                       |
| ----------- | ---------------------- | --------------------------------- |
| mediaStream | `MediaStream \| null`  | The audio stream to analyze       |
| options     | `AudioAnalyserOptions` | FFT size, smoothing, and dB range |

### useMultibandVolume Composable

Track volume across multiple frequency bands for visualization.

```tsx
const frequencyBands = useMultibandVolume(mediaStream, {
  bands: 15,
  loPass: 100,
  hiPass: 200,
  updateInterval: 32,
})
```

#### Parameters

| Parameter   | Type                     | Description                           |
| ----------- | ------------------------ | ------------------------------------- |
| mediaStream | `MediaStream \| null`    | The audio stream to analyze           |
| options     | `MultiBandVolumeOptions` | Band count, frequency range, interval |

### useBarAnimator Composable

Create animation sequences for different states.

```tsx
const highlightedIndices = useBarAnimator("connecting", 15, 100)
```

#### Parameters

| Parameter | Type             | Description                    |
| --------- | ---------------- | ------------------------------ |
| state     | `AnimationState` | Current animation state        |
| columns   | `number`         | Number of bars                 |
| interval  | `number`         | Animation frame interval in ms |

### AgentState Type

```tsx
type AgentState =
  | "connecting" // Establishing connection
  | "initializing" // Setting up
  | "listening" // Listening for input
  | "speaking" // Playing audio output
  | "thinking" // Processing
```

## Notes

- Uses Web Audio API for real-time frequency analysis
- Supports both real audio streams and demo mode for development
- Bars animate based on the current state
- FFT analysis splits audio into frequency bands
- Smooth animations using requestAnimationFrame
- Works with any MediaStream source (microphone, audio elements, WebRTC)


