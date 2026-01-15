---
title: Voice Button
description: Interactive button with voice recording states, live waveform visualization, and automatic feedback transitions.
featured: true
component: true
---

::component-preview
---
name: voice-button
description: A beautiful button for voice and audio interactions
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
    npx elevenlabs-ui-vue@latest add voice-button
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
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/voice-button) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::


## Usage

```tsx showLineNumbers
import { VoiceButton } from "@/components/elevenlabs-ui/voice-button"
```

### Basic Usage

```vue showLineNumbers
<script setup lang="ts"> 
  const state = ref<'idle' | 'recording' | 'processing'>('idle')

  const handlePress = () => {
    if (state.value === 'idle') {
      state.value = 'recording'
    } else {
      state.value = 'processing'
    }
  }
</script>

<template>
   <VoiceButton
     :state="state"
     @press="handlePress"
   />
</template>
```

### With Label and Keyboard Shortcut

```vue showLineNumbers
<template>
    <VoiceButton
     state="idle"
     label="Press to speak"
     trailing="⌥Space"
     @press="console.log("Button pressed")"
   />
</template>
```

### Different States

```tsx showLineNumbers
<script setup lang="ts">
import { VoiceButton } from '@/components/elevenlabs-ui/voice-button'
</script>

<template>
    <div>
      <!-- Idle state -->
      <VoiceButton state="idle" />
      <!-- Recording with waveform -->
      <VoiceButton state="recording" />
      <!-- Processing -->
      <VoiceButton state="processing" />
      <!-- Success feedback -->
      <VoiceButton state="success" />
      <!-- Error feedback -->
      <VoiceButton state="error" />
     </div>
</template>
```

### Icon Button

```vue showLineNumbers
<script setup lang="ts">
   import { MicIcon } from 'lucide-vue-next' 
   import { VoiceButton } from '@/components/elevenlabs-ui/voice-button'
</script>

<template>
   <VoiceButton state="idle" size="icon">
    <template #icon>
      <MicIcon />
    </template>
   </VoiceButton>
</template>
```

### Custom Styling

```vue showLineNumbers
<template>
    <VoiceButton
      state="recording"
      variant="default"
      size="lg"
      class="w-full"
      waveformClass="bg-primary/10"
    />
</template>
```

### Auto-transitioning States

```vue showLineNumbers
<script setup lang="ts">
  import { ref } from 'vue'
  import {
    VoiceButton,
    type VoiceButtonState,
  } from '@/components/elevenlabs-ui/voice-button'

  const state = ref<VoiceButtonState>('idle')

  const handlePress = () => {
    if (state.value === 'idle') {
     state.value = 'recording'
    } else if (state.value === 'recording') {
      state.value = 'processing'
      // Simulate API call
      setTimeout(() => {
        state.value = 'success'
        // Auto-return to idle after feedback
      }, 2000)
    }
}
</script>

<template>
   <VoiceButton :state="state" @press="handlePress" />
</template>
```

## API Reference

### VoiceButton

A button component with multiple states for voice recording workflows, including live waveform visualization.

#### Props

| Prop              | Type                                                                          | Default     | Description                                       |
| ----------------- | ----------------------------------------------------------------------------- | ----------- | ------------------------------------------------- |
| state             | `"idle" \| "recording" \| "processing" \| "success" \| "error"`               | `"idle"`    | Current state of the voice button                 |
| label             | `any`                                                                   | -           | Content to display on the left side               |
| trailing          | `any`                                                                   | -           | Content to display on the right (e.g., shortcuts) |
| icon              | `any`                                                                   | -           | Icon to display when idle (for icon size buttons) |
| variant           | `"default" \| "destructive" \| "outline" \| "secondary" \| "ghost" \| "link"` | `"outline"` | Button variant                                    |
| size              | `"default" \| "sm" \| "lg" \| "icon"`                                         | `"default"` | Button size                                       |
| class             | `string`                                                                      | -           | Optional CSS classes for the button               |
| waveformClass     | `string`                                                                      | -           | Optional CSS classes for the waveform container   |
| feedbackDuration  | `number`                                                                      | `1500`      | Duration in ms to show success/error states       |
| ...props          | `HTMLAttributes`                                                              | -           | All standard button element props                 |

#### Emits

| Event              | Type                                                            | Description                                     |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| press             | `() => void`                                                     | Callback when when button is clicked            |

#### VoiceButtonState Type

```tsx
type VoiceButtonState =
  | "idle"
  | "recording"
  | "processing"
  | "success"
  | "error"
```

## Features

- **State Management**: Five distinct states (idle, recording, processing, success, error)
- **Live Waveform**: Displays real-time audio visualization during recording
- **Automatic Transitions**: Success/error states auto-transition back to idle
- **Keyboard Shortcuts**: Display keyboard shortcuts in the trailing slot
- **Flexible Layouts**: Supports label/trailing content or icon-only mode
- **Customizable Feedback**: Configurable duration for success/error states
- **Accessibility**: Proper ARIA labels and button semantics

## Notes

- Integrates with the LiveWaveform component for audio visualization
- Success state shows a checkmark icon with automatic timeout
- Error state shows an X icon with automatic timeout
- Processing state displays a subtle pulsing animation
- Recording state activates the live waveform visualization
- Uses the Button component as base with all its variants
- Waveform only appears in recording state
- Feedback states (success/error) automatically return to idle after `feedbackDuration`
- Compatible with all button sizes and variants
