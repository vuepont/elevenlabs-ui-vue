---
title: Transcript Viewer
description: A component for displaying an audio transcript with word-by-word highlighting synced to audio playback.
featured: true
component: true
---

::component-preview
---
name: transcript-viewer
description: An interactive transcript viewer.
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
    npx @elevenlabs/cli@latest add transcript-viewer
    ```
  ::

  ::tabs-content{value="manual"}
    ::steps
      ::step
        Install the following dependencies:
      ::

      ```bash
      npm install @vueuse/core lucide-vue-next
      ```

      ::step
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/transcript-viewer) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::

## Usage

```vue showLineNumbers
<script setup lang="ts">
import {
  TranscriptViewer,
  TranscriptViewerAudio,
  TranscriptViewerPlayPauseButton,
  TranscriptViewerScrubBar,
  TranscriptViewerWords,
  type CharacterAlignmentResponseModel,
} from "@/components/elevenlabs-ui/transcript-viewer"

const audioSrc = "/path/to/audio.mp3"
const alignment: CharacterAlignmentResponseModel = {
  characters: ["H", "e", "l", "l", "o"],
  characterStartTimesSeconds: [0, 0.1, 0.2, 0.3, 0.4],
  characterEndTimesSeconds: [0.1, 0.2, 0.3, 0.4, 0.5],
}
</script>

<template>
  <TranscriptViewer :audio-src="audioSrc" :alignment="alignment">
    <TranscriptViewerAudio />
    <TranscriptViewerWords />
    <div class="flex items-center gap-3">
      <TranscriptViewerPlayPauseButton />
      <TranscriptViewerScrubBar />
    </div>
  </TranscriptViewer>
</template>
```

### With Loading State

```vue showLineNumbers
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  TranscriptViewer,
  TranscriptViewerAudio,
  TranscriptViewerPlayPauseButton,
  TranscriptViewerScrubBar,
  TranscriptViewerWords,
  type CharacterAlignmentResponseModel,
} from "@/components/elevenlabs-ui/transcript-viewer"
import { Skeleton } from "@/components/ui/skeleton"

const audioSrc = "/path/to/audio.mp3"
const alignment = ref<CharacterAlignmentResponseModel | undefined>(undefined)

onMounted(() => {
  fetch("/path/to/alignment.json")
    .then(res => res.json())
    .then(data => {
      alignment.value = data
    })
})
</script>

<template>
  <TranscriptViewer
    :audio-src="audioSrc"
    :alignment="alignment ?? {
      characters: [],
      characterStartTimesSeconds: [],
      characterEndTimesSeconds: [],
    }"
  >
    <TranscriptViewerAudio class="sr-only" />
    <template v-if="alignment">
      <TranscriptViewerWords />
      <div class="flex items-center gap-3">
        <TranscriptViewerScrubBar />
      </div>
    </template>
    <template v-else>
      <div class="flex w-full flex-col gap-3">
        <Skeleton class="h-5 w-full" />
        <Skeleton class="h-5 w-1/2" />
        <Skeleton class="h-2 w-full" />
      </div>
    </template>
    <TranscriptViewerPlayPauseButton :disabled="!alignment" />
  </TranscriptViewer>
</template>
```

### Custom Button Content

```vue showLineNumbers
<script setup lang="ts">
import { PauseIcon, PlayIcon } from 'lucide-vue-next'
import { TranscriptViewerPlayPauseButton } from "@/components/elevenlabs-ui/transcript-viewer"
</script>

<template>
  <TranscriptViewerPlayPauseButton size="default" class="w-full">
    <template #default="{ isPlaying }">
      <PauseIcon v-if="isPlaying" class="size-4" />
      <PlayIcon v-else class="size-4" />
      <span class="ml-2">{{ isPlaying ? 'Pause' : 'Play' }}</span>
    </template>
  </TranscriptViewerPlayPauseButton>
</template>
```

## API Reference

### TranscriptViewer

The main container for the transcript viewer components. It manages the state and provides context to its children.

#### Props

| Prop               | Type                              | Description                                                                                                 |
| ------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `audioSrc`         | `string`                          | **Required.** The URL of the audio file.                                                                    |
| `audioType`        | `AudioType`                       | Optional. The type of the audio file. Defaults to `audio/mpeg`.                                             |
| `alignment`        | `CharacterAlignmentResponseModel` | **Required.** The alignment data for the transcript.                                                        |
| `segmentComposer`  | `SegmentComposer`                 | Optional. A function to compose transcript segments.                                                        |
| `hideAudioTags`    | `boolean`                         | Optional. If `true`, ElevenLabs tags (e.g. `[Excited]`) are hidden from the transcript. Defaults to `true`. |
| `onPlay`           | `() => void`                      | Optional. Callback when audio playback starts.                                                              |
| `onPause`          | `() => void`                      | Optional. Callback when audio playback is paused.                                                           |
| `onTimeUpdate`     | `(time: number) => void`          | Optional. Callback when the current time of the audio updates.                                              |
| `onEnded`          | `() => void`                      | Optional. Callback when the audio playback ends.                                                            |
| `onDurationChange` | `(duration: number) => void`      | Optional. Callback when the audio duration is available.                                                    |
| `class`            | `string`                          | Optional. Additional CSS classes.                                                                            |

### TranscriptViewerWords

Displays the transcript words. It uses the context from `TranscriptViewer` to highlight words as the audio plays.

#### Props

| Prop             | Type                                                                                            | Description                                              |
| ---------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `renderWord`     | `(props: { word: TranscriptWord, status: "spoken" \| "unspoken" \| "current" }) => VNode`     | Optional. Custom render function for each word.          |
| `renderGap`      | `(props: { segment: TranscriptGap, status: "spoken" \| "unspoken" \| "current" }) => VNode`    | Optional. Custom render function for gaps between words. |
| `wordClassNames` | `string`                                                                                        | Optional. Additional class names for each word `<span>`. |
| `gapClassNames`  | `string`                                                                                        | Optional. Additional class names for each gap `<span>`.  |
| `class`          | `string`                                                                                        | Optional. Additional CSS classes.                         |

### TranscriptViewerAudio

The underlying HTML `<audio>` element. It's controlled by the `TranscriptViewer`. You can pass standard `<audio>` element props. By default it is hidden.

_This component accepts standard `HTMLAttributes` attributes._

### TranscriptViewerPlayPauseButton

A button to play or pause the audio. It uses the context from `TranscriptViewer`. It accepts props for the `Button` component.

#### Props

| Prop      | Type              | Description                     |
| --------- | ----------------- | ------------------------------- |
| `class`   | `string`          | Optional CSS classes            |
| `disabled`| `boolean`         | Optional. Disable the button.   |
| `size`    | `'default' \| 'sm' \| 'lg' \| 'icon'` | Optional. Button size. Defaults to `'icon'`. |
| ...props  | `ButtonProps`      | All standard Button component props |

#### Slots

| Slot      | Props                    | Description                                    |
| --------- | ------------------------ | ---------------------------------------------- |
| `default` | `{ isPlaying: boolean }` | Custom content for the button. Receives the current playing state. |

### TranscriptViewerScrubBar

A scrub bar for seeking through the audio timeline. It's a context-aware implementation of the `ScrubBar` component.

#### Props

| Prop                | Type      | Description                                                                               |
| ------------------- | --------- | ----------------------------------------------------------------------------------------- |
| `showTimeLabels`    | `boolean` | Optional. If `true`, displays current time and remaining time labels. Defaults to `true`. |
| `labelsClassName`   | `string`  | Optional. Class names for the time labels container.                                      |
| `trackClassName`    | `string`  | Optional. Class names for the scrub bar track.                                            |
| `progressClassName` | `string`  | Optional. Class names for the scrub bar progress indicator.                               |
| `thumbClassName`    | `string`  | Optional. Class names for the scrub bar thumb.                                            |
| `class`             | `string`  | Optional. Additional CSS classes.                                                        |

### useTranscriptViewerContext

A composable to access the transcript viewer's state and controls. Must be used within a `TranscriptViewer`.

Returns an object with the following properties:

- `audioRef`: Ref to the audio element.
- `segments`: All transcript segments (Ref).
- `words`: All word segments (Ref).
- `spokenSegments`: Segments that have been spoken (Ref).
- `unspokenSegments`: Segments that have not been spoken (Ref).
- `currentWord`: The currently spoken word segment (Ref).
- `currentSegmentIndex`: The index of the current segment (Ref).
- `currentWordIndex`: The index of the current word (Ref).
- `duration`: The total duration of the audio (Ref).
- `currentTime`: The current playback time (Ref).
- `isPlaying`: `true` if audio is playing (Ref).
- `isScrubbing`: `true` if the user is scrubbing (Ref).
- `play()`: Function to start playback.
- `pause()`: Function to pause playback.
- `seekToTime(time)`: Function to seek to a specific time.
- `seekToWord(word)`: Function to seek to a specific word.
- `startScrubbing()`: Function to call on scrub start.
- `endScrubbing()`: Function to call on scrub end.

#### Example Usage

```vue showLineNumbers
<script setup lang="ts">
import { useTranscriptViewerContext } from "@/components/elevenlabs-ui/transcript-viewer"

const {
  isPlaying,
  currentTime,
  duration,
  play,
  pause,
  seekToTime,
} = useTranscriptViewerContext()

function handleJumpToHalf() {
  if (duration.value) {
    seekToTime(duration.value * 0.5)
  }
}
</script>

<template>
  <div>
    <button @click="isPlaying ? pause() : play()">
      {{ isPlaying ? 'Pause' : 'Play' }}
    </button>
    <button @click="handleJumpToHalf">
      Jump to 50%
    </button>
    <div>
      {{ currentTime.toFixed(1) }} / {{ duration.toFixed(1) }}
    </div>
  </div>
</template>
```

### useTranscriptViewer

A headless composable to manage a transcript viewer's state, controls, and playback. This is used internally by the `TranscriptViewer` components.

Accepts an object with the following properties:

| Prop               | Type                              | Description                                                                                                 |
| ------------------ | --------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `alignment`        | `CharacterAlignmentResponseModel` | **Required.** The alignment data for the transcript.                                                        |
| `segmentComposer`  | `SegmentComposer`                 | Optional. A function to compose transcript segments.                                                        |
| `hideAudioTags`    | `boolean`                         | Optional. If `true`, ElevenLabs tags (e.g. `[Excited]`) are hidden from the transcript. Defaults to `true`. |
| `onPlay`           | `() => void`                      | Optional. Callback when audio playback starts.                                                              |
| `onPause`          | `() => void`                      | Optional. Callback when audio playback is paused.                                                           |
| `onTimeUpdate`     | `(time: number) => void`          | Optional. Callback when the current time of the audio updates.                                              |
| `onEnded`          | `() => void`                      | Optional. Callback when the audio playback ends.                                                            |
| `onDurationChange` | `(duration: number) => void`      | Optional. Callback when the audio duration is available.                                                    |

Returns an object with the following properties:

- `audioRef`: Ref to the audio element.
- `segments`: All transcript segments (Ref).
- `words`: All word segments (Ref).
- `spokenSegments`: Segments that have been spoken (Ref).
- `unspokenSegments`: Segments that have not been spoken (Ref).
- `currentWord`: The currently spoken word segment (Ref).
- `currentSegmentIndex`: The index of the current segment (Ref).
- `currentWordIndex`: The index of the current word (Ref).
- `duration`: The total duration of the audio (Ref).
- `currentTime`: The current playback time (Ref).
- `isPlaying`: `true` if audio is playing (Ref).
- `isScrubbing`: `true` if the user is scrubbing (Ref).
- `play()`: Function to start playback.
- `pause()`: Function to pause playback.
- `seekToTime(time)`: Function to seek to a specific time.
- `seekToWord(word)`: Function to seek to a specific word.
- `startScrubbing()`: Function to call on scrub start.
- `endScrubbing()`: Function to call on scrub end.

#### Example Usage

```vue showLineNumbers
<script setup lang="ts">
import { ref } from 'vue'
import { useTranscriptViewer } from "@/components/elevenlabs-ui/transcript-viewer"
import type { CharacterAlignmentResponseModel } from "@/components/elevenlabs-ui/transcript-viewer"

const alignment: CharacterAlignmentResponseModel = {
  characters: ["H", "e", "l", "l", "o"],
  characterStartTimesSeconds: [0, 0.1, 0.2, 0.3, 0.4],
  characterEndTimesSeconds: [0.1, 0.2, 0.3, 0.4, 0.5],
}

const {
  audioRef,
  isPlaying,
  currentWord,
  play,
  pause,
} = useTranscriptViewer({
  alignment,
  onPlay: () => console.log('Playing'),
  onPause: () => console.log('Paused'),
})
</script>

<template>
  <audio ref="audioRef" src="/path/to/audio.mp3" />
  <div>
    <button @click="isPlaying ? pause() : play()">
      {{ isPlaying ? 'Pause' : 'Play' }}
    </button>
    <div v-if="currentWord">
      Current word: {{ currentWord.text }}
    </div>
  </div>
</template>
```

## Types

### CharacterAlignmentResponseModel

```typescript
interface CharacterAlignmentResponseModel {
  characters: string[]
  characterStartTimesSeconds?: number[]
  characterEndTimesSeconds?: number[]
}
```

### TranscriptWord

```typescript
interface TranscriptWord {
  kind: "word"
  segmentIndex: number
  wordIndex: number
  text: string
  startTime: number
  endTime: number
}
```

### TranscriptSegment

```typescript
type TranscriptSegment = TranscriptWord | TranscriptGap

interface TranscriptGap {
  kind: "gap"
  segmentIndex: number
  text: string
}
```

### SegmentComposer

```typescript
type SegmentComposer = (
  alignment: CharacterAlignmentResponseModel
) => {
  segments: TranscriptSegment[]
  words: TranscriptWord[]
}
```

## Notes

- The transcript viewer uses the HTML5 audio element under the hood
- Word highlighting updates are synchronized using `requestAnimationFrame` for smooth UI updates
- The component handles audio loading states and network errors automatically
- All reactive values are wrapped in Vue `Ref` objects for reactivity
- The component includes TypeScript support with full type definitions
- Audio state is managed within the `TranscriptViewer` context
- Word status can be `"spoken"`, `"unspoken"`, or `"current"` for styling purposes

