/**
 * In-memory test payment store
 * Fallback ketika Mayar/Supabase tidak dikonfigurasi
 */

const TEST_TX_KEY_PREFIX = "test_tx_";
const AUTO_PAID_DELAY_MS = 5000;

interface TestTransaction {
  id: string;
  amount: number;
  qrisUrl: string;
  status: "pending" | "paid";
  createdAt: number;
  paidAt: number | null;
}

const store = new Map<string, TestTransaction>();

export function createTestTransaction(id: string, amount: number, qrisUrl: string): TestTransaction {
  const tx: TestTransaction = {
    id,
    amount,
    qrisUrl,
    status: "pending",
    createdAt: Date.now(),
    paidAt: null,
  };
  store.set(TEST_TX_KEY_PREFIX + id, tx);

  // Auto paid after delay
  setTimeout(() => {
    const existing = store.get(TEST_TX_KEY_PREFIX + id);
    if (existing && existing.status === "pending") {
      existing.status = "paid";
      existing.paidAt = Date.now();
      store.set(TEST_TX_KEY_PREFIX + id, existing);
    }
  }, AUTO_PAID_DELAY_MS);

  return tx;
}

export function getTestTransactionStatus(id: string): TestTransaction | null {
  return store.get(TEST_TX_KEY_PREFIX + id) || null;
}

export function updateTestTransactionStatus(id: string, status: "paid"): TestTransaction | null {
  const tx = store.get(TEST_TX_KEY_PREFIX + id);
  if (!tx) return null;
  tx.status = status;
  tx.paidAt = Date.now();
  store.set(TEST_TX_KEY_PREFIX + id, tx);
  return tx;
}
