---
title: Shimmering Text
description: Animated text with gradient shimmer effects and viewport-triggered animations using Motion.
featured: true
component: true
---

::component-preview
---
name: shimmering-text
description: A text shimmer effect with customizable speed, intensity, and colors
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
    npx @elevenlabs/cli@latest add shimmering-text
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
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/shimmering-text) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::

## Usage

```tsx showLineNumbers
import { ShimmeringText } from "@/components/elevenlabs-ui/shimmering-text"
```

### Basic Usage

```tsx showLineNumbers
<ShimmeringText text="Hello, World!" />
```

### Custom Duration and Colors

```vue showLineNumbers
<template>
    <ShimmeringText
      text="Custom Shimmer"
      :duration="3"
      :color="#6B7280"
      :shimmerColor="#3B82F6"
    />
</template>
```

### Trigger on Viewport Entry

```vue showLineNumbers
<template>
    <ShimmeringText
      text="Appears when scrolled into view"
      :startOnView="true"
      :once="true"
    />
</template>
```

### Repeating Animation

```vue showLineNumbers
<template>
   <ShimmeringText
    text="Repeating Shimmer"
    :repeat="true"
    :repeatDelay="1"
    :duration="2"
  />
</template>
```

### With Custom Styling

```vue showLineNumbers
<template>
   <ShimmeringText
     text="Large Heading"
     class="text-4xl font-bold"
     :spread="3"
   />
</template>
```

## API Reference

### ShimmeringText

An animated text component with gradient shimmer effect and viewport detection.

#### Props

| Prop         | Type      | Default | Description                                          |
| ------------ | --------- | ------- | ---------------------------------------------------- |
| text         | `string`  | -       | **Required.** Text to display with shimmer effect    |
| duration     | `number`  | `2`     | Animation duration in seconds                        |
| delay        | `number`  | `0`     | Delay before starting animation                      |
| repeat       | `boolean` | `true`  | Whether to repeat the animation                      |
| repeatDelay  | `number`  | `0.5`   | Pause duration between repeats in seconds            |
| class    | `string`  | -       | Optional CSS classes                                 |
| startOnView  | `boolean` | `true`  | Whether to start animation when entering viewport    |
| once         | `boolean` | `false` | Whether to animate only once                         |
| inViewMargin | `string`  | -       | Margin for viewport detection (e.g., "0px 0px -10%") |
| spread       | `number`  | `2`     | Shimmer spread multiplier                            |
| color        | `string`  | -       | Base text color (CSS custom property)                |
| shimmerColor | `string`  | -       | Shimmer gradient color (CSS custom property)         |

## Notes

- Built with [Motion-v](https://motion.dev/docs/vue) for smooth, performant animations
- Uses CSS gradient background animation for the shimmer effect
- Viewport detection powered by Motion-v's `useInView` hook
- Dynamic spread calculation based on text length for consistent appearance
- Supports custom colors via CSS custom properties
- Text uses `background-clip: text` for gradient effect
- Default colors adapt to light/dark mode automatically
- Optimized with `computed` for performance
- Animation can be controlled via viewport intersection or immediate start
