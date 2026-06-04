const fs = require('fs');
const path = require('path');
const readline = require('readline');

async function superFastParse() {
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

    // Direct split
    const parts = line.split(',');
    if (parts.length < 9) continue;

    // Check if parts[8] (state) or parts[7] (district) contains quotes and strip them
    let state = parts[8];
    if (state.charCodeAt(0) === 34) { // double quote
      state = state.slice(1, -1);
    }
    state = state.trim().toUpperCase();

    let district = parts[7];
    if (district.charCodeAt(0) === 34) {
      district = district.slice(1, -1);
    }
    district = district.trim().toUpperCase();

    let city = parts[3];
    if (city.charCodeAt(0) === 34) {
      city = city.slice(1, -1);
    }
    city = city.trim();

    let pincode = parts[4];
    if (pincode.charCodeAt(0) === 34) {
      pincode = pincode.slice(1, -1);
    }
    pincode = pincode.trim();

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

superFastParse().catch(console.error);
