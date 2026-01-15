---
title: Mic Selector
description: Microphone input selector with device management.
featured: true
component: true
---

::component-preview
---
name: mic-selector
description: A microphone selector with live audio preview
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
    npx elevenlabs-ui-vue@latest add mic-selector
    ```
  ::

  ::tabs-content{value="manual"}
    ::steps
      ::step
        Install the following dependencies:
      ::

      ```bash
      npm install lucide-vue-next @vueuse/core
      ```

      ::step
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/mic-selector) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::


## Usage

```tsx showLineNumbers
import { MicSelector } from "@/components/elevenlabs-ui/mic-selector"
```

### Basic Usage

```tsx showLineNumbers
<MicSelector />
```

### Controlled

```vue showLineNumbers
<script setup lang="ts">
  const selectedDevice = ref('')
</script>

<template>
    <MicSelector :v-model="selectedDevice" />
</template>
```

### With Mute Control

```vue showLineNumbers
<script setup lang="ts">
  const selectedDevice = ref('')
  const isMuted = ref(false)
</script>

<template>
   <MicSelector
     v-model="selectedDevice"
     v-model:muted="isMuted"
   />
</template>
```

### Custom Styling

```vue showLineNumbers
<MicSelector class="w-full max-w-md" />
```

### Using the Composable

```tsx showLineNumbers
import { useAudioDevices } from "@/components/ui/mic-selector"

  const { devices, loading, error, hasPermission, loadDevices } =
  useAudioDevices()

// Access available microphones
devices.map((device) => console.log(device.label, device.deviceId))
```

## API Reference

### MicSelector

A dropdown selector for choosing audio input devices with live waveform preview.

#### Props

| Prop          | Type                         | Description                            |
| ------------- | ---------------------------- | -------------------------------------- |
| modelValue    | `string`                     | Selected device ID (v-model)           |
| muted         | `boolean`                    | Mute state (v-model:muted)             |
| disabled      | `boolean`                    | Disables the selector dropdown         |
| class         | `string`                     | Optional CSS classes for the container |

#### Emits

| Event             | Type                                                             | Description                                     |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| update:modelValue | `(deviceId: string) => void`                                     | Callback when device selection changes          |
| update:muted      | `(mute: boolean) => void`                                        | Callback when nute state changes disconnects    |

### useAudioDevices

A composable for managing audio input devices.

#### Returns

| Property      | Type                  | Description                               |
| ------------- | --------------------- | ----------------------------------------- |
| devices       | `AudioDevice[]`       | Array of available audio input devices    |
| loading       | `boolean`             | Whether devices are being loaded          |
| error         | `string \| null`      | Error message if device loading failed    |
| hasPermission | `boolean`             | Whether microphone permission was granted |
| loadDevices   | `() => Promise<void>` | Function to request permission and reload |

#### AudioDevice Type

```tsx
interface AudioDevice {
   deviceId: string
   label: string
   groupId: string
}
```

## Features

- **Device Management**: Automatically detects and lists available microphones
- **Live Preview**: Real-time audio waveform visualization when dropdown is open
- **Mute Toggle**: Control preview audio on/off with controlled or uncontrolled state
- **Permission Handling**: Gracefully handles microphone permissions
- **Auto-selection**: Automatically selects first available device
- **Device Changes**: Listens for device connection/disconnection events
- **Clean Labels**: Automatically removes device metadata from labels
- **Flexible Control**: Works in both controlled and uncontrolled modes for device selection and mute state

## Notes

- Uses the `LiveWaveform` component for audio visualization
- Automatically requests microphone permissions when opening dropdown
- Preview shows scrolling waveform of microphone input
- Device list updates automatically when devices are connected/disconnected
- Works in both controlled and uncontrolled modes for device selection and mute state
- Mute state can be controlled from parent component for integration with recording controls
- Can be disabled during active recording or other operations
- Cleans up audio streams properly on unmount
