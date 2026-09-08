const fs = require('fs');
const path = require('path');

const source = path.resolve(__dirname, '../src/data/cities.json');
const destination = path.resolve(__dirname, '../dist/data/cities.json');

try {
  if (!fs.existsSync(source)) {
    throw new Error(`Source city configuration is missing: ${source}`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
  console.log('Copied cities.json to dist/data/cities.json');
} catch (error) {
  console.error(`Failed to copy static assets: ${error.message}`);
  process.exitCode = 1;
}
