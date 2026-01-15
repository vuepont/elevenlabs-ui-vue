---
title: Waveform
description: Canvas-based audio waveform visualization components with recording, playback scrubbing, and microphone input support.
featured: true
component: true
---

::component-preview
---
name: waveform
description: A live scrolling waveform visualization with smooth animations.
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
    npx elevenlabsui-vue@latest add waveform
    ```
  ::

  ::tabs-content{value="manual"}
    ::steps
      <!-- ::step
        Install the following dependencies:
      ::

      ```bash
      npm install reka-ui lucide-vue-next
      ``` -->

      ::step
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/waveform) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::


## Usage

```tsx showLineNumbers
import {
  AudioScrubber,
  LiveMicrophoneWaveform,
  MicrophoneWaveform,
  RecordingWaveform,
  ScrollingWaveform,
  StaticWaveform,
  Waveform,
} from "@/components/elevenlabs-ui/waveform"
```

### Basic Waveform

```vue showLineNumbers
<script setup lang="ts">
const data = Array.from({ length: 50 }, () => Math.random())
</script>

<template>
    <Waveform
      :data="data"
      :height="100"
      :bar-width="4"
      :bar-gap="2"
    />
</template>
```

### Scrolling Animation

```vue showLineNumbers
<template>
    <ScrollingWaveform
      :height="80"
      :speed="50"
      :bar-count="60"
      bar-color="hsl(var(--primary))"
      :fade-edges="true"
    />
</template>
```

### Microphone Input

```vue showLineNumbers
<script setup lang="ts">
const isRecording = ref(false)
</script>

<template>
    <MicrophoneWaveform
      :active="isRecording"
      :height="100"
      :sensitivity="1.5"
      @error="(error) => console.error('Microphone error:', error)"
    />
</template>
```



## API Reference

### Waveform

The base waveform component that displays audio data as bars.

```vue
<template>
    <Waveform :data="audioData" />
</template>
```

#### Props

| Prop       | Type                                     | Description                                        |
| ---------- | ---------------------------------------- | -------------------------------------------------- |
| data       | `number[]`                               | Array of values between 0 and 1 for each bar       |
| barWidth   | `number`                                 | Width of each bar in pixels. Default: 4            |
| barHeight  | `number`                                 | Height of each bar in pixels. Default: 4           |
| barGap     | `number`                                 | Gap between bars in pixels. Default: 2             |
| barRadius  | `number`                                 | Border radius of bars. Default: 2                  |
| barColor   | `string`                                 | Custom bar color. Uses foreground color by default |
| fadeEdges  | `boolean`                                | Apply fade effect to edges. Default: true          |
| fadeWidth  | `number`                                 | Width of fade effect in pixels. Default: 24        |
| height     | `string \| number`                       | Height of the waveform. Default: 128               |

#### Emits

| Event             | Type                                         | Description                               |
| ----------------- | ---------------------------------------------| ----------------------------------------- |
| barClick          | `(index: number, value: number) => void`     | Callback when a bar is clicked            |


### ScrollingWaveform

Continuously scrolling waveform with auto-generated bars.

```vue
<template>
    <ScrollingWaveform :speed="50" />
</template>
```

#### Props

| Prop     | Type            | Description                                       |
| -------- | --------------- | ------------------------------------------------- |
| speed    | `number`        | Scroll speed in pixels per second. Default: 50    |
| barCount | `number`        | Number of bars to display. Default: 60            |
| ...props | `WaveformProps` | All Waveform props except `data`                  |

### AudioScrubber

Interactive waveform for audio playback with seek functionality.

```vue
<template>
    <AudioScrubber
      :data="waveformData"
      :currentTime="playbackTime"
      :duration="totalDuration"
      @seek="handleSeek"
    />
</template>
```

#### Props

| Prop        | Type                     | Description                             |
| ----------- | ------------------------ | --------------------------------------- |
| currentTime | `number`                 | Current playback time in seconds        |
| duration    | `number`                 | Total duration in seconds. Default: 100 |
| showHandle  | `boolean`                | Show draggable handle. Default: true    |
| ...props    | `WaveformProps`          | All standard Waveform props             |

#### Emits

| Event             | Type                                         | Description                               |
| ----------------- | ---------------------------------------------| ----------------------------------------- |
| seek              | `(time: number) => void`                     | Callback when user seeks to a new time    |

### MicrophoneWaveform

Real-time microphone input visualization.

```vue
<template>
    <MicrophoneWaveform :active="isListening" :sensitivity="1.5" />
</template>
```

#### Props

| Prop                  | Type                     | Description                                     |
| --------------------- | ------------------------ | ----------------------------------------------- |
| active                | `boolean`                | Enable/disable microphone input. Default: false |
| fftSize               | `number`                 | FFT size for frequency analysis. Default: 256   |
| smoothingTimeConstant | `number`                 | Smoothing factor (0-1). Default: 0.8            |
| sensitivity           | `number`                 | Amplitude sensitivity. Default: 1               |
| ...props              | `WaveformProps`          | All standard Waveform props                     |

#### Emits

| Event             | Type                             | Description              |
| ----------------- | ---------------------------------| ------------------------ |
| error             | `(error: Error) => void`         | Error callback           |

### StaticWaveform

Waveform with deterministic random data based on seed.

```vue
<template>
    <StaticWaveform :bars="40" :seed="42" />
</template>
```

#### Props

| Prop     | Type            | Description                             |
| -------- | --------------- | --------------------------------------- |
| bars     | `number`        | Number of bars to generate. Default: 40 |
| seed     | `number`        | Random seed for consistent data         |
| ...props | `WaveformProps` | All standard Waveform props             |

### LiveMicrophoneWaveform

Advanced microphone visualization with recording history and playback scrubbing.

```vue
<template>
    <LiveMicrophoneWaveform
      :active="isRecording"
      :enableAudioPlayback="true"
      :playbackRate="1"
    />
</template>
```

#### Props

| Prop                | Type                               | Description                                        |
| ------------------- | ---------------------------------- | -------------------------------------------------- |
| active              | `boolean`                          | Enable/disable recording                           |
| historySize         | `number`                           | Max bars to keep in history. Default: 150          |
| updateRate          | `number`                           | Update interval in ms. Default: 50                 |
| enableAudioPlayback | `boolean`                          | Enable audio scrubbing when stopped. Default: true |
| playbackRate        | `number`                           | Audio playback speed. Default: 1                   |
| savedHistory        | `number`                           | External ref to persist history                    |
| dragOffset          | `number`                           | External drag offset control                       |
| ...props            | `ScrollingWaveformProps`           | All ScrollingWaveform props                        |

#### Emits

| Event             | Type                             | Description                 |
| ----------------- | ---------------------------------| --------------------------- |
| update:dragOffset | `(offset: number) => void`       | External drag offset setter |

### RecordingWaveform

Recording interface with scrubbing through recorded audio.

```vue
<template>
    <RecordingWaveform
      :recording="isRecording"
      @recording-complete="(data) => console.log('Recording data:', data)"
    />
</template>
```

#### Props

| Prop                | Type                       | Description                          |
| ------------------- | -------------------------- | ------------------------------------ |
| recording           | `boolean`                  | Recording state. Default: false      |
| showHandle          | `boolean`                  | Show scrubbing handle. Default: true |
| updateRate          | `number`                   | Update interval in ms. Default: 50   |
| ...props            | `WaveformProps`            | All standard Waveform props          |

#### Emits

| Event             | Type                             | Description                               |
| ----------------- | ---------------------------------| ----------------------------------------- |
| recordingComplete | `(data: number[]) => void`       | Callback with recorded waveform data      |

## Examples

### Music Player Visualization

```vue showLineNumbers
<script setup>
const audioData = computed(() =>
  Array.from({ length: 100 }, () => 0.2 + Math.random() * 0.6)
)
</script>

<template>
    <AudioScrubber
      :data="audioData"
      :current-time="currentTime"
      :duration="duration"
      @seek="handleSeek"
      :height="60"
      :bar-width="3"
      :bar-gap="1"
      bar-color="hsl(var(--primary))"
    />
</template>
```

### Voice Recorder

```vue showLineNumbers
<script setup>
import { ref } from 'vue'

const recording = ref(false)
</script>

<template>
    <div class="space-y-4">
      <RecordingWaveform
        :recording="recording"
        :height="100"
        @recording-complete="(data) => {
          console.log('Recording complete', data)
        }"
      />

      <Button @click="recording = !recording">
        {{ recording ? 'Stop' : 'Start' }} Recording
      </Button>
    </div>
</template>
```

### Live Audio Monitor

```vue showLineNumbers
<script setup>
import { ref } from 'vue'

const active = ref(false)
</script>

<template>
    <MicrophoneWaveform
      :active="active"
      :height="80"
      :sensitivity="2"
      :bar-width="2"
      :bar-gap="1"
      @error="(error) => {
        console.error('Microphone error:', error)
        active = false
      }"
    />
</template>
```

## Notes

- All waveform components use HTML5 Canvas for high-performance rendering
- Animations are synchronized using `requestAnimationFrame` for smooth 60fps updates
- Microphone components require user permission to access audio input devices
- The components automatically handle device pixel ratio for crisp rendering on high-DPI displays
- Bar colors default to the CSS variable `--foreground` but can be customized
- Canvas-based implementation ensures high performance even with hundreds of bars
- ResizeObserver used for responsive canvas sizing
- Proper cleanup of audio contexts and media streams on unmount
- Supports both static data visualization and real-time audio input
- Click handlers available on bars for interactive waveforms
