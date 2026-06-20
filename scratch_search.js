const fs = require('fs');
const path = require('path');

const rootDir = 'd:\\\\matt_project\\\\Client Projects\\\\Share_Market\\\\VR_Galaxy\\\\invest_pro';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json') || file.endsWith('.md')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(rootDir);
let results = [];
for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/(Invest\s*Pro|Investment)/i.test(line)) {
      results.push(file.replace(rootDir, '') + ':' + (i+1) + ': ' + line.trim());
    }
  }
}
fs.writeFileSync(path.join(rootDir, 'search_results.txt'), results.join('\\n'));
console.log('Found ' + results.length + ' matches in ' + files.length + ' files.');
