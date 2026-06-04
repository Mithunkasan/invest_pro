const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Fast CSV row parser that handles optional quotes but avoids expensive regex
function parseCsvRow(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

async function fastParse() {
  const csvPath = path.join(__dirname, '..', 'public', 'india.csv');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const start = Date.now();
  let lineCount = 0;
  const tree = {};

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) continue;

    const parts = parseCsvRow(line);
    if (parts.length < 9) continue;

    const state = parts[8].trim().toUpperCase();
    const district = parts[7].trim().toUpperCase();
    const city = parts[3].trim();
    const pincode = parts[4].trim();

    if (!state || state === 'NA' || !district || !city || !pincode) continue;

    if (!tree[state]) {
      tree[state] = {};
    }
    if (!tree[state][district]) {
      tree[state][district] = {};
    }
    tree[state][district][city] = pincode;
  }

  const end = Date.now();
  console.log(`Parsed ${lineCount} rows in ${end - start} ms`);
  console.log(`Tree built. States: ${Object.keys(tree).length}`);
}

fastParse().catch(console.error);
