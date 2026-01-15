---
title: Voice Picker
description: Searchable voice selector with audio preview, orb visualization, and ElevenLabs voice integration.
featured: true
component: true
---

::component-preview
---
name: voice-picker
description: A voice picker component for selecting a voice from a list of voices
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
    npx elevenlabs-ui-vue@latest add voice-picker
    ```
  ::

  ::tabs-content{value="manual"}
    ::steps
      ::step
        Install the following dependencies:
      ::

      ```bash
      npm install @elevenlabs/elevenlabs-js reka-ui lucide-vue-next
      ```

      ::step
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/voice-picker) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::


## Usage

```tsx showLineNumbers
import { VoicePicker } from "@/components/elevenlabs-ui/voice-picker"
```

### Basic Usage

```vue showLineNumbers
<script setup lang="ts">
import { ElevenLabs } from "@elevenlabs/elevenlabs-js"

const voices = [
    {
      voice_id: "21m00Tcm4TlvDq8ikWAM",
      name: "Rachel",
      preview_url: "https://example.com/rachel-preview.mp3",
      // ... other voice properties
    },
      // ... more voices
]

const selectedVoice = ref("")

function handleValueChange(value: string) {
    selectedVoice.value = value
}
</script>

<template>
    <VoicePicker
      :voices="voices"
      v-model="selectedVoice"
      @update:model-value="handleValueChange"
    />
</template>
```

### Controlled vs Uncontrolled

```vue showLineNumbers
<script setup lang="ts">
import { VoicePicker } from '@/components/elevenlabs-ui/voice-picker'

const voices = ref([])
const selectedVoice = ref('')
</script>

<template>
    <!-- Controlled -->
    <VoicePicker
      :voices="voices"
      v-model="selectedVoice"
    />

    <!-- Uncontrolled -->
    <VoicePicker
      :voices="voices"
      @update:model-value="(voiceId) => console.log('Selected:', voiceId)"
    />
</template>
```

### Control Open State

```vue showLineNumbers
<script setup lang="ts">
const voices = ref([])
const selectedVoice = ref('')
const open = ref(false)

function handleValueChange(value: string) {
    selectedVoice.value = value
}
</script>

<template>
    <VoicePicker
      :voices="voices"
      v-model="selectedVoice"
      :open="open"
      @update:model-value="handleValueChange"
      @update:open="open = $event"
    />
</template>
```

### Custom Placeholder


```vue showLineNumbers
<template>
    <VoicePicker
      :voices="voices"
      v-model="selectedVoice"
      placeholder="Choose a voice..."
    />
</template>
```

### Fetching Voices from ElevenLabs API

```vue showLineNumbers
<script setup lang="ts">
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'

const voices = ref<Voice[]>([])
const selectedVoice = ref('')

onMounted(async () => {
    const client = new ElevenLabsClient({
      apiKey: import.meta.env.ELEVENLABS_API_KEY,
    })

    const response = await client.voices.getAll()
    voices.value = response.voices
})
</script>

<template>
    <VoicePicker
      :voices="voices"
      v-model="selectedVoice"
    />
</template>
```

## API Reference

### VoicePicker

A searchable dropdown for selecting ElevenLabs voices with audio preview and orb visualization.

#### Props

| Prop          | Type                      | Default               | Description                                 |
| ------------- | ------------------------- | --------------------- | ------------------------------------------- |
| voices        | `ElevenLabs.Voice[]`      | -                     | **Required.** Array of ElevenLabs voices    |
| modelValue    | `string`                  | -                     | Selected voice ID (controlled)              |
| placeholder   | `string`                  | `"Select a voice..."` | Placeholder text when no voice selected     |
| class         | `string`                  | -                     | Optional CSS classes for the trigger button |
| open          | `boolean`                 | -                     | Control popover open state                  |

#### Emits

| Event              | Type                              | Description                                     |
| ----------------- | ---------------------------------- | ----------------------------------------------- |
| update:modelValue | `(value: string) => void`          | Callback when selection changes                 |
| update:open       | `(open: boolean) => void`          | Callback when popover open state changes        |

## Features

- **Search Functionality**: Filter voices by name with built-in search
- **Audio Preview**: Play voice samples with play/pause controls
- **Orb Visualization**: Visual representation of each voice with the Orb component
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Controlled/Uncontrolled**: Supports both controlled and uncontrolled patterns
- **ElevenLabs Integration**: Works seamlessly with ElevenLabs Voice API
- **Audio Player**: Integrated audio playback with shared state management

## Notes

- Built on top of Command, Popover, and AudioPlayer components
- Requires `@elevenlabs/elevenlabs-js` for ElevenLabs Voice types
- Each voice displays with an Orb visualization and preview audio
- Audio playback is managed by AudioPlayer for consistent state
- Search is case-insensitive and filters by voice name
- Supports both controlled (`modelValue`/`onUpdate:modelValue`) and uncontrolled modes
- Open state can be controlled externally via `open`/`onUpdate:open` prop and event
- Keyboard accessible with standard combobox patterns
- Preview URLs from ElevenLabs Voice objects are used for audio playback




