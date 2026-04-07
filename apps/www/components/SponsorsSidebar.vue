<script setup lang="ts">
import { siteConfig } from '@/lib/config'

withDefaults(defineProps<{
  separated?: boolean
}>(), {
  separated: false,
})

const sponsors = siteConfig.sponsors
</script>

<template>
  <section
    v-if="sponsors.items.length"
    :class="separated ? 'border-t pt-5' : 'pt-0'"
    aria-labelledby="sidebar-sponsors"
  >
    <p
      id="sidebar-sponsors"
      class="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-[0.18em]"
    >
      {{ sponsors.title }}
    </p>

    <div class="grid gap-px overflow-hidden rounded-lg border bg-border">
      <SponsorTile
        v-for="item in sponsors.items"
        :key="item.name"
        compact
        :alt="item.alt"
        :href="item.href"
        :logo="item.logo"
        :name="item.name"
      />
      <SponsorTile
        compact
        :href="sponsors.cta.href"
        :name="sponsors.cta.name"
      />
    </div>
  </section>
</template>
