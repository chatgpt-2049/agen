<script setup lang="ts">
defineProps<{
  label: string;
  value: string;
  unit?: string;
  icon: string;
  hint?: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-3 rounded-xl bg-default p-4 ring ring-default">
    <div class="flex items-center gap-2 text-muted">
      <UIcon :name="icon" class="size-4 shrink-0" />
      <span class="text-xs font-medium uppercase tracking-wide">{{ label }}</span>
    </div>
    <div class="flex items-baseline gap-1.5">
      <span class="font-mono text-2xl font-semibold text-highlighted tabular-nums">{{ value }}</span>
      <span v-if="unit" class="text-sm text-muted">{{ unit }}</span>
    </div>
    <p v-if="hint" class="text-xs text-dimmed">{{ hint }}</p>
  </div>
</template>
