---
title: Response
description: Streaming markdown renderer with smooth character-by-character animations for AI responses using Streamdown.
featured: true
component: true
---

::component-preview
---
name: response
description: A live scrolling response visualization with smooth animations.
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
    npx elevenlabs-ui-vue@latest add response
    ```
  ::

  ::tabs-content{value="manual"}
    ::steps
      ::step
        Install the following dependencies:
      ::

      ```bash
      npm install vue-stream-markdown
      ```

      ::step
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/response) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::


## Usage

```tsx showLineNumbers
import { Response } from "@/components/elevenlabs-ui/response"
```

### Basic Usage

```tsx showLineNumbers
<Response>This is a simple text response.</Response>
```

### With Markdown

The Response component supports full markdown rendering:

```vue showLineNumbers
<script setup lang="ts">
  const content = `# Heading

  This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2
- List item 3

\`\`\`javascript
const greeting = "Hello, world!"
console.log(greeting)
\`\`\`
`
</script>

<template>
    <Response> :content="content" />
</template>
```

### Streaming Response

Perfect for streaming AI responses character-by-character:

```vue showLineNumbers
<script setup lang="ts">
   const response = ref('')

  // As tokens arrive, append to response
  const handleStream = (token: string) => {
    response.value += token
  }
</script>

<template>
    <Response :content="response" />
</template>
```

### With Message Component

```vue showLineNumbers
  import { Message, MessageAvatar, MessageContent } from "@/components/elevenlabs-ui/message"
  import { Response } from "@/components/elevenlabs-ui/response"

  interface Props {
    streamingResponse: string
  }
  defineProps<Props>()
</script>

<template>
    <Message from="assistant">
      <MessageAvatar src="/ai-avatar.jpg" name="AI" />
      <MessageContent>
         <Response>{{ streamingResponse }}</Response>
      </MessageContent>
   </Message>
</template>
```

## API Reference

### Response

A memoized wrapper around Streamdown that renders streaming markdown with smooth animations.

#### Props

Extends all props from the [`vue-stream-markdown`](https://github.com/jinghaihan/vue-stream-markdown) component.

| Prop      | Type         | Description                    |
| --------- | ------------ | ------------------------------ |
| content   | `string`     | Content to render (markdown)   |
| class     | `string`     | Optional CSS classes           |
| ...props  | `Streamdown` | All vue-stream-markdown component props |

## Notes

- Built on top of [`vue-stream-markdown`](https://github.com/jinghaihan/vue-stream-markdown) for smooth markdown streaming animations
- Automatically removes top margin from first child and bottom margin from last child for clean integration
- Memoized to prevent unnecessary re-renders - only updates when children change
- Supports full markdown syntax including code blocks, lists, tables, and more
- Optimized for streaming AI responses with character-by-character rendering
- Works seamlessly with the Message component
- This component is inspired by Vercel's [AI SDK Response component](https://ai-sdk.dev/elements/components/message) with modifications for ElevenLabs UI
