<script setup lang="ts">
import type { RecentTx } from "~~/shared/types/mempool";

const props = defineProps<{
  transactions: RecentTx[];
}>();

function shortTxid(txid: string) {
  return `${txid.slice(0, 8)}…${txid.slice(-8)}`;
}

function feeRate(tx: RecentTx) {
  if (!tx.vsize) return "0";
  return (tx.fee / tx.vsize).toFixed(1);
}

function btc(sats: number) {
  return (sats / 1e8).toFixed(8);
}

const rows = computed(() =>
  props.transactions.map(tx => ({
    ...tx,
    short: shortTxid(tx.txid),
    rate: feeRate(tx),
    valueBtc: btc(tx.value),
  })),
);
</script>

<template>
  <div class="rounded-xl bg-default ring ring-default">
    <div class="flex items-center gap-2 border-b border-default p-4">
      <UIcon name="i-lucide-list" class="size-4 text-muted" />
      <h2 class="text-sm font-semibold text-highlighted">Incoming transactions</h2>
      <UBadge color="neutral" variant="soft" size="sm" class="ms-auto font-mono">
        {{ rows.length }}
      </UBadge>
    </div>

    <div class="divide-y divide-default">
      <a
        v-for="tx in rows"
        :key="tx.txid"
        :href="`https://mempool.space/tx/${tx.txid}`"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center gap-3 p-3 transition-colors hover:bg-elevated/50 sm:px-4"
      >
        <UIcon name="i-lucide-arrow-right-left" class="size-4 shrink-0 text-dimmed" />

        <div class="min-w-0 flex-1">
          <p class="truncate font-mono text-xs text-highlighted">{{ tx.short }}</p>
          <p class="text-[11px] text-dimmed">{{ tx.valueBtc }} BTC</p>
        </div>

        <div class="flex shrink-0 flex-col items-end">
          <span class="font-mono text-sm font-medium text-default tabular-nums">{{ tx.rate }}</span>
          <span class="text-[11px] text-dimmed">sat/vB</span>
        </div>

        <UIcon name="i-lucide-external-link" class="size-3.5 shrink-0 text-dimmed" />
      </a>

      <p v-if="!rows.length" class="p-6 text-center text-sm text-muted">
        Waiting for transactions…
      </p>
    </div>
  </div>
</template>
