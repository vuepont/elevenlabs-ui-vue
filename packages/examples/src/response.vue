<script setup lang="ts">
import { Response } from '@repo/elements/response'
import { onMounted, onUnmounted, ref } from 'vue'

const tokens = [
  '### Welcome',
  '\n\n',
  'This',
  ' is',
  ' a',
  ' **rich',
  ' markdown',
  '**',
  ' showcase',
  ' with',
  ' multiple',
  ' features.',
  '\n\n',
  '---',
  '\n\n',
  '## Data Table',
  '\n\n',
  '| Name',
  ' | Role',
  ' | Status',
  ' |',
  '\n',
  '|------|------|--------|',
  '\n',
  '| Alice',
  ' | Engineer',
  ' | Active',
  ' |',
  '\n',
  '| Bob',
  ' | Designer',
  ' | Active',
  ' |',
  '\n',
  '| Carol',
  ' | PM',
  ' | Active',
  ' |',
  '\n\n',
  '## Inspiration',
  '\n\n',
  '> *Simplicity',
  ' is',
  ' the',
  ' ultimate',
  ' sophistication.*',
  '\n',
  '> —',
  ' Leonardo',
  ' da',
  ' Vinci',
  '\n\n',
  '## Inline',
  ' and',
  ' Block',
  ' Code',
  '\n\n',
  'Use',
  ' `let',
  ' total',
  ' =',
  ' items.length`',
  ' to',
  ' count',
  ' elements.',
  '\n\n',
  '```',
  'python',
  '\n',
  'def',
  ' greet(name):',
  '\n',
  '    return',
  ' f"Hello, {name}!"',
  '\n',
  'print(greet("World"))',
  '\n',
  '```',
  '\n\n',
  '## Math',
  '\n\n',
  'Inline',
  ' math:',
  ' $a^2',
  ' +',
  ' b^2',
  ' =',
  ' c^2$',
  '.',
  '\n\n',
  'Displayed',
  ' equation:',
  '\n\n',
  '$$',
  '\n',
  '\\int_0^1',
  ' x^2',
  ' dx',
  ' =',
  ' \\frac{1}{3}',
  '\n',
  '$$',
  '\n\n',
]

const content = ref('')
let intervalId: ReturnType<typeof setInterval>

onMounted(() => {
  let index = 0

  intervalId = setInterval(() => {
    if (index < tokens.length) {
      content.value += tokens[index]
      index++
    }
    else {
      clearInterval(intervalId)
    }
  }, 100)
})

onUnmounted(() => {
  clearInterval(intervalId)
})
</script>

<template>
  <div class="h-full min-h-0 w-full overflow-hidden">
    <Response :content="content" class="h-full overflow-auto p-10" />
  </div>
</template>
