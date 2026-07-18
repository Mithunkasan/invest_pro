const { execSync } = require('child_process');
try {
  const output = execSync('npx ts-node -r tsconfig-paths/register --compiler-options "{\\"module\\":\\"CommonJS\\"}" scratch/verify_timewall_commission.ts', { encoding: 'utf8' });
  console.log(output);
} catch (err) {
  console.error(err.stdout || err.stderr || err.message);
}
