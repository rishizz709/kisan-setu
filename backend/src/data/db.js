/**
 * db.js — a tiny dependency-free "database" backed by a JSON file on disk.
 *
 * This is intentionally simple for a hackathon/demo build: everything lives
 * in one JSON file and is read/written synchronously. Swap this module out
 * for a real database (MongoDB, Postgres, etc.) later without touching the
 * controllers, as long as the same function signatures are kept.
 */
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, 'db.json');

const DEFAULT_DB = {
  farmers: [],   // { id, name, mobile, village, district, lang, passwordHash|null, createdAt }
  crops: [],     // { id, farmerId, type, variety, land, qty, harvest, createdAt }
  requests: [],  // { id, token, farmerId, cropId, crop, qty, centreId, centre, date, slot, stage, stageHistory, createdAt }
  seq: { crop: 1, request: 1 }
};

function ensureFile() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
  }
}

function readDb() {
  ensureFile();
  const raw = fs.readFileSync(DB_FILE, 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    // Corrupt file safety net — never crash the server over a bad write.
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function nextSeq(db, key) {
  db.seq[key] = (db.seq[key] || 1) + 1;
  return db.seq[key] - 1;
}

function resetDb() {
  writeDb(JSON.parse(JSON.stringify(DEFAULT_DB)));
}

module.exports = { readDb, writeDb, nextSeq, resetDb, DB_FILE };
