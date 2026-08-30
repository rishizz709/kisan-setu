const { readDb, writeDb } = require('../data/db');
const { newRequestId, generateProcurementToken } = require('../utils/tokenGen');
const centres = require('../data/centres.json');

const STAGES = [
  { name: 'Token generated', desc: 'Request submitted and logged' },
  { name: 'Slot confirmed', desc: 'Arrival window locked in at the centre' },
  { name: 'Quality & weighing', desc: 'Officer verifies grade and final weight' },
  { name: 'Procurement completed', desc: 'Value calculated against graded weight' },
  { name: 'Payment released', desc: 'Amount credited to linked bank account' }
];

const SLOT_TIMES = ['08:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:30 PM', '03:30 PM'];

/** GET /api/requests/slots?centreId=c1&date=2026-09-01 — naive round-robin slot suggestion */
function suggestSlot(req, res) {
  const { centreId, date } = req.query;
  const centre = centres.find((c) => c.id === centreId);
  if (!centre) return res.status(404).json({ ok: false, error: 'Centre not found.' });
  const db = readDb();
  const takenCount = db.requests.filter((r) => r.centreId === centreId && r.date === date).length;
  const slot = SLOT_TIMES[takenCount % SLOT_TIMES.length];
  res.json({ ok: true, slot, queuePosition: takenCount + 1 });
}

/** GET /api/requests — this farmer's requests, newest first */
function list(req, res) {
  const db = readDb();
  const requests = db.requests
    .filter((r) => r.farmerId === req.farmerId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ ok: true, requests, stages: STAGES });
}

/** POST /api/requests { cropId, centreId, date } */
function create(req, res) {
  const { cropId, centreId, date } = req.body || {};
  const db = readDb();
  const crop = db.crops.find((c) => c.id === Number(cropId) && c.farmerId === req.farmerId);
  if (!crop) return res.status(404).json({ ok: false, error: 'Crop not found. Add it under Crop Details first.' });

  const centre = centres.find((c) => c.id === centreId);
  if (!centre) return res.status(404).json({ ok: false, error: 'Procurement centre not found.' });
  if (!centre.crops.includes(crop.type)) {
    return res.status(400).json({ ok: false, error: `${centre.name} does not accept ${crop.type}.` });
  }
  if (!date) return res.status(400).json({ ok: false, error: 'A preferred date is required.' });

  const takenCount = db.requests.filter((r) => r.centreId === centreId && r.date === date).length;
  const slot = SLOT_TIMES[takenCount % SLOT_TIMES.length];

  const now = new Date().toISOString();
  const request = {
    id: newRequestId(),
    token: generateProcurementToken(crop.type),
    farmerId: req.farmerId,
    cropId: crop.id,
    crop: crop.type,
    qty: crop.qty,
    centreId: centre.id,
    centre: centre.name,
    date,
    slot,
    queuePosition: takenCount + 1,
    stage: 0,
    stageHistory: [{ stage: 0, at: now }],
    createdAt: now
  };
  db.requests.push(request);
  writeDb(db);
  res.status(201).json({ ok: true, request, stages: STAGES });
}

/** GET /api/requests/:token/track — public-ish lookup by token, still scoped to the logged-in farmer */
function track(req, res) {
  const db = readDb();
  const request = db.requests.find((r) => r.token === req.params.token && r.farmerId === req.farmerId);
  if (!request) return res.status(404).json({ ok: false, error: 'No request found with that token.' });
  res.json({ ok: true, request, stages: STAGES });
}

/**
 * POST /api/requests/:token/advance — demo/officer action to move a request
 * to the next stage. In a full deployment this would be behind a separate
 * centre-officer login; exposed here so the tracking screen can be demoed
 * end-to-end without a second role.
 */
function advance(req, res) {
  const db = readDb();
  const request = db.requests.find((r) => r.token === req.params.token && r.farmerId === req.farmerId);
  if (!request) return res.status(404).json({ ok: false, error: 'No request found with that token.' });
  if (request.stage >= STAGES.length - 1) {
    return res.status(400).json({ ok: false, error: 'This request has already completed all stages.' });
  }
  request.stage += 1;
  request.stageHistory.push({ stage: request.stage, at: new Date().toISOString() });
  writeDb(db);
  res.json({ ok: true, request, stages: STAGES });
}

module.exports = { list, create, track, advance, suggestSlot, STAGES };
