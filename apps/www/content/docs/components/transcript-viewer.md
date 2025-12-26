---
title: Transcript Viewer
description: A component for displaying an audio transcript with word-by-word highlighting synced to audio playback.
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
