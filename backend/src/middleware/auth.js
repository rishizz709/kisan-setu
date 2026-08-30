const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kisan-setu-super-secret-change-me';

function signToken(farmer) {
  return jwt.sign({ id: farmer.id, mobile: farmer.mobile }, JWT_SECRET, { expiresIn: '7d' });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Not authenticated. Please log in.' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.farmerId = payload.id;
    req.farmerMobile = payload.mobile;
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, error: 'Session expired. Please log in again.' });
  }
}

module.exports = { signToken, requireAuth, JWT_SECRET };
