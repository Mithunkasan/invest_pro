-- Remove duplicate TimeWall Task Wallet credits before enforcing idempotency.
-- For each TimeWall reference, keep the first transaction row and reverse only
-- the extra completed TASK credits that were already added to wallet balances.
WITH ranked_timewall_transactions AS (
  SELECT
    id,
    "userId",
    amount,
    status,
    "walletType",
    ROW_NUMBER() OVER (
      PARTITION BY reference
      ORDER BY "createdAt" ASC, id ASC
    ) AS row_number
  FROM "Transaction"
  WHERE reference LIKE 'TIMEWALL:%'
),
duplicate_credit_totals AS (
  SELECT
    "userId",
    SUM(amount) AS duplicate_amount
  FROM ranked_timewall_transactions
  WHERE row_number > 1
    AND status = 'COMPLETED'
    AND "walletType" = 'TASK'
  GROUP BY "userId"
),
updated_wallets AS (
  UPDATE "Wallet" AS wallet
  SET
    "taskBalance" = GREATEST(COALESCE(wallet."taskBalance", 0) - duplicate_credit_totals.duplicate_amount, 0),
    "mainBalance" = GREATEST(COALESCE(wallet."mainBalance", 0) - duplicate_credit_totals.duplicate_amount, 0),
    "totalEarned" = GREATEST(COALESCE(wallet."totalEarned", 0) - duplicate_credit_totals.duplicate_amount, 0),
    "updatedAt" = NOW()
  FROM duplicate_credit_totals
  WHERE wallet."userId" = duplicate_credit_totals."userId"
  RETURNING wallet."userId"
)
DELETE FROM "Transaction"
WHERE id IN (
  SELECT id
  FROM ranked_timewall_transactions
  WHERE row_number > 1
);

CREATE UNIQUE INDEX IF NOT EXISTS "Transaction_timewall_reference_unique"
ON "Transaction" ("reference")
WHERE reference LIKE 'TIMEWALL:%';
