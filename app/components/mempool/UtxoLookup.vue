<script setup lang="ts">
import type { AddressUtxos } from "~~/shared/types/mempool";

const address = ref("");
const submitted = ref("");

const { data, error, status } = await useFetch<AddressUtxos>("/api/utxos", {
  query: { address: submitted },
  immediate: false,
  watch: [submitted],
});

const nf = new Intl.NumberFormat("en-US");

function formatBtc(sats: number) {
  return (sats / 1e8).toFixed(8);
}

function shortTxid(txid: string) {
  return `${txid.slice(0, 10)}…${txid.slice(-8)}`;
}

function lookup() {
  const value = address.value.trim();
  if (!value) return;
  submitted.value = value;
}

const isPending = computed(() => status.value === "pending");
</script>

<template>
  <section class="rounded-xl bg-default p-4 ring ring-default sm:p-5">
    <div class="mb-4 flex items-center gap-2">
      <UIcon name="i-lucide-search" class="size-4 text-warning" />
      <h2 class="text-sm font-semibold text-highlighted">UTXO lookup</h2>
    </div>

    <form class="flex flex-col gap-2 sm:flex-row" @submit.prevent="lookup">
      <UInput
        v-model="address"
        placeholder="Enter a Bitcoin address (bc1… or 1… or 3…)"
        icon="i-lucide-wallet"
        class="flex-1"
        :disabled="isPending"
        autocapitalize="off"
        autocomplete="off"
        spellcheck="false"
      />
      <UButton
        type="submit"
        label="Look up"
        icon="i-lucide-arrow-right"
        :loading="isPending"
        :disabled="!address.trim()"
      />
    </form>

    <UAlert
      v-if="error"
      class="mt-4"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="Lookup failed"
      :description="error.statusMessage || 'Could not fetch UTXOs for that address.'"
    />

    <div v-else-if="data" class="mt-4 space-y-4">
      <div v-if="data.count === 0" class="rounded-lg bg-muted p-4 text-center text-sm text-muted">
        No unspent outputs found for this address.
      </div>

      <template v-else>
        <div class="grid grid-cols-3 gap-3">
          <div class="rounded-lg bg-muted p-3">
            <p class="text-xs text-muted">UTXOs</p>
            <p class="mt-0.5 text-lg font-semibold text-highlighted">{{ nf.format(data.count) }}</p>
          </div>
          <div class="rounded-lg bg-muted p-3">
            <p class="text-xs text-muted">Confirmed</p>
            <p class="mt-0.5 text-lg font-semibold text-highlighted">{{ formatBtc(data.confirmedValue) }}</p>
            <p class="text-xs text-dimmed">BTC</p>
          </div>
          <div class="rounded-lg bg-muted p-3">
            <p class="text-xs text-muted">Unconfirmed</p>
            <p class="mt-0.5 text-lg font-semibold text-highlighted">{{ formatBtc(data.unconfirmedValue) }}</p>
            <p class="text-xs text-dimmed">BTC</p>
          </div>
        </div>

        <ul class="divide-y divide-default overflow-hidden rounded-lg ring ring-default">
          <li
            v-for="utxo in data.utxos"
            :key="`${utxo.txid}:${utxo.vout}`"
            class="flex items-center justify-between gap-3 bg-default p-3"
          >
            <div class="min-w-0">
              <a
                :href="`https://mempool.space/tx/${utxo.txid}`"
                target="_blank"
                rel="noopener noreferrer"
                class="font-mono text-xs text-default underline-offset-2 hover:underline"
              >
                {{ shortTxid(utxo.txid) }}:{{ utxo.vout }}
              </a>
              <div class="mt-1">
                <UBadge
                  :color="utxo.status.confirmed ? 'success' : 'warning'"
                  variant="soft"
                  size="sm"
                >
                  {{ utxo.status.confirmed ? `Block ${utxo.status.block_height}` : "Unconfirmed" }}
                </UBadge>
              </div>
            </div>
            <div class="shrink-0 text-right">
              <p class="font-mono text-sm font-semibold text-highlighted">{{ formatBtc(utxo.value) }}</p>
              <p class="text-xs text-dimmed">{{ nf.format(utxo.value) }} sats</p>
            </div>
          </li>
        </ul>
      </template>
    </div>
  </section>
</template>
