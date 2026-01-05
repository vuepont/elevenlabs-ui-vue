---
title: Speech Input
description: A compact speech-to-text input component with real-time transcription using ElevenLabs Scribe.
featured: true
component: true
---

::component-preview
---
name: speech-input
description: A compact speech input component with real-time transcription preview.
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
    npx @elevenlabs/cli@latest add speech-input
    ```
  ::

  ::tabs-content{value="manual"}
    ::steps
      ::step
        Install the following dependencies:
      ::

      ```bash
      npm install reka-ui lucide-vue-next @elevenlabs/client class-variance-authority motion-v
      ```

      ::step
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/speech-input) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::


## Usage

```tsx showLineNumbers
import {
  SpeechInput,
  SpeechInputCancelButton,
  SpeechInputPreview,
  SpeechInputRecordButton,
} from "@/components/elevenlabs-ui/speech-input"
```

### Basic Usage


```vue showLineNumbers
<script setup lang="ts">
async function getToken() {
  const response = await fetch("/api/get-scribe-token", { method: "POST" })
  const json = await response.json()
  return json.token
}

function handleChange(data: any) {
  console.log(data.transcript)
}

function handleStop(data: any) {
  console.log("Final:", data.transcript)
}
</script>

<template>
  <SpeechInput
    :getToken="getToken"
    @change="handleChange"
    @stop="handleStop"
  >
    <SpeechInputRecordButton />
    <SpeechInputPreview placeholder="Start speaking..." />
    <SpeechInputCancelButton />
  </SpeechInput>
</template>
```

### With Form Input

```vue showLineNumbers
<script setup lang="ts">
import { ref } from "vue"

const value = ref("")

function handleStop(data: any) {
  value.value = value.value + " " + data.transcript
}
</script>

<template>
  <div class="flex items-center gap-2">
    <input
      v-model="value"
      class="flex-1 rounded border px-3 py-2"
    />
    <SpeechInput
      :getToken="getToken"
      @stop="handleStop"
    >
      <SpeechInputRecordButton />
      <SpeechInputPreview />
      <SpeechInputCancelButton />
    </SpeechInput>
  </div>
</template>

```

### Reversed Layout

The component automatically adjusts its layout based on child order:

```vue showLineNumbers
<template>
    <SpeechInput :getToken="getToken">
      <SpeechInputCancelButton />
      <SpeechInputPreview />
      <SpeechInputRecordButton />
    </SpeechInput>
</template>
```

### Minimal (Record Button Only)

```vue showLineNumbers
<template>
    <SpeechInput
      :getToken="getToken"
      @stop="handleStop"
    >
      <SpeechInputRecordButton />
    </SpeechInput>
</template>
```

### Custom Placeholder

```vue showLineNumbers
<template>
    <SpeechInput :getToken="getToken">
      <SpeechInputRecordButton />
      <SpeechInputPreview placeholder="Say something..." />
      <SpeechInputCancelButton />
    </SpeechInput>
</template>
```

### Using the Composable

Access the speech input context in child components:

```vue showLineNumbers
<script setup lang="ts">
import { useSpeechInput } from "@/components/elevenlabs-ui/speech-input"

const { transcript, isConnected, isConnecting } = useSpeechInput()
</script>

<template>
  <div>
    <p>
      Status:
      <span v-if="isConnecting">Connecting</span>
      <span v-else-if="isConnected">Recording</span>
      <span v-else>Idle</span>
    </p>
    <p>Transcript: {{ transcript }}</p>
  </div>
</template>

```

### Server Route for Token

Create a server action to securely fetch the Scribe token:

```tsx title="server/api/get-scribe-token.post.ts" showLineNumbers
export default defineEventHandler(async () => {
  const response = await fetch(
    "https://api.elevenlabs.io/v1/speech-to-text/get-realtime-token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY as string,
      },
      body: JSON.stringify({
        model_id: "scribe_v2_realtime",
        ttl_secs: 300,
      }),
    }
  )

  const data = await response.json()
  return { token: data.token }
})
```

## API Reference

### SpeechInput

The root component that manages speech-to-text state and provides context to child components.

#### Props

| Prop                    | Type                                | Default                | Description                                           |
| ----------------------- | ----------------------------------- | ---------------------- | ----------------------------------------------------- |
| getToken                | `() => Promise<string>`             | -                      | Function to fetch ElevenLabs Scribe token             |
| modelId                 | `string`                            | `"scribe_v2_realtime"` | ElevenLabs model ID                                   |
| baseUri                 | `string`                            | -                      | Custom WebSocket base URI                             |
| commitStrategy          | `CommitStrategy`                    | `"vad"`                | How transcripts are committed (`"manual"` or `"vad"`) |
| vadSilenceThresholdSecs | `number`                            | -                      | VAD silence threshold (0.3-3.0)                       |
| vadThreshold            | `number`                            | -                      | VAD threshold (0.1-0.9)                               |
| minSpeechDurationMs     | `number`                            | -                      | Minimum speech duration (50-2000ms)                   |
| minSilenceDurationMs    | `number`                            | -                      | Minimum silence duration (50-2000ms)                  |
| languageCode            | `string`                            | -                      | ISO-639-1/3 language code                             |
| microphone              | `MicrophoneOptions`                 | See below              | Microphone configuration                               |
| audioFormat             | `AudioFormat`                       | -                      | Audio format for manual streaming                     |
| sampleRate              | `number`                            | -                      | Sample rate for manual streaming                      |
| className               | `string`                            | -                      | Optional CSS classes                                  |

#### Emits

| Event                   | Type                                              | Description                                    |
| ----------------------- | ------------------------------------------------- | ---------------------------------------------- |
| change                  | `(data: SpeechInputData) => void`                 | Called when transcript changes                 |
| start                   | `(data: SpeechInputData) => void`                 | Called when recording starts                   |
| stop                    | `(data: SpeechInputData) => void`                 | Called when recording stops                    |
| cancel                  | `(data: SpeechInputData) => void`                 | Called when recording is cancelled             |
| error                   | `(error: Error \| Event) => void`                 | Called on connection errors                    |
| authError               | `(data: { error: string }) => void`               | Called on authentication errors                |
| quotaExceededError      | `(data: { error: string }) => void`               | Called when quota is exceeded                  |

#### Default Microphone Options

```tsx
{
  echoCancellation: true,
  noiseSuppression: true
}
```

### SpeechInputRecordButton

Toggle button that switches between microphone icon (idle), connecting indicator, and stop icon (recording).

#### Props

| Prop      | Type                                 | Description              |
| --------- | ------------------------------------ | ------------------------ |
| class     | `string`                             | Optional CSS classes     |
| disabled  | `boolean`                            | Disable the button       |
| ...props  | `InstanceType<typeof Button>`        | All button props         |

#### Emits

| Event                   | Type                                              | Description                             |
| ----------------------- | ------------------------------------------------- | --------------------------------------- |
| click                   | `(e: MouseEvent) => void`                         | Additional click handler                |


### SpeechInputPreview

Displays the current transcript with smooth text animations.

#### Props

| Prop        | Type                              | Default          | Description           |
| ----------- | --------------------------------- | ---------------- | --------------------- |
| placeholder | `string`                          | `"Listening..."` | Text shown when empty |
| class       | `string`                          | -                | Optional CSS classes  |
| ...props    | `HTMLDivElement`                  | -                | All div props         |

### SpeechInputCancelButton

Button to cancel the current recording and clear the transcript.

#### Props

| Prop      | Type                                 | Description              |
| --------- | ------------------------------------ | ------------------------ |
| class     | `string`                             | Optional CSS classes     |
| ...props  | `HTMLButtonElement`                  | All button props         |

#### Emits

| Event                   | Type                                              | Description                             |
| ----------------------- | ------------------------------------------------- | --------------------------------------- |
| click                   | `(e: MouseEvent) => void`                         | Additional click handler                |


### useSpeechInput

Hook to access speech input context from child components.

#### Returns

| Property             | Type                  | Description                           |
| -------------------- | --------------------- | ------------------------------------- |
| isConnected          | `boolean`             | Whether currently connected/recording |
| isConnecting         | `boolean`             | Whether connection is in progress     |
| transcript           | `string`              | Full transcript (committed + partial) |
| partialTranscript    | `string`              | Current partial transcript            |
| committedTranscripts | `string[]`            | Array of committed transcripts        |
| error                | `string \| null`      | Current error message                 |
| start                | `() => Promise<void>` | Start recording                       |
| stop                 | `() => void`          | Stop recording                        |
| cancel               | `() => void`          | Cancel and clear transcript           |

### SpeechInputData

Data object passed to callbacks.

```tsx
interface SpeechInputData {
  partialTranscript: string
  committedTranscripts: string[]
  transcript: string // Combined full transcript
}
```

### CommitStrategy

```tsx
enum CommitStrategy {
  MANUAL = "manual",
  VAD = "vad",
}
```

### AudioFormat

```tsx
enum AudioFormat {
  PCM_8000 = "pcm_8000",
  PCM_16000 = "pcm_16000",
  PCM_22050 = "pcm_22050",
  PCM_24000 = "pcm_24000",
  PCM_44100 = "pcm_44100",
  PCM_48000 = "pcm_48000",
  ULAW_8000 = "ulaw_8000",
}
```

## Features

- **Real-time Transcription**: Live speech-to-text using ElevenLabs Scribe
- **Compound Components**: Flexible composition with record button, preview, and cancel
- **Animated Transitions**: Smooth expand/collapse animations using motion-v
- **Voice Activity Detection**: Automatic transcript commits based on speech pauses
- **Visual Feedback**: Distinct states for idle, connecting, and recording
- **Accessibility**: Proper ARIA labels and keyboard interaction

## Notes

- Requires an ElevenLabs API key for generating Scribe tokens
- Token generation should happen server-side to protect your API key
- The component automatically handles microphone permissions
- Uses WebSocket for real-time communication with ElevenLabs Scribe API
- VAD (Voice Activity Detection) mode automatically commits transcripts during pauses
- The preview component uses a gradient mask for text overflow
- Layout automatically adjusts based on whether the record button is first or last
