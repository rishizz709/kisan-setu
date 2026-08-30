const { readDb, writeDb, nextSeq } = require('../data/db');
const cropRates = require('../data/cropRates.json');

/** Generates a human-readable procurement token, e.g. AP-PDY-88213 */
function generateProcurementToken(cropType) {
  const code = (cropRates[cropType] && cropRates[cropType].code) || cropType.slice(0, 3).toUpperCase();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `AP-${code}-${rand}`;
}

function newCropId() {
  const db = readDb();
  const id = nextSeq(db, 'crop');
  writeDb(db);
  return id;
}

function newRequestId() {
  const db = readDb();
  const id = nextSeq(db, 'request');
  writeDb(db);
  return id;
}

function newFarmerId() {
  return 'f_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

module.exports = { generateProcurementToken, newCropId, newRequestId, newFarmerId };
