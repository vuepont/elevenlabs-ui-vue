---
title: Conversation
description: A scrolling conversation container with auto-scroll and sticky-to-bottom behavior for chat interfaces.
featured: true
component: true
---

::component-preview
---
name: conversation
description: A live scrolling conversation visualization.
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
    npx elevenlabs-ui-vue@latest add conversation
    ```
  ::

  ::tabs-content{value="manual"}
    ::steps
      ::step
        Install the following dependencies:
      ::

      ```bash
      npm install lucide-vue-next vue-stick-to-bottom
      ```

      ::step
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/conversation) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::

## Usage

```tsx showLineNumbers
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/elevenlabs-ui/conversation"
```

### Basic Conversation

```vue showLineNumbers
<template>
    <Conversation>
      <ConversationContent>
        <div
          v-for="message in messages"
          :key="message.id"
        >
          {{ message.content }}
        </div>
      </ConversationContent>

      <ConversationScrollButton />
    </Conversation>
</template>
```

### With Empty State

```vue showLineNumbers
<template>
    <Conversation>
      <ConversationContent>
        <ConversationEmptyState
          v-if="messages.length === 0"
          title="No messages yet"
          description="Start a conversation to see messages here"
        />
        <div
          v-else
          v-for="message in messages"
          :key="message.id"
        >
          {{ message.content }}
        </div>
      </ConversationContent>

      <ConversationScrollButton />
    </Conversation>
</template>
```


## API Reference

### Conversation

The main container component that manages scrolling behavior and sticky-to-bottom functionality.

#### Props

Extends all props from `StickToBottom` component from `vue-stick-to-bottom`.

| Prop      | Type            | Description                                 |
| --------- | --------------- | ------------------------------------------- |
| class     | `string`        | Optional CSS classes                        |
| initial   | `"smooth"`      | Initial scroll behavior (default: "smooth") |
| resize    | `"smooth"`      | Resize scroll behavior (default: "smooth")  |
| ...props  | `StickToBottom` | All standard StickToBottom component props  |

### ConversationContent

Container for conversation messages.

#### Props

| Prop      | Type                    | Description                     |
| --------- | ----------------------- | ------------------------------- |
| class     | `string`                | Optional CSS classes            |

### ConversationEmptyState

Displays when there are no messages in the conversation.

#### Props

| Prop        | Type             | Description                                  |
| ----------- | ---------------- | -------------------------------------------- |
| title       | `string`         | Title text (default: "No messages yet")      |
| description | `string`         | Description text                             |
| icon        | `Component`      | Optional icon to display                     |
| class       | `string`         | Optional CSS classes                         |
| ...props    | `HTMLAttributes` | All standard div element props               |

### ConversationScrollButton

A scroll-to-bottom button that appears when the user scrolls up.

#### Props

| Prop      | Type          | Description               |
| --------- | ------------- | ------------------------- |
| class     | `string`      | Optional CSS classes      |
| ...props  | `ButtonProps` | All standard Button props |

## Notes

- Built on top of [`vue-stick-to-bottom`](https://www.npmjs.com/package/vue-stick-to-bottom) for smooth scrolling behavior
- Automatically scrolls to bottom when new messages are added
- Scroll button only appears when user has scrolled away from the bottom
- Supports smooth scrolling animations
- Works with any message component structure
- This component is inspired by Vercel's [AI SDK Conversation component](https://ai-sdk.dev/elements/components/conversation) with modifications for ElevenLabs UI
