UPDATE "Wallet"
SET "mainBalance" =
  COALESCE("rewardBalance", 0) +
  COALESCE("referralBalance", 0) +
  COALESCE("levelBalance", 0) +
  COALESCE("shareBalance", 0) +
  COALESCE("bonusBalance", 0) +
  COALESCE("taskBalance", 0)
WHERE "mainBalance" IS DISTINCT FROM
  COALESCE("rewardBalance", 0) +
  COALESCE("referralBalance", 0) +
  COALESCE("levelBalance", 0) +
  COALESCE("shareBalance", 0) +
  COALESCE("bonusBalance", 0) +
  COALESCE("taskBalance", 0);
