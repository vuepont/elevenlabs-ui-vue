---
title: Live Waveform
description: Real-time canvas-based audio waveform visualizer with microphone input and customizable rendering modes.
featured: true
component: true
---

::component-preview
---
name: live-waveform
description: Real-time microphone input visualization with audio reactivity.
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
    npx elevenlabs-ui-vue@latest add live-waveform
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
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/live-waveform) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::


## Usage

```tsx showLineNumbers
import { LiveWaveform } from "@/components/elevenlabs-ui/live-waveform"
```

```vue showLineNumbers
<LiveWaveform active="true" />
```

## Examples

### Static Mode

```vue showLineNumbers
<LiveWaveform active="true" mode="static" />
```

### Scrolling Mode

```vue showLineNumbers
<LiveWaveform :active="true" :mode="scrolling" />
```

### Processing State

Shows an animated wave pattern while waiting for input.

```vue showLineNumbers
<LiveWaveform :processing="true" :mode="static" />
```

### Custom Styling

```vue showLineNumbers
<LiveWaveform
    :active="true"
    :barWidth="4"
    :barHeight="6"
    :barGap="2"
    :barColor="#3b82f6"
    :height="100"
    :fadeEdges="true"
/>
```

## API Reference

### LiveWaveform

A canvas-based real-time audio visualizer with microphone input support.

#### Props

| Prop                  | Type                            | Default    | Description                                    |
| --------------------- | ------------------------------- | ---------- | ---------------------------------------------- |
| active                | `boolean`                       | `false`    | Whether to actively listen to microphone input |
| processing            | `boolean`                       | `false`    | Show processing animation when not active      |
| barWidth              | `number`                        | `3`        | Width of each bar in pixels                    |
| barHeight             | `number`                        | `4`        | Height of each bar in pixels                   |
| barGap                | `number`                        | `1`        | Gap between bars in pixels                     |
| barRadius             | `number`                        | `1.5`      | Border radius of bars                          |
| barColor              | `string`                        | -          | Color of the bars (defaults to text color)     |
| fadeEdges             | `boolean`                       | `true`     | Whether to fade the edges of the waveform      |
| fadeWidth             | `number`                        | `24`       | Width of the fade effect in pixels             |
| height                | `string \| number`              | `64`       | Height of the waveform                         |
| sensitivity           | `number`                        | `1`        | Audio sensitivity multiplier                   |
| smoothingTimeConstant | `number`                        | `0.8`      | Audio analyser smoothing (0-1)                 |
| fftSize               | `number`                        | `256`      | FFT size for audio analysis                    |
| historySize           | `number`                        | `60`       | Number of bars to keep in history (scrolling)  |
| updateRate            | `number`                        | `30`       | Update rate in milliseconds                    |
| mode                  | `"scrolling" \| "static"`       | `"static"` | Visualization mode                             |
| class                 | `string`                        | -          | Custom CSS class                               |
| ...props              | `HTMLAttributes`                | -          | All standard div element props                 |

#### Emits

| Event             | Type                                                             | Description                            |
| ----------------- | ---------------------------------------------------------------- | ---------------------------------------|
| error             | `(error: Error) => void`                                         | Callback when  an error occurs         |
| stream-ready      | `(stream: MediaStream) => void`                                  | Callback when stream is ready          |
| stream-end        | `() => void`                                                     | Callback when  when stream ends        |


## Notes

- Uses Web Audio API for real-time frequency analysis
- Automatically requests microphone permissions when `active="true"`
- Canvas-based rendering with HiDPI support
- Properly cleans up media streams and audio contexts on unmount
- **Static mode**: Displays symmetric waveform bars across multiple frequency bands (detailed visualization)
- **Scrolling mode**: Shows historical average audio volume as bars scrolling from right to left (timeline view)
- **Processing state**: Shows animated waves while waiting for input
- Smooth transitions between active, processing, and idle states
- Scrolling mode builds up history gradually - bars appear from right and fill over time
