const centres = require('../data/centres.json');

function statusFor(centre) {
  const load = centre.booked / centre.capacity;
  if (load >= 0.9) return 'overloaded';
  if (load >= 0.6) return 'moderate';
  return 'normal';
}

function withStatus(centre) {
  return { ...centre, status: statusFor(centre) };
}

/** GET /api/centres — all centres, with computed status */
function list(req, res) {
  res.json({ ok: true, centres: centres.map(withStatus) });
}

/**
 * GET /api/centres/recommend?crop=Paddy
 * Ranks centres that accept this crop using a simple weighted score:
 * lower distance, lower load and shorter queue score better. This is the
 * "intelligent scheduling" piece — it steers farmers away from overcrowded
 * centres toward nearby ones with spare capacity.
 */
function recommend(req, res) {
  const crop = req.query.crop;
  if (!crop) return res.status(400).json({ ok: false, error: 'crop query param is required.' });

  const eligible = centres.filter((c) => c.crops.includes(crop));
  if (eligible.length === 0) {
    return res.json({ ok: true, crop, recommendations: [] });
  }

  const maxDistance = Math.max(...eligible.map((c) => c.distanceKm));
  const scored = eligible.map((c) => {
    const load = c.booked / c.capacity; // 0..1, lower is better
    const distanceNorm = maxDistance ? c.distanceKm / maxDistance : 0; // 0..1, lower is better
    const queueNorm = Math.min(c.queue / 40, 1); // cap at 40-deep queue, lower is better
    // Weighted score: load matters most (avoid overcrowding), then distance, then queue.
    const score = load * 0.45 + distanceNorm * 0.35 + queueNorm * 0.20;
    return { ...withStatus(c), score: Number(score.toFixed(3)) };
  });

  scored.sort((a, b) => a.score - b.score);
  res.json({ ok: true, crop, recommendations: scored });
}

module.exports = { list, recommend };
