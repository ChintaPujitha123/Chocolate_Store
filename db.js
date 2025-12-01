// db.js
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'choco.db');
const MIGRATION_FILE = path.join(__dirname, 'migrations.sql');

const db = new sqlite3.Database(DB_PATH);

function runMigrations() {
  const sql = fs.readFileSync(MIGRATION_FILE, 'utf8');
  db.exec(sql, (err) => {
    if (err) {
      console.error('Migration error:', err);
      process.exit(1);
    } else {
      console.log('Migrations applied successfully.');
      process.exit(0);
    }
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes('--migrate')) runMigrations();
}

module.exports = db;
