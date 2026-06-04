import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

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
  const states = new Set<string>();
  const districtsByState = new Map<string, Set<string>>();

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) continue; // skip header

    // Split by comma, taking care of quoted values if needed
    // A simple regex split or simple split since we only need certain columns
    // Column indices:
    // 3: officename
    // 4: pincode
    // 7: district
    // 8: statename
    const parts = line.split(',');
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
        districtsByState.get(state)!.add(district);
      }
    }
  }

  const end = Date.now();
  console.log(`Parsed ${lineCount} lines in ${end - start} ms`);
  console.log('Unique States:', Array.from(states).sort());
  console.log('Districts in TELANGANA:', Array.from(districtsByState.get('TELANGANA') || []).sort());
}

testParse().catch(console.error);
