/**
 * HTTPS test server for browser SDK tests
 * Serves on https://localhost:3000 to match CORS configuration
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const PORT = 3000;

// SSL certificate paths
const CERT_PATH = path.join(__dirname, 'certs', 'localhost.crt');
const KEY_PATH = path.join(__dirname, 'certs', 'localhost.key');

// Check if certificates exist
if (!fs.existsSync(CERT_PATH) || !fs.existsSync(KEY_PATH)) {
  console.error('\n❌ SSL certificates not found!');
  console.error('Run: npm run generate-certs\n');
  process.exit(1);
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.map': 'application/json',
};

const sslOptions = {
  key: fs.readFileSync(KEY_PATH),
  cert: fs.readFileSync(CERT_PATH),
};

const server = https.createServer(sslOptions, (req, res) => {
  console.log(`${req.method} ${req.url}`);

  let filePath;

  if (req.url === '/' || req.url === '/index.html') {
    filePath = path.join(__dirname, 'browser', 'index.html');
  } else if (req.url.startsWith('/dist/')) {
    filePath = path.join(projectRoot, req.url);
  } else {
    filePath = path.join(__dirname, 'browser', req.url);
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'text/plain';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Not Found: ' + req.url);
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n🔒 SDK Test Server running at https://localhost:${PORT}\n`);
  console.log('Open https://localhost:3000 in your browser to run tests.');
  console.log('Note: You may need to accept the self-signed certificate warning.');
  console.log('Press Ctrl+C to stop.\n');
});
