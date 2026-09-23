import type { AddressUtxos, Utxo } from "~~/shared/types/mempool";

const BASE = "https://mempool.space/api";

// Proxies mempool.space's address UTXO endpoint server-side (avoids CORS) and
// summarizes the unspent outputs for a given Bitcoin address.
export default defineEventHandler(async (event): Promise<AddressUtxos> => {
  const query = getQuery(event);
  const address = typeof query.address === "string" ? query.address.trim() : "";

  if (!address) {
    throw createError({
      statusCode: 400,
      statusMessage: "Provide a Bitcoin address.",
    });
  }

  // Basic sanity check for mainnet address formats (base58 P2PKH/P2SH or bech32).
  const looksValid = /^(bc1[a-z0-9]{6,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(address);
  if (!looksValid) {
    throw createError({
      statusCode: 400,
      statusMessage: "That doesn't look like a valid Bitcoin address.",
    });
  }

  let utxos: Utxo[];
  try {
    utxos = await $fetch<Utxo[]>(`${BASE}/address/${encodeURIComponent(address)}/utxo`);
  }
  catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: "Failed to reach the Bitcoin mempool provider.",
      data: { cause: error instanceof Error ? error.message : String(error) },
    });
  }

  const confirmedValue = utxos
    .filter(u => u.status.confirmed)
    .reduce((sum, u) => sum + u.value, 0);
  const totalValue = utxos.reduce((sum, u) => sum + u.value, 0);

  // Show the most valuable outputs first.
  utxos.sort((a, b) => b.value - a.value);

  return {
    address,
    utxos,
    totalValue,
    confirmedValue,
    unconfirmedValue: totalValue - confirmedValue,
    count: utxos.length,
  };
});
