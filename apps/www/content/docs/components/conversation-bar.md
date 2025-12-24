---
title: Conversation Bar
description: A complete voice conversation interface with microphone controls, text input, and real-time waveform visualization for ElevenLabs agents.
featured: true
component: true
---

::component-preview
---
name: conversation-bar
description: A beautiful bar for voice and audio interactions
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
    npx @elevenlabs/cli@latest add conversation-bar
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
        Copy and paste the [GitHub source code](https://github.com/vuepont/elevenlabs-ui-vue/tree/main/packages/elements/src/conversation-bar) into your project.
      ::

      ::step
        Update the import paths to match your project setup.
      ::
    ::


## Usage

<Callout type="info">

This component requires an ElevenLabs Agent ID. [Create your agent here](https://elevenlabs.io/agents).

</Callout>

```tsx showLineNumbers
import { ConversationBar } from "@/components/elevenlabs-ui/conversation-bar"
```

### Basic Usage

```vue showLineNumbers
<ConversationBar
  :agent-id="your-agent-id"
  @connect="console.log('Connected')"
  @disconnect="console.log('Disconnected')"
  @message="(message) => console.log('Message:', message)"
  @error="(error) => console.error('Error:', error)"
/>
```

### With Custom Styling

```vue showLineNumbers
<ConversationBar
  :agent-id="your-agent-id"
  class="max-w-2xl"
  waveformClass="bg-gradient-to-r from-blue-500 to-purple-500"
  @connect="console.log("Connected")"
/>
```

## API Reference

### ConversationBar

A complete voice conversation interface with WebRTC support, microphone controls, text input, and real-time waveform visualization.

#### Props

| Prop              | Type                                                             | Description                                     |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| agentId           | `string`                                                         | **Required.** ElevenLabs Agent ID to connect to |
| class             | `string`                                                         | Optional CSS classes for the container          |
| waveformClass     | `string`                                                         | Optional CSS classes for the waveform           |

#### Emits

| Emit              | Type                                                             | Description                                     |
| ----------------- | ---------------------------------------------------------------- | ----------------------------------------------- |
| connect           | `() => void`                                                     | Callback when conversation connects             |
| disconnect        | `() => void`                                                     | Callback when conversation disconnects          |
| error             | `(error: Error) => void`                                         | Callback when an error occurs                   |
| message           | `(message: { source: "user" \| "ai"; message: string }) => void` | Callback when a message is received             |

## Features

- **Voice Input**: Connect to ElevenLabs agents via WebRTC for real-time voice conversations
- **Text Input**: Expandable keyboard input with contextual updates
- **Microphone Controls**: Mute/unmute toggle with visual feedback
- **Live Waveform**: Real-time audio visualization during conversations
- **Connection States**: Visual feedback for disconnected, connecting, connected, and disconnecting states
- **Keyboard Shortcuts**: Enter to send messages, Shift+Enter for new lines
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Notes

- Requires the `@elevenlabs/vue` package for conversation management
- Uses WebRTC for real-time audio streaming
- Automatically requests microphone permissions when starting a conversation
- Cleans up media streams on component unmount
- Text input sends contextual updates to the agent while typing
- The waveform visualizes microphone input in real-time when connected and unmuted
