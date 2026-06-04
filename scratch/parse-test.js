const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function testParse() {
  const csvPath = path.join(__dirname, '..', 'public', 'india.csv');
  console.log('Reading CSV from:', csvPath);

  const start = Date.now();
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  const states = new Set();
  const districtsByState = new Map();

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) continue; // skip header

    // Split by comma, taking care of quotes if needed
    // Simple split first to see if it works, or regex split
    // Regex for comma separation that handles optional quotes:
    // This regex splits on commas that are not inside quotes
    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (parts.length < 9) continue;

    // Remove quotes
    const state = parts[8].replace(/^"|"$/g, '').trim();
    const district = parts[7].replace(/^"|"$/g, '').trim();

    if (state) {
      states.add(state);
      if (!districtsByState.has(state)) {
        districtsByState.set(state, new Set());
      }
      if (district) {
        districtsByState.get(state).add(district);
      }
    }
  }

  const end = Date.now();
  console.log(`Parsed ${lineCount} lines in ${end - start} ms`);
  console.log('Unique States:', Array.from(states).sort());
  console.log('Districts in TELANGANA:', Array.from(districtsByState.get('TELANGANA') || []).sort());
}

testParse().catch(console.error);
