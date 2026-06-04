const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function buildTree() {
  const csvPath = path.join(__dirname, '..', 'public', 'india.csv');
  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  const tree = {};

  for await (const line of rl) {
    lineCount++;
    if (lineCount === 1) continue;

    // Simple split by comma (doesn't handle quotes perfectly, but sufficient to check size)
    const parts = line.split(',');
    if (parts.length < 9) continue;

    const state = parts[8].replace(/^"|"$/g, '').trim().toUpperCase();
    const district = parts[7].replace(/^"|"$/g, '').trim().toUpperCase();
    const city = parts[3].replace(/^"|"$/g, '').trim();
    const pincode = parts[4].replace(/^"|"$/g, '').trim();

    if (!state || state === 'NA' || !district || !city || !pincode) continue;

    if (!tree[state]) {
      tree[state] = {};
    }
    if (!tree[state][district]) {
      tree[state][district] = {};
    }
    tree[state][district][city] = pincode;
  }

  console.log(`Parsed ${lineCount} rows.`);
  const states = Object.keys(tree);
  console.log(`Number of States: ${states.length}`);
  
  let districtCount = 0;
  let cityCount = 0;
  for (const s of states) {
    const districts = Object.keys(tree[s]);
    districtCount += districts.length;
    for (const d of districts) {
      cityCount += Object.keys(tree[s][d]).length;
    }
  }
  console.log(`Number of Districts: ${districtCount}`);
  console.log(`Number of Cities (OfficeNames): ${cityCount}`);

  // Let's see the JSON string length
  const jsonStr = JSON.stringify(tree);
  console.log(`JSON size: ${(jsonStr.length / 1024 / 1024).toFixed(2)} MB`);
}

buildTree().catch(console.error);
