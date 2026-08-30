const { readDb, writeDb } = require('../data/db');
const { newCropId } = require('../utils/tokenGen');
const cropRates = require('../data/cropRates.json');

/** GET /api/crops — this farmer's crops */
function list(req, res) {
  const db = readDb();
  const crops = db.crops.filter((c) => c.farmerId === req.farmerId);
  res.json({ ok: true, crops });
}

/** POST /api/crops { type, variety, land, qty, harvest } */
function create(req, res) {
  const { type, variety, land, qty, harvest } = req.body || {};
  if (!type || !cropRates[type]) {
    return res.status(400).json({ ok: false, error: 'A valid crop type is required.' });
  }
  const landNum = Number(land);
  const qtyNum = Number(qty);
  if (!landNum || landNum <= 0) {
    return res.status(400).json({ ok: false, error: 'Land area (acres) must be a positive number.' });
  }
  if (!qtyNum || qtyNum <= 0) {
    return res.status(400).json({ ok: false, error: 'Expected quantity (quintals) must be a positive number.' });
  }
  const db = readDb();
  const crop = {
    id: newCropId(),
    farmerId: req.farmerId,
    type,
    variety: variety ? String(variety).trim() : '',
    land: landNum,
    qty: qtyNum,
    harvest: harvest || null,
    createdAt: new Date().toISOString()
  };
  db.crops.push(crop);
  writeDb(db);
  res.status(201).json({ ok: true, crop });
}

/** DELETE /api/crops/:id */
function remove(req, res) {
  const db = readDb();
  const idNum = Number(req.params.id);
  const idx = db.crops.findIndex((c) => c.id === idNum && c.farmerId === req.farmerId);
  if (idx === -1) return res.status(404).json({ ok: false, error: 'Crop not found.' });
  db.crops.splice(idx, 1);
  writeDb(db);
  res.json({ ok: true });
}

module.exports = { list, create, remove };
