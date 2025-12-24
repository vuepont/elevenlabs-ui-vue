---
title: Matrix
description: A retro dot-matrix display component with circular cells and smooth animations. Perfect for retro displays, indicators, and audio visualizations.
featured: true
component: true
---

::component-preview
---
name: matrix
description: An interactive matrix display with smooth animations and unified patterns.
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
    npx @elevenlabs/cli@latest add matrix
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
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/matrix) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::


## Usage

```tsx showLineNumbers
import { digits, loader, Matrix, vu, wave } from "@/components/elevenlabs-ui/matrix"
```

### Static Pattern

```vue showLineNumbers
<Matrix :rows="7" :cols="5" :pattern="digits[5]" :ariaLabel="Number five" />
```

### Animated Display

```vue showLineNumbers
<Matrix
    :rows="7"
    :cols="7"
    :frames="wave"
    :fps="20"
    loop
    :ariaLabel="Wave animation"
/>
```

### VU Meter

```vue showLineNumbers
<Matrix
    :rows="7"
    :cols="12"
    :mode="vu"
    :levels="[0.1, 0.6, 0.9, 0.7, 0.4, 0.8, 0.5, 0.3, 0.6, 0.9, 0.5, 0.2]"
/>
```

## API Reference

### Matrix

The main matrix display component.

```vue
<Matrix :rows="7" :cols="7" :frames="wave" :fps="20" />
```

#### Props

| Prop       | Type                                   | Description                                                    |
| ---------- | -------------------------------------- | -------------------------------------------------------------- |
| rows       | `number`                               | Number of rows in the matrix (required)                        |
| cols       | `number`                               | Number of columns in the matrix (required)                     |
| pattern    | `Frame`                                | Static pattern to display (2D array of brightness values 0-1)  |
| frames     | `Frame[]`                              | Array of frames for animation (ignored if pattern is provided) |
| fps        | `number`                               | Frames per second for animation. Default: 12                   |
| autoplay   | `boolean`                              | Start animation automatically. Default: true                   |
| loop       | `boolean`                              | Loop animation. Default: true                                  |
| size       | `number`                               | Cell size in pixels. Default: 10                               |
| gap        | `number`                               | Gap between cells in pixels. Default: 2                        |
| palette    | `{on: string, off: string}`            | CSS colors for on/off states. Defaults to theme colors         |
| brightness | `number`                               | Global brightness multiplier (0-1). Default: 1                 |
| ariaLabel  | `string`                               | ARIA label for accessibility                                   |
| mode       | `"default" \| "vu"`                    | Display mode. Default: "default"                               |
| levels     | `number[]`                             | Live levels for VU meter mode (0-1 per column)                 |
| class      | `string`                               | Additional CSS classes                                         |
| ...props   | `HTMLAttributes`                       | All standard div element props                                 |

#### Emits

| Emit              | Type                                                             | Description                                     |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| frame             | `(index: number) => void`                                        | Callback when conversation connects            |


### Frame Type

```tsx
type Frame = number[][] // [row][col] brightness 0..1
```

A frame is a 2D array where each value represents the brightness of a cell (0 = off, 1 = full brightness).

Example:

```tsx
const smiley: Frame = [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0],
]
```

## Presets

The component comes with several built-in presets and animations:

### digits

7-segment style digits (0-9) on a 7×5 grid.

```vue
<script setup lang="ts">
   import { digits, Matrix } from "@/components/elevenlabs-ui/matrix"
</script>

<template>
    <Matrix :rows="7" :cols="5" :pattern="digits[5]" />
</template>
```

### loader

Rotating spinner animation (7×7, 12 frames).

```vue
<script setup lang="ts">
    import { loader, Matrix } from "@/components/elevenlabs-ui/matrix"
</script>

<template>
    <Matrix :rows="7" :cols="7" :frames="loader" :fps="12" />
</template>
```

### pulse

Expanding pulse effect (7×7, 16 frames).

```vue
<script setup lang="ts">
    import { pulse, Matrix } from "@/components/elevenlabs-ui/matrix"
</script>

<template>
    <Matrix :rows="7" :cols="7" :frames="pulse" :fps="16" />
</template>
```

### wave

Smooth sine wave animation (7×7, 24 frames).

```vue
<script setup lang="ts">
    import { wave, Matrix } from "@/components/elevenlabs-ui/matrix"
</script>

<template>
    <Matrix :rows="7" :cols="7" :frames="wave" :fps="20" />
</template>
```

### snake

Snake traversal pattern (7×7, ~40 frames).

```vue
<script setup lang="ts">
    import { snake, Matrix } from "@/components/elevenlabs-ui/matrix"
</script>

<template>
   <Matrix :rows="7" :cols="7" :frames="snake" :fps="15" />
</template>
```

### chevronLeft / chevronRight

Simple directional arrows (5×5).

```vue
<script setup lang="ts">
    import { chevronLeft, Matrix } from "@/components/elevenlabs-ui/matrix"
</script>

<template>
    <Matrix :rows="5" :cols="5" :pattern="chevronLeft" />
</template>
```

### vu()

Helper function to create VU meter frames.

```vue
<script setup lang="ts">
    import { vu, Matrix } from "@/components/elevenlabs-ui/matrix"

    const levels = [0.3, 0.6, 0.9, 0.7, 0.5]
</script>

<template>
    <Matrix :rows="7" :cols="5" :pattern="vu(5, levels)" />
</template>
```

## Examples

### Retro Display

```vue showLineNumbers
<template>
   <div class="bg-muted/30 rounded-lg border p-8">
      <Matrix
       :rows="7"
       :cols="7"
       :frames="wave"
       :fps="20"
       :size="16"
       :gap="3"
       :palette="{
         on: 'hsl(142 76% 36%)',
         off: 'hsl(142 76% 10%)',
       }"
       aria-label="Wave animation"
     />
   </div>
</template>
```

### Digital Clock Digit

```vue showLineNumbers
<script setup lang="ts">
    interface Props {
     value: number
    }

    defineProps<Props>()
</script>

<template>
   <Matrix
     :rows="7"
     :cols="5"
     :pattern="digits[value]"
     :size="12"
     :gap="2"
     :aria-label="`Digit ${value}`"
   />
</template>
```

### Audio Level Meter

```vue showLineNumbers
<script setup lang="ts">
   interface Props {
    frequencyData: number[]
   }

   const props = defineProps<Props>()

   // Convert frequency data to 0-1 levels
   const levels = computed(() => props.frequencyData.map((freq) => freq / 255))
</script>

<template>
   <Matrix
      :rows="7"
      :cols="frequencyData.length"
      mode="vu"
      :levels="levels"
      :size="8"
      :gap="1"
      aria-label="Audio frequency meter"
    />
</template>
```

### Custom Pattern

```vue showLineNumbers
<script setup lang="ts">
  const heartPattern: Frame = [
    [0, 1, 1, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 1, 1, 1, 0],
    [0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
  ]
</script>

<template>
    <Matrix
      :rows="6"
      :cols="7"
      :pattern="heartPattern"
      :size="14"
      :gap="2"
      :palette="{
        on: 'hsl(0 84% 60%)',
        off: 'hsl(0 84% 20%)',
     }"
    />
</template>
```

## Advanced Usage

### Creating Custom Animations

```vue showLineNumbers
<script setup lang="ts">
  // Create a simple blink animation
  const frames: Frame[] = [
    [
      [1, 0, 1],
      [0, 1, 0],
      [1, 0, 1],
    ], // Frame 1
    [
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ], // Frame 2
  ]
</script>

<template>
    <Matrix :rows="3" :cols="3" :frames="frames" :fps="2" loop />
</template>
```

### Frame Change Callback

```vue showLineNumbers
<script setup lang="ts">
   const currentFrame = ref(0)
</script>

<template>
   <div>
     <Matrix
       :rows="7"
       :cols="7"
       :frames="loader"
       :fps="12"
       @frame="(frame: number) => currentFrame = frame"
     />
     <p>Frame: {{ currentFrame }}</p>
   </div>
</template>
```

### Dynamic VU Meter

```vue showLineNumbers
<script setup lang="ts">'
  const levels = ref(Array(12).fill(0))

  let interval: number | null = null

  onMounted(() => {
    // Simulate audio levels
    interval = setInterval(() => {
      levels.value = Array.from({ length: 12 }, () => Math.random())
    }, 50)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval) 
  })
</script>

<template>
    <Matrix :rows="7" :cols="12" mode="vu" :levels="levels" :size="10" :gap="2" />
</template>
```

## Theming

The component uses CSS variables for theming:

```vue
<template>
    <Matrix
    :palette="{
      on: 'currentColor',
      off: 'var(--muted-foreground)',
    }"
    />
</template>
```

### Classic Phosphor Green

```tsx
 :palette="{
      on: "hsl(142 76% 36%)",
      off: "hsl(142 76% 10%)",
    }"
```

### Amber Terminal

```tsx
:palette="{
    on: "hsl(38 92% 50%)",
    off: "hsl(38 92% 15%)",
}"
```

### Blue Neon

```tsx
:palette="{
    on: "hsl(200 98% 39%)",
    off: "hsl(200 98% 12%)",
}"
```

## Performance

- Uses SVG for crisp rendering at any size
- Cell positions are precomputed and memoized
- Only opacity updates during frame transitions
- Stable FPS with time accumulator and `requestAnimationFrame`
- Tested with 7×7 (49 cells) and 16×16 (256 cells) grids
- Proper cleanup of animation frames on unmount

## Accessibility

- Container has `role="img"` for semantic meaning
- Configurable `aria-label` for description
- Animated displays use `aria-live="polite"`
- Frame information available via `frame` callback
- All interactive demos support keyboard navigation

## Notes

- Frames use brightness values from 0 (off) to 1 (full on)
- Circular cells provide a classic dot-matrix appearance
- VU meter mode provides real-time column-based visualization
- All presets are optimized for 7×7 or similar small grids
- Works in SSR environments (animation starts on mount)
- Compatible with all modern browsers
- Supports both light and dark themes
