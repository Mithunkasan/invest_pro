const fs = require('fs');
const path = require('path');
const rootDir = process.cwd();

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next') && !file.includes('prisma')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json') || file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(rootDir);

const replacements = [
  // Invest Pro / InvestPro
  { regex: /Invest\s*Pro/g, replacement: 'VR Galaxy Network' },
  { regex: /investpro\.com/gi, replacement: 'vrgalaxynetwork.com' },
  { regex: /Investpro/g, replacement: 'VR Galaxy Network' },
  { regex: /InvestPro/g, replacement: 'VR Galaxy Network' },
  
  // Specific occurrences from search results:
  { regex: /Investment Active/g, replacement: 'Activation Plan Active' },
  { regex: /investment in/gi, replacement: 'activation plan in' },
  { regex: /Investment created/g, replacement: 'Activation Plan created' },
  { regex: /'s investment/gi, replacement: "'s activation plan" },
  { regex: /Investment must/g, replacement: 'Activation Plan must' },
  { regex: /Start your investment journey/gi, replacement: 'Start your activation plan journey' },
  { regex: /investment dashboard/g, replacement: 'activation plan dashboard' },
  { regex: /Total Investment/g, replacement: 'Total Activation Plan' },
  { regex: /Investment History/g, replacement: 'Activation Plan History' },
  { regex: /Investment Amount/g, replacement: 'Activation Plan Amount' },
  { regex: /Confirm Investment/g, replacement: 'Confirm Activation Plan' },
  { regex: /investment portfolio/g, replacement: 'activation plan portfolio' },
  { regex: /investment options/g, replacement: 'activation plan options' },
  { regex: /investment goals/g, replacement: 'activation plan goals' },
  { regex: /Min Investment/g, replacement: 'Min Activation Plan' },
  { regex: /Max Investment/g, replacement: 'Max Activation Plan' },
  { regex: /investment returns/g, replacement: 'activation plan returns' },
  { regex: /investment-based/g, replacement: 'activation plan-based' },
  { regex: /investment services/g, replacement: 'activation plan services' },
  { regex: /Investment Risk/g, replacement: 'Activation Plan Risk' },
  { regex: /investment risks/gi, replacement: 'activation plan risks' },
  { regex: /investment platform/gi, replacement: 'activation plan platform' },
  { regex: /investment queries/g, replacement: 'activation plan queries' },
  { regex: /Investment Company/gi, replacement: 'Activation Plan Company' },
  { regex: /invest money/gi, replacement: 'activate plans' },
  { regex: /Return on Investment/g, replacement: 'Return on Activation Plan' },
  { regex: /investments\./gi, replacement: 'activation plans.' },
  { regex: /Active Investments/g, replacement: 'Active Activation Plans' },
  
  // UI texts and JSON values
  { regex: /Investment Plans/g, replacement: 'Activation Plans' },
  { regex: /Investment Plan/g, replacement: 'Activation Plan' },
  { regex: /investment plan/gi, replacement: 'activation plan' },
  { regex: /My Investments/g, replacement: 'My Activation Plans' },
  { regex: />Investments</g, replacement: '>Activation Plans<' },
  { regex: />Investment</g, replacement: '>Activation Plan<' },
  { regex: /"Investments"/g, replacement: '"Activation Plans"' },
  { regex: /'Investments'/g, replacement: "'Activation Plans'" },
  { regex: /'Investment'/g, replacement: "'Activation Plan'" },
  { regex: /name="Investments"/g, replacement: 'name="Activation Plans"' },
  { regex: /description:\s*'Investment/g, replacement: "description: 'Activation Plan" },
  { regex: /description:\s*`Investment/g, replacement: "description: `Activation Plan" },

  // Locales specific strings if any
  { regex: /"investments":\s*"My Investments"/g, replacement: '"investments": "My Activation Plans"' },
  { regex: /"investments":\s*"என் முதலீடுகள்"/g, replacement: '"investments": "என் Activation Plans"' },
];

let changedFiles = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  let original = content;
  
  for (const rule of replacements) {
    content = content.replace(rule.regex, rule.replacement);
  }

  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log('Updated:', file.replace(rootDir, ''));
  }
}

console.log('Total files updated:', changedFiles);
