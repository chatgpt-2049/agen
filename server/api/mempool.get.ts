import type {
  MempoolSnapshot,
  MempoolStats,
  RecentTx,
  RecommendedFees,
} from "~~/shared/types/mempool";

const BASE = "https://mempool.space/api";

// Proxies the public mempool.space REST API server-side so the browser avoids
// CORS and we can combine several endpoints into a single snapshot.
export default defineEventHandler(async (): Promise<MempoolSnapshot> => {
  try {
    const [stats, recent, fees, tipHeight] = await Promise.all([
      $fetch<MempoolStats>(`${BASE}/mempool`),
      $fetch<RecentTx[]>(`${BASE}/mempool/recent`),
      $fetch<RecommendedFees>(`${BASE}/v1/fees/recommended`),
      $fetch<number>(`${BASE}/blocks/tip/height`),
    ]);

    return {
      stats,
      recent: recent.slice(0, 30),
      fees,
      tipHeight,
      fetchedAt: Date.now(),
    };
  }
  catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to reach the Bitcoin mempool provider.",
      data: { cause: error instanceof Error ? error.message : String(error) },
    });
  }
});
