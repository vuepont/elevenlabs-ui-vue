---
title: Audio Player
description: A customizable audio player with progress controls and playback management for music, podcasts, and voice content.
featured: true
component: true
---

::component-preview
---
name: audio-player
description: An audio player.
hideCode: true
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
    npx @elevenlabs/cli@latest add audio-player
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
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/audio-player) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::

## Usage

```vue showLineNumbers
<script setup lang="ts">
import {
  AudioPlayerButton,
  AudioPlayerDuration,
  AudioPlayerProgress,
  AudioPlayerProvider,
  AudioPlayerSpeed,
  AudioPlayerSpeedButtonGroup,
  AudioPlayerTime,
  useAudioPlayer,
} from "@/components/elevenlabs-ui/audio-player"
</script>
```

### Basic Player

```vue showLineNumbers
<template>
    <AudioPlayerProvider>
      <div class="flex items-center gap-4">
        <AudioPlayerButton />
        <AudioPlayerProgress class="flex-1" />
        <AudioPlayerTime />
        <span>/</span>
        <AudioPlayerDuration />
      </div>
    </AudioPlayerProvider>
</template>
```

### Playing a Specific Track

```vue showLineNumbers
<script setup lang="ts">
// import audio-player components

const track = {
  id: "track-1",
  src: "/audio/song.mp3",
  data: { title: "My Song", artist: "Artist Name" }
}
</script>

<template>
    <AudioPlayerProvider>
     <AudioPlayerButton :item="track" />
     <AudioPlayerProgress />
   </AudioPlayerProvider>
</template>
```

### Multiple Tracks

```vue showLineNumbers
<script setup lang="ts">
// import audio-player components

const tracks = [
   { id: "1", src: "/audio/track1.mp3", data: { title: "Track 1" } },
   { id: "2", src: "/audio/track2.mp3", data: { title: "Track 2" } },
   { id: "3", src: "/audio/track3.mp3", data: { title: "Track 3" } },
]
</script>

<template>
    <AudioPlayerProvider>
      <div class="space-y-4">
        <div v-for="track in tracks"
          :key="track.id"
          class="flex items-center gap-4"
        >
          <AudioPlayerButton :item="track" />
          <span class="text-sm">{{ track.data.title }}</span>
        </div>
      
        <AudioPlayerProgress class="w-full" />
    
        <div class="flex gap-2 text-sm">
          <AudioPlayerTime />
          <span>/</span>
          <AudioPlayerDuration />
        </div>
      </div>
    </AudioPlayerProvider>
</template>
```

## API Reference

### AudioPlayerProvider

The provider component that manages audio state and playback. Must wrap all audio player components.

```tsx
<AudioPlayerProvider>
    <slot />
</AudioPlayerProvider>
```

### AudioPlayerButton

A play/pause button that controls playback. Shows a loading spinner when buffering.

#### Props

| Prop     | Type                     | Description                                                                   |
| -------- | ------------------------ | ----------------------------------------------------------------------------- |
| item     | `AudioPlayerItem<TData>` | Optional. The audio item to play. If not provided, controls the current track |
| ...props | `ButtonProps`            | All standard Button component props                                           |

#### AudioPlayerItem Type

```tsx
interface AudioPlayerItem<TData = unknown> {
   id: string | number
   src: string
   data?: TData
}
```

### AudioPlayerProgress

A slider that shows playback progress and allows seeking. Pauses during seeking and resumes after.

#### Props

| Prop     | Type          | Description                                                |
| -------- | ------------- | ---------------------------------------------------------- |
| ...props | `SliderProps` | All Reka UI Slider props except `min`, `max`, and `value`  |

### AudioPlayerTime

Displays the current playback time in formatted time (e.g., "1:30").

#### Props

| Prop      | Type              | Description                     |
| --------- | ----------------- | ------------------------------- |
| class | `string`          | Optional CSS classes            |
| ...props  | `HTMLAttributes` | All standard span element props |

### AudioPlayerDuration

Displays the total duration of the current track or "--:--" when unavailable.

#### Props

| Prop      | Type              | Description                     |
| --------- | ----------------- | ------------------------------- |
| class | `string`          | Optional CSS classes            |
| ...props  | `HTMLAttributes` | All standard span element props |

### AudioPlayerSpeed

A dropdown menu button (with settings icon) for controlling playback speed. Displays "Normal" for 1x speed and shows other speeds with "x" suffix (e.g., "0.5x", "1.5x").

#### Props

| Prop     | Type                | Default                                    | Description                         |
| -------- | ------------------- | ------------------------------------------ | ----------------------------------- |
| speeds   | `readonly number[]` | `[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]` | Available playback speeds           |
| variant  | `ButtonVariant`     | `"ghost"`                                  | Button variant                      |
| size     | `ButtonSize`        | `"icon"`                                   | Button size                         |
| ...props | `ButtonProps`       | -                                          | All standard Button component props |

#### Example

```tsx
<AudioPlayerSpeed variant="ghost" size="icon" />
```

### AudioPlayerSpeedButtonGroup

A button group component for quick playback speed selection.

#### Props

| Prop      | Type                | Default            | Description                    |
| --------- | ------------------- | ------------------ | ------------------------------ |
| speeds    | `readonly number[]` | `[0.5, 1, 1.5, 2]` | Available playback speeds      |
| class     | `string`            | -                  | Optional CSS classes           |
| ...props  | `HTMLAttributes`    | -                  | All standard div element props |

#### Example

```vue
<AudioPlayerSpeedButtonGroup :speeds="[0.5, 0.75, 1, 1.5, 2]" />
```

### useAudioPlayer Composable

Access the audio player context to control playback programmatically.

```tsx
const {
    ref, // RefObject<HTMLAudioElement>
    activeItem, // Current playing item
    duration, // Track duration in seconds
    error, // MediaError if any
    isPlaying, // Playing state
    isBuffering, // Buffering state
    playbackRate, // Current playback speed
    isItemActive, // Check if an item is active
    setActiveItem, // Set the active item
    play, // Play audio
    pause, // Pause audio
    seek, // Seek to time
    setPlaybackRate, // Change playback speed
} = useAudioPlayer<TData>()
```

#### Example Usage

```vue
<script setup lang="ts">
import { useAudioPlayer } from './context'
const { play, activeItem } = useAudioPlayer()

function handlePlayNext() {
    const nextTrack = getNextTrack(activeItem.value?.id)
    if (nextTrack) {
      play(nextTrack)
    }
}
</script>

<template>
    <button @click="handlePlayNext">
      Next Track
    </button>
</template>
```

### useAudioPlayerTime Composable

Get the current playback time (updates every frame using requestAnimationFrame).

```tsx
const time = useAudioPlayerTime() // Current time in seconds
```

#### Example Usage

```vue
<script setup lang="ts">
import { computed } from 'vue'

const time = useAudioPlayerTime()
const { duration } = useAudioPlayer()

const progressPercentage = computed(() => {
   return duration.value
      ? (time.value / duration.value) * 100
      : 0
})
</script>

<template>
   <div>
     Progress: {{ progressPercentage.toFixed(1) }}%
   </div>
</template>
```

## Advanced Examples

### Player with Speed Control

```vue showLineNumbers
<template>
    <AudioPlayerProvider>
      <div class="flex items-center gap-4">
        <AudioPlayerButton />
        <AudioPlayerTime />
        <AudioPlayerProgress class="flex-1" />
        <AudioPlayerDuration />
        <AudioPlayerSpeed />
      </div>
    </AudioPlayerProvider>
</template>
```

### Custom Controls

```vue showLineNumbers
<script setup lang="ts">
const {play, pause, isPlaying, seek, duration, setPlaybackRate } = 
    useAudioPlayer()
</script>

<template>
    <div class="space-y-4">
      <button @click="isPlaying ? pause() : play()">
        {{ isPlaying ? 'Pause' : 'Play' }}
      </button>

      <button @click="seek(0)">
        Restart
      </button>

      <button @click="duration && seek(duration * 0.5)">
        Jump to 50%
      </button>

      <button @click="setPlaybackRate(1.5)">
        Speed 1.5x
      </button>
    </div>
</template>
```

### Error Handling

```vue showLineNumbers
<script setup lang="ts">
const { error, activeItem } = useAudioPlayer()
</script>

<template>
    <div v-if="error" class="text-red-500">
      Failed to load: {{ activeItem?.src }}
      <br />
      Error: {{ error.message }}
    </div>

    <AudioPlayerButton v-else />
</template>
```

## Notes

- The audio player uses the HTML5 audio element under the hood
- Progress updates are synchronized using `requestAnimationFrame` for smooth UI updates
- The player handles buffering states and network errors automatically
- Space bar triggers play/pause when the progress slider is focused
- The component includes TypeScript support with generic data types
- Audio state is managed globally within the provider context
- Playback speed displays "Normal" for 1x speed and numerical values (e.g., "0.5x", "1.5x") for other speeds
- Playback speed is preserved when switching between tracks
