/**
 * otpStore.js — real server-side OTP generation + verification.
 *
 * WHY THIS FILE EXISTS:
 * The original demo compared whatever the user typed against a hardcoded
 * '1234' string in the browser's JavaScript, with no server involved at all.
 * Any 10-digit number + "1234" logged you in as a fake demo farmer, and
 * nothing was ever actually sent anywhere — which is why "OTP not coming"
 * was expected behaviour, not a bug in a network call.
 *
 * This module generates a real random 4-digit OTP per mobile number, stores
 * it in memory with a short expiry, rate-limits resend spam a little, and
 * verifies it server-side. There's no paid SMS budget for a hackathon demo,
 * so DEV_MODE returns the OTP in the API response and logs it to the server
 * console — the judge/reviewer can see it working end-to-end without an SMS
 * gateway. Flip DEV_MODE off and plug a real provider into `sendOtp()` below
 * (Twilio, MSG91, Fast2SMS, etc.) when you have one.
 */

const DEV_MODE = String(process.env.DEV_MODE || 'true').toLowerCase() !== 'false';
const OTP_EXPIRY_MS = (Number(process.env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

// mobile -> { otp, expiresAt, attempts, lastSentAt }
const store = new Map();

function generateOtp() {
  return String(Math.floor(1000 + Math.random() * 9000)); // 4-digit, 1000-9999
}

function requestOtp(mobile) {
  const existing = store.get(mobile);
  const now = Date.now();

  if (existing && now - existing.lastSentAt < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - existing.lastSentAt)) / 1000);
    return { ok: false, error: `Please wait ${waitSec}s before requesting another OTP.` };
  }

  const otp = generateOtp();
  store.set(mobile, { otp, expiresAt: now + OTP_EXPIRY_MS, attempts: 0, lastSentAt: now });

  // --- real SMS gateway hook point ---
  // await smsProvider.send(mobile, `Your Kisan Setu OTP is ${otp}. Valid for 5 minutes.`);
  if (DEV_MODE) {
    console.log(`[DEV OTP] mobile=${mobile} otp=${otp} (expires in ${OTP_EXPIRY_MS / 1000}s)`);
  }

  return {
    ok: true,
    expiresInSeconds: OTP_EXPIRY_MS / 1000,
    // Only ever exposed in DEV_MODE. Never send this field in production.
    devOtp: DEV_MODE ? otp : undefined
  };
}

function verifyOtp(mobile, otp) {
  const entry = store.get(mobile);
  if (!entry) return { ok: false, error: 'No OTP was requested for this number. Please request one first.' };
  if (Date.now() > entry.expiresAt) {
    store.delete(mobile);
    return { ok: false, error: 'OTP expired. Please request a new one.' };
  }
  entry.attempts += 1;
  if (entry.attempts > 5) {
    store.delete(mobile);
    return { ok: false, error: 'Too many incorrect attempts. Please request a new OTP.' };
  }
  if (entry.otp !== String(otp).trim()) {
    return { ok: false, error: 'Incorrect OTP.' };
  }
  store.delete(mobile); // one-time use
  return { ok: true };
}

module.exports = { requestOtp, verifyOtp, DEV_MODE };
