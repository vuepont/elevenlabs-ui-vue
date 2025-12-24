---
title: Scrub Bar
description: A component for scrubbing through a timeline, typically used for audio or video playback.
featured: true
component: true
---

::component-preview
---
name: scrub-bar
description: An interactive timeline scrubber.
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
    npx @elevenlabs/cli@latest add scrub-bar
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
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/scrub-bar) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::


## Usage

```vue showLineNumbers
<script setup lang="ts">
  import { ref } from 'vue'
  import {
   ScrubBarContainer,
   ScrubBarProgress,
   ScrubBarThumb,
   ScrubBarTimeLabel,
   ScrubBarTrack,
  } from "@/components/elevenlabs-ui/scrub-bar"

  const value = ref(30)
  const duration = 100
</script>

<template>
    <ScrubBarContainer 
      :duration="duration" 
      :value="value" 
      @scrub="(val: number) => value = val"
    >
     <ScrubBarTimeLabel :time="value" />
     <ScrubBarTrack class="mx-2">
        <ScrubBarProgress />
        <ScrubBarThumb />
     </ScrubBarTrack>
     <ScrubBarTimeLabel :time="duration" />
   </ScrubBarContainer>
</template>
```

## API Reference

### ScrubBarContainer

The main container for the scrub bar components. It provides the context for its children.

| Prop           | Type                     | Description                                           |
| -------------- | ------------------------ | ----------------------------------------------------- |
| `duration`     | `number`                 | **Required.** The total duration of the timeline.     |
| `value`        | `number`                 | **Required.** The current value of the timeline.      |

#### Emits

| Emit              | Type                                                             | Description                                     |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| scrub             | `(time: number) => void`                                         | Optional. Callback when the user scrubs the timeline.  |
| scrub-start       | `(stream: MediaStream) => void`                                  | Optional. Callback when the user starts scrubbing. |
| scrub-end         | `() => void`                                                     | Optional. Callback when the user ends scrubbing.|


### ScrubBarTrack

The track for the scrub bar. It handles the pointer events for scrubbing.

_This component accepts standard `HTMLAttributes` attributes._

### ScrubBarProgress

Displays the progress on the scrub bar track.

_This component is a wrapper around the `Progress` component and accepts its props, except for `value`._

### ScrubBarThumb

The handle for scrubbing.

_This component accepts standard `HTMLDivElement` attributes._

### ScrubBarTimeLabel

A label to display time.

| Prop     | Type                       | Description                                                                |
| -------- | -------------------------- | -------------------------------------------------------------------------- |
| `time`   | `number`                   | **Required.** The time to display, in seconds.                             |
| `format` | `(time: number) => string` | Optional. A function to format the time into a string. Defaults to `m:ss`. |
