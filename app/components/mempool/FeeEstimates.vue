<script setup lang="ts">
import type { RecommendedFees } from "~~/shared/types/mempool";

const props = defineProps<{
  fees: RecommendedFees;
}>();

const tiers = computed(() => [
  {
    key: "fastest",
    label: "No Priority",
    sublabel: "~10 min",
    rate: props.fees.fastestFee,
    color: "error" as const,
    icon: "i-lucide-zap",
  },
  {
    key: "halfHour",
    label: "High",
    sublabel: "~30 min",
    rate: props.fees.halfHourFee,
    color: "warning" as const,
    icon: "i-lucide-gauge",
  },
  {
    key: "hour",
    label: "Medium",
    sublabel: "~1 hour",
    rate: props.fees.hourFee,
    color: "primary" as const,
    icon: "i-lucide-clock",
  },
  {
    key: "economy",
    label: "Low",
    sublabel: "hours+",
    rate: props.fees.economyFee,
    color: "success" as const,
    icon: "i-lucide-leaf",
  },
]);
</script>

<template>
  <div class="rounded-xl bg-default p-4 ring ring-default">
    <div class="mb-4 flex items-center gap-2">
      <UIcon name="i-lucide-fuel" class="size-4 text-muted" />
      <h2 class="text-sm font-semibold text-highlighted">Recommended fees</h2>
      <span class="ms-auto text-xs text-dimmed">sat/vB</span>
    </div>

    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <div
        v-for="tier in tiers"
        :key="tier.key"
        class="flex flex-col gap-1.5 rounded-lg bg-elevated/60 p-3"
      >
        <div class="flex items-center gap-1.5">
          <UIcon :name="tier.icon" class="size-3.5 text-muted" />
          <span class="text-xs font-medium text-default">{{ tier.label }}</span>
        </div>
        <div class="flex items-baseline gap-1">
          <span class="font-mono text-xl font-semibold text-highlighted tabular-nums">{{ tier.rate }}</span>
          <span class="text-[11px] text-dimmed">sat/vB</span>
        </div>
        <UBadge :color="tier.color" variant="soft" size="sm" class="w-fit">
          {{ tier.sublabel }}
        </UBadge>
      </div>
    </div>
  </div>
</template>
