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
    npx elevenlabs-ui-vue@latest add orb
    ```

    If you're using TypeScript, install the Three.js type definitions:

    ```bash
    npm install @types/three -D
    ```
  ::

  ::tabs-content{value="manual"}
    ::steps
      ::step
        Install the following dependencies:
      ::

      ```bash
      npm install @tresjs/core three reka-ui lucide-vue-next
      ```

      If you're using TypeScript, install the Three.js type definitions:

      ```bash
      npm install @types/three -D
      ```

      ::step
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/orb) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::


The Orb component uses [TresJS](https://docs.tresjs.org/getting-started), a Vue 3 custom renderer for Three.js, to create declarative 3D scenes. To ensure the component renders correctly, please configure the template compiler options based on your project type (Vue or Nuxt).

<Callout class="mt-5 mb-0" >

  **Important:**  This configuration is required to make the template compiler work with the TresJS custom renderer and prevent console warnings.

</Callout>

### Vue project

If you're using Vue, you should add the TresJS template compiler options to your vite.config.ts:

```ts [vite.config.ts]
import { templateCompilerOptions } from '@tresjs/core'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      // Other config
      ...templateCompilerOptions
    }),
  ],
})
```

See the [Vue project section](https://docs.tresjs.org/getting-started/installation#vue-project) for more information.

### Nuxt project

If you're using Nuxt, you should use the official TresJS Nuxt module for a seamless integration experience.

Install the TresJS Nuxt module and Three.js:

```bash
npm install @tresjs/nuxt
```

Add `@tresjs/nuxt` to the `modules` section of your `nuxt.config.ts`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@tresjs/nuxt'],
})
```

See the [Nuxt project section](https://docs.tresjs.org/getting-started/installation#nuxt-project) for more information.

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
    <Orb :seed="12345" />
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
      :volume-mode="manual"
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
