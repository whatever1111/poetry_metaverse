// Create an isolated test database by copying the baseline DB before tests run (CommonJS to satisfy Jest runtime).
const fs = require('fs');
const path = require('path');

// Paths
const appRoot = path.join(__dirname, '..');
const dataDir = path.join(appRoot, 'data');
const baselineDb = path.join(dataDir, 'lugarden.db');
const testDb = path.join(dataDir, 'lugarden.test.db');

try {
  // If baseline DB exists, copy to test DB (overwrite each run)
  if (fs.existsSync(baselineDb)) {
    fs.copyFileSync(baselineDb, testDb);
  }

  // Ensure DATABASE_URL points to test DB for the running process
  const rel = path.relative(appRoot, testDb).split(path.sep).join('/');
  process.env.DATABASE_URL = `file:${rel}`;

  // Do not modify .env file on disk; only set env for this Jest process
  // This avoids polluting developer environment and keeps baseline DB clean
} catch (e) {
  // Fail silently to avoid breaking tests when environment is unusual
  // Tests that require DB will surface errors with clearer messages
}


