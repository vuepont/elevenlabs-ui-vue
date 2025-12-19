<!-- eslint-disable no-console -->
<script setup lang="ts">
import { ConversationBar } from '@repo/elements/conversation-bar'

// const agentId = import.meta.env.VITE_ELEVENLABS_AGENT_ID || 'your-agent-id-here'
// const agentId = 'sk_6bf4ebbc8e8b4aade04414abdd33e9499efba03421320bff'
const agentId = 'agent_8501kct0ej3heyx9gvmhbdc9e9a6'

const handleConnect = () => console.log('Connected')
const handleDisconnect = () => console.log('Disconnected')
const handleMessage = (msg: any) => console.log('Message:', msg)
const handleError = (err: any) => console.error('Error:', err)
</script>

<template>
  <div class="flex min-h-[200px] w-full items-center justify-center">
    <div class="w-full max-w-md">
      <ConversationBar
        :agent-id="agentId"
        @connect="handleConnect"
        @disconnect="handleDisconnect"
        @message="handleMessage"
        @error="handleError"
      />
    </div>
  </div>
</template>
