export interface MempoolStats {
  count: number;
  vsize: number;
  total_fee: number;
  fee_histogram: [number, number][];
}

export interface RecentTx {
  txid: string;
  fee: number;
  vsize: number;
  value: number;
}

export interface RecommendedFees {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export interface MempoolSnapshot {
  stats: MempoolStats;
  recent: RecentTx[];
  fees: RecommendedFees;
  tipHeight: number;
  fetchedAt: number;
}
