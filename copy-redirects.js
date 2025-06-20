// This script copies the _redirects file to the dist folder after build
const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '_redirects');
const dest = path.join(__dirname, 'dist', '_redirects');

if (fs.existsSync(src)) {
  fs.copyFileSync(src, dest);
  console.log('_redirects file copied to dist/');
} else {
  console.warn('_redirects file not found!');
}
