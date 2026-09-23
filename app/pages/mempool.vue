<script setup lang="ts">
import type { MempoolSnapshot } from "~~/shared/types/mempool";

definePageMeta({ layout: false });

useHead({
  title: "Bitcoin Mempool",
  meta: [
    {
      name: "description",
      content: "Live Bitcoin mempool viewer — pending transactions, fee estimates, and network load.",
    },
  ],
});

const { data, error, refresh, status } = await useFetch<MempoolSnapshot>("/api/mempool", {
  key: "mempool-snapshot",
});

// Poll on the client for a live feed without hammering the provider.
const REFRESH_MS = 6000;
let timer: ReturnType<typeof setInterval> | undefined;

onMounted(() => {
  timer = setInterval(() => {
    void refresh();
  }, REFRESH_MS);
});

onBeforeUnmount(() => {
  if (timer) clearInterval(timer);
});

const nf = new Intl.NumberFormat("en-US");

const stats = computed(() => {
  const snap = data.value;
  if (!snap) return [];

  const vMb = snap.stats.vsize / 1e6;
  const totalBtc = snap.stats.total_fee / 1e8;

  return [
    {
      label: "Pending txs",
      value: nf.format(snap.stats.count),
      icon: "i-lucide-hourglass",
      hint: "Unconfirmed transactions",
    },
    {
      label: "Mempool size",
      value: vMb.toFixed(2),
      unit: "vMB",
      icon: "i-lucide-database",
      hint: `${(vMb / 1).toFixed(2)} MB of block space queued`,
    },
    {
      label: "Total fees",
      value: totalBtc.toFixed(4),
      unit: "BTC",
      icon: "i-lucide-coins",
      hint: "Fees waiting to be mined",
    },
    {
      label: "Block height",
      value: nf.format(snap.tipHeight),
      icon: "i-lucide-blocks",
      hint: "Current chain tip",
    },
  ];
});

const lastUpdated = computed(() => {
  if (!data.value) return "";
  return new Date(data.value.fetchedAt).toLocaleTimeString();
});

const blocksToClear = computed(() => {
  if (!data.value) return 0;
  // Bitcoin blocks target ~1M vB of weight-adjusted space.
  return Math.ceil(data.value.stats.vsize / 1_000_000);
});
</script>

<template>
  <div class="min-h-screen bg-muted text-default">
    <header class="border-b border-default bg-default/80 backdrop-blur">
      <UContainer class="flex items-center gap-3 py-3">
        <div class="flex size-9 items-center justify-center rounded-lg bg-elevated ring ring-default">
          <UIcon name="i-simple-icons-bitcoin" class="size-5 text-warning" />
        </div>
        <div class="min-w-0">
          <h1 class="text-base font-semibold text-highlighted">Bitcoin Mempool</h1>
          <p class="text-xs text-muted">Live network activity</p>
        </div>

        <div class="ms-auto flex items-center gap-2">
          <span class="relative flex size-2">
            <span
              v-if="status !== 'error'"
              class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75"
            />
            <span
              class="relative inline-flex size-2 rounded-full"
              :class="status === 'error' ? 'bg-error' : 'bg-success'"
            />
          </span>
          <span class="hidden text-xs text-muted sm:inline">
            {{ status === "error" ? "Offline" : "Live" }}
          </span>
        </div>
      </UContainer>
    </header>

    <UContainer class="space-y-4 py-4 sm:py-6">
      <UAlert
        v-if="error"
        color="error"
        variant="soft"
        icon="i-lucide-triangle-alert"
        title="Couldn't load mempool data"
        :description="error.statusMessage || 'The mempool provider is unavailable. Retrying automatically.'"
      />

      <template v-if="data">
        <!-- Congestion banner -->
        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-default p-4 ring ring-default">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-activity" class="size-4 text-warning" />
            <span class="text-sm text-default">
              <span class="font-semibold text-highlighted">{{ blocksToClear }}</span>
              block{{ blocksToClear === 1 ? "" : "s" }} needed to clear the backlog
            </span>
          </div>
          <span v-if="lastUpdated" class="ms-auto text-xs text-dimmed">
            Updated {{ lastUpdated }}
          </span>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MempoolStatCard
            v-for="stat in stats"
            :key="stat.label"
            v-bind="stat"
          />
        </div>

        <!-- Fees -->
        <MempoolFeeEstimates :fees="data.fees" />

        <!-- Recent transactions -->
        <MempoolRecentTransactions :transactions="data.recent" />
      </template>

      <div v-else-if="status === 'pending'" class="space-y-3">
        <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <USkeleton v-for="i in 4" :key="i" class="h-28 rounded-xl" />
        </div>
        <USkeleton class="h-32 rounded-xl" />
        <USkeleton class="h-64 rounded-xl" />
      </div>

      <p class="pt-2 text-center text-xs text-dimmed">
        Data from
        <a
          href="https://mempool.space"
          target="_blank"
          rel="noopener noreferrer"
          class="underline underline-offset-2 hover:text-muted"
        >mempool.space</a>
        · refreshes every {{ REFRESH_MS / 1000 }}s
      </p>
    </UContainer>
  </div>
</template>
