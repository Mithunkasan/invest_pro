const fs = require('fs');
let code = fs.readFileSync('actions/admin.ts', 'utf8').replace(/\r\n/g, '\n');

const startMarker = '      // ── Distribute Referral Commissions ──';
const startIndex = code.indexOf(startMarker);

const endMarker = '    } else {\n      await prisma.deposit.update({';
const endIndex = code.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
  console.log("Error finding markers", startIndex, endIndex);
  process.exit(1);
}

const before = code.substring(0, startIndex);
const after = code.substring(endIndex);

const newCode = before + '      await prisma.$transaction(dbOps)\n\n      // Sync main balance for user who deposited\n      await syncWalletMainBalance(prisma, deposit.userId)\n' + after;

fs.writeFileSync('actions/admin.ts', newCode);
console.log("Success");
