---
title: Orb
description: A 3D animated orb with audio reactivity, custom colors, and agent state visualization built with Three.js.
featured: true
component: true
---

::component-preview
---
name: orb
description: An animated orb with flowing visuals and volume reactivity.
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
    npx @elevenlabs/cli@latest add orb
    ```
  ::

  ::tabs-content{value="manual"}
    ::steps
      ::step
        Install the following dependencies:
      ::

      ```bash
      npm install @tresjs/core three @types/three reka-ui lucide-vue-next
      ```

      ::step
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/orb) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::

## Usage

```vue showLineNumbers
<script setup lang="ts">
import { Orb } from "@/components/elevenlabs-ui/orb"
</script>

<template>
  <Orb />
</template>
```


## Examples

### Custom Colors

```vue showLineNumbers
<template>
  <Orb :colors="['#FF6B6B', '#4ECDC4']" />
</template>
```

### With Audio Reactivity

```vue showLineNumbers
<script setup>
function getInputVolume() {
  // Return normalized volume between 0 and 1
  return 0.5
}

function getOutputVolume() {
  // Return normalized volume between 0 and 1
  return 0.7
}
</script>

<template>
  <Orb
    :getInputVolume="getInputVolume"
    :getOutputVolume="getOutputVolume"
  />
</template>
```

### With Custom Seed

```vue showLineNumbers
<template>
  <Orb seed="12345" />
</template>
```

### With Agent State

```vue showLineNumbers
<script setup lang="ts">
import { ref } from 'vue'

const agentState = ref<"thinking" | "listening" | "talking" | null>(null)
</script>

<template>
  <Orb :agentState="agentState" />
</template>
```

### Manual Volume Control

```vue showLineNumbers
<script setup lang="ts">
import { ref } from 'vue'

const inputVolume = ref(0.5)
const outputVolume = ref(0.7)
</script>

<template>
  <Orb
    volume-mode="manual"
    :manual-input="inputVolume"
    :manual-output="outputVolume"
  />
</template>

```

## API Reference

### Orb

A WebGL-based 3D orb component with audio reactivity and customizable appearance.

#### Props

| Prop            | Type                          | Default                         | Description                                           |
| --------------- | ----------------------------- | ------------------------------- | ----------------------------------------------------- |
| colors          | `[string, string]`            | `["#CADCFC", "#A0B9D1"]`    | Two color values for the gradient                     |
| colorsRef       | `Ref<[string, string]>`       | -                               | Ref for dynamic color updates                         |
| resizeDebounce  | `number`                      | `100`                           | Canvas resize debounce in ms                          |
| seed            | `number`                      | Random                          | Seed for consistent animations                        |
| agentState      | `AgentState`                  | `null`                          | Agent state: null, "thinking", "listening", "talking" |
| volumeMode      | `"auto" \| "manual"`          | `"auto"`                        | Volume control mode                                   |
| manualInput     | `number`                      | -                               | Manual input volume (0-1)                             |
| manualOutput    | `number`                      | -                               | Manual output volume (0-1)                            |
| inputVolumeRef  | `Ref<number>`                 | -                               | Ref for input volume                                  |
| outputVolumeRef | `Ref<number>`                 | -                               | Ref for output volume                                 |
| getInputVolume  | `() => number`                | -                               | Function returning input volume (0-1)                 |
| getOutputVolume | `() => number`                | -                               | Function returning output volume (0-1)                |
| class           | `string`                      | -                               | Custom CSS class                                      |

#### AgentState Type

```tsx
type AgentState = null | "thinking" | "listening" | "talking"
```

## Notes

- Built with Three.js and TresJS for performant 3D rendering
- Uses WebGL shaders for smooth, fluid animations
- Audio reactivity can be controlled via functions (`getInputVolume`, `getOutputVolume`) or refs
- Agent state changes affect the orb's visual appearance and animation
- Seed prop ensures consistent animation patterns across renders
- Automatically handles canvas resizing with configurable debounce
- Colors can be updated dynamically via `colorsRef` for smooth transitions
- Performance-optimized with proper cleanup and requestAnimationFrame usage
