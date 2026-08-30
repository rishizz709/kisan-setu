const { readDb, writeDb } = require('../data/db');
const { requestOtp, verifyOtp } = require('../utils/otpStore');
const { newFarmerId } = require('../utils/tokenGen');
const { signToken } = require('../middleware/auth');

const MOBILE_RE = /^[6-9]\d{9}$/; // Indian 10-digit mobile, starts 6-9

function findFarmerByMobile(db, mobile) {
  return db.farmers.find((f) => f.mobile === mobile);
}

/** POST /api/auth/register  { name, mobile, village, district, lang } */
function register(req, res) {
  const { name, mobile, village, district, lang } = req.body || {};
  if (!name || !mobile || !village || !district) {
    return res.status(400).json({ ok: false, error: 'name, mobile, village and district are required.' });
  }
  if (!MOBILE_RE.test(mobile)) {
    return res.status(400).json({ ok: false, error: 'Enter a valid 10-digit Indian mobile number.' });
  }
  const db = readDb();
  if (findFarmerByMobile(db, mobile)) {
    return res.status(409).json({ ok: false, error: 'This mobile number is already registered. Please log in instead.' });
  }
  const farmer = {
    id: newFarmerId(),
    name: String(name).trim(),
    mobile,
    village: String(village).trim(),
    district: String(district).trim(),
    lang: lang || 'English',
    createdAt: new Date().toISOString()
  };
  db.farmers.push(farmer);
  writeDb(db);

  const otpResult = requestOtp(mobile);
  return res.status(201).json({ ok: true, message: 'Registered. OTP sent to verify your number.', ...otpResult });
}

/** POST /api/auth/otp/request { mobile } — used for both registration resend and login */
function requestOtpHandler(req, res) {
  const { mobile } = req.body || {};
  if (!mobile || !MOBILE_RE.test(mobile)) {
    return res.status(400).json({ ok: false, error: 'Enter a valid 10-digit Indian mobile number.' });
  }
  const db = readDb();
  const farmer = findFarmerByMobile(db, mobile);
  if (!farmer) {
    return res.status(404).json({ ok: false, error: 'No account found for this number. Please register first.' });
  }
  const result = requestOtp(mobile);
  if (!result.ok) return res.status(429).json(result);
  return res.json({ ok: true, message: 'OTP sent.', ...result });
}

/** POST /api/auth/otp/verify { mobile, otp } — logs the farmer in, returns JWT */
function verifyOtpHandler(req, res) {
  const { mobile, otp } = req.body || {};
  if (!mobile || !otp) {
    return res.status(400).json({ ok: false, error: 'mobile and otp are required.' });
  }
  const result = verifyOtp(mobile, otp);
  if (!result.ok) return res.status(400).json(result);

  const db = readDb();
  const farmer = findFarmerByMobile(db, mobile);
  if (!farmer) {
    return res.status(404).json({ ok: false, error: 'No account found for this number. Please register first.' });
  }
  const token = signToken(farmer);
  return res.json({ ok: true, token, farmer });
}

/** GET /api/auth/me — requires auth */
function me(req, res) {
  const db = readDb();
  const farmer = db.farmers.find((f) => f.id === req.farmerId);
  if (!farmer) return res.status(404).json({ ok: false, error: 'Farmer not found.' });
  return res.json({ ok: true, farmer });
}

module.exports = { register, requestOtpHandler, verifyOtpHandler, me };
