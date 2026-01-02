---
title: Message
description: Composable message components with avatar, content variants, and automatic styling for user and assistant messages.
featured: true
component: true
---

::component-preview
---
name: message
description: A live scrolling message visualization.
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
    npx @elevenlabs/cli@latest add message
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
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/message) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::

## Usage

```tsx showLineNumbers
import { Message, MessageAvatar, MessageContent } from "@/components/elevenlabs-ui/message"
```

### Basic Message

````vue showLineNumbers
<template>
  <Message from="user">
    <MessageAvatar src="/user-avatar.jpg" name="John" />
    <MessageContent>
      Hello, how can I help you?
    </MessageContent>
  </Message>

  <Message from="assistant">
    <MessageAvatar src="/assistant-avatar.jpg" name="AI" />
    <MessageContent>
      I'm here to assist you with any questions!
    </MessageContent>
  </Message>
</template>
````

### Message Variants

The `MessageContent` component supports two variants:

```vue showLineNumbers
<script setup lang="ts">
import { Message, MessageAvatar, MessageContent } from "@/components/elevenlabs-ui/message"
</script>

<template>
  <!-- Contained variant - default, has background and padding -->
  <Message from="user">
    <MessageAvatar src="/user-avatar.jpg" />
    <MessageContent variant="contained">
      This is a contained message with background
    </MessageContent>
  </Message>

  <!-- Flat variant - no background for assistant, minimal styling -->
  <Message from="assistant">
    <MessageAvatar src="/assistant-avatar.jpg" />
    <MessageContent variant="flat">
      This is a flat message with minimal styling
    </MessageContent>
  </Message>
</template>

```

### In a Conversation

```vue showLineNumbers
<script>
    import { Conversation, ConversationContent } from "@/components/elevenlabs-ui/conversation"
    import { Message, MessageAvatar, MessageContent } from "@/components/elevenlabs-ui/message"
</script>

<template>
  <Conversation>
    <ConversationContent>
      <Message
        v-for="message in messages"
        :key="message.id"
        :from="message.from"
      >
        <MessageAvatar
          :src="message.avatarUrl"
          :name="message.name"
        />
        <MessageContent>
          {{ message.content }}
        </MessageContent>
      </Message>
    </ConversationContent>
  </Conversation>
</template>
```


## API Reference

### Message

The main container component that handles layout and alignment based on message sender.

#### Props

| Prop      | Type                    | Description                                    |
| --------- | ----------------------- | ---------------------------------------------- |
| from      | `"user" \| "assistant"` | **Required.** Determines alignment and styling |
| class     | `string`                | Optional CSS classes                           |
| ...props  | `HTMLDivElement`        | All standard div element props                 |

### MessageContent

Container for message text and content with variant styling.

#### Props

| Prop      | Type                    | Description                                 |
| --------- | ----------------------- | ------------------------------------------- |
| variant   | `"contained" \| "flat"` | Visual style variant (default: "contained")  |
| class     | `string`                | Optional CSS classes                        |
<!-- | children  | `ReactNode`             | Message content                             | -->
| ...props  | `HTMLAttributes`        | All standard div element props              |

### MessageAvatar

Avatar component for displaying user or assistant profile images.

#### Props

| Prop      | Type          | Description                                         |
| --------- | ------------- | --------------------------------------------------- |
| src       | `string`      | **Required.** Avatar image URL                      |
| name      | `string`      | Name for fallback (shows first 2 chars if no image)  |
| class     | `string`      | Optional CSS classes                                |
| ...props  | `AvatarProps` | All standard Avatar component props                 |

## Notes

- Uses CSS group selectors for context-aware styling based on `from` prop
- User messages align to the right, assistant messages to the left
- Contained variant provides background colors that differ for user/assistant
- Flat variant is useful for assistant messages in a minimal design
- Avatar has a subtle ring border and fallback text support
- Works seamlessly with the Conversation component
- This component is inspired by Vercel's [AI SDK Message component](https://ai-sdk.dev/elements/components/message) with modifications for ElevenLabs UI
