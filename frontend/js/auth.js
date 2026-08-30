// auth.js — screen/tab switching plus the real login & registration flows.

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  window.scrollTo(0, 0);
}

function openAuth(tab) {
  showScreen('screen-auth');
  setAuthTab(tab);
}

function setAuthTab(tab) {
  document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
  document.getElementById('tabRegister').classList.toggle('active', tab === 'register');
  document.getElementById('panelLogin').classList.toggle('hidden', tab !== 'login');
  document.getElementById('panelRegister').classList.toggle('hidden', tab !== 'register');
}

function showAuthError(id, message) {
  const el = document.getElementById(id);
  el.textContent = message;
  el.classList.remove('hidden');
}
function hideAuthError(id) {
  document.getElementById(id).classList.add('hidden');
}

function validMobile(m) {
  return /^[6-9]\d{9}$/.test(m);
}

/* -------------------- LOGIN -------------------- */
// login step 1: send OTP. step 2 (otpField visible): verify OTP & log in.
let loginOtpSent = false;
let loginMobileNumber = '';

async function handleLoginStep() {
  hideAuthError('loginError');
  const otpField = document.getElementById('otpField');
  const btn = document.getElementById('loginBtn');

  if (!loginOtpSent) {
    const mobile = document.getElementById('loginMobile').value.trim();
    if (!validMobile(mobile)) {
      showAuthError('loginError', 'Enter a valid 10-digit mobile number.');
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
      const result = await Api.requestOtp(mobile);
      loginOtpSent = true;
      loginMobileNumber = mobile;
      otpField.classList.remove('hidden');
      document.getElementById('resendOtpLink').classList.remove('hidden');
      document.getElementById('otpHint').textContent = result.devOtp
        ? `Dev mode — your OTP is ${result.devOtp} (also logged on the server console).`
        : 'Sent to your number. Valid for 5 minutes.';
      btn.textContent = 'Verify & log in';
    } catch (err) {
      showAuthError('loginError', err.message);
      btn.textContent = 'Send OTP';
    } finally {
      btn.disabled = false;
    }
    return;
  }

  const otp = document.getElementById('loginOtp').value.trim();
  if (otp.length !== 4) {
    showAuthError('loginError', 'Enter the 4-digit OTP.');
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Verifying…';
  try {
    const result = await Api.verifyOtp(loginMobileNumber, otp);
    localStorage.setItem('ks_token', result.token);
    State.farmer = result.farmer;
    await loadFarmerData();
    resetLoginForm();
    enterApp();
  } catch (err) {
    showAuthError('loginError', err.message);
    btn.textContent = 'Verify & log in';
  } finally {
    btn.disabled = false;
  }
}

async function handleResendOtp() {
  hideAuthError('loginError');
  try {
    const result = await Api.requestOtp(loginMobileNumber);
    document.getElementById('otpHint').textContent = result.devOtp
      ? `Dev mode — your OTP is ${result.devOtp} (also logged on the server console).`
      : 'A new OTP has been sent.';
  } catch (err) {
    showAuthError('loginError', err.message);
  }
}

function resetLoginForm() {
  loginOtpSent = false;
  loginMobileNumber = '';
  document.getElementById('loginMobile').value = '';
  document.getElementById('loginOtp').value = '';
  document.getElementById('otpField').classList.add('hidden');
  document.getElementById('resendOtpLink').classList.add('hidden');
  document.getElementById('loginBtn').textContent = 'Send OTP';
  hideAuthError('loginError');
}

/* -------------------- REGISTER -------------------- */
let registerOtpSent = false;
let registerMobileNumber = '';

async function handleRegisterStep() {
  hideAuthError('regError');
  const btn = document.getElementById('regBtn');

  if (!registerOtpSent) {
    const name = document.getElementById('regName').value.trim();
    const mobile = document.getElementById('regMobile').value.trim();
    const village = document.getElementById('regVillage').value.trim();
    const district = document.getElementById('regDistrict').value.trim();
    const lang = document.getElementById('regLang').value;
    if (!name || !validMobile(mobile) || !village || !district) {
      showAuthError('regError', 'Please fill in your name, a valid 10-digit mobile number, village and district.');
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Creating…';
    try {
      const result = await Api.register({ name, mobile, village, district, lang });
      registerOtpSent = true;
      registerMobileNumber = mobile;
      document.getElementById('regOtpField').classList.remove('hidden');
      document.getElementById('regOtpHint').textContent = result.devOtp
        ? `Dev mode — your OTP is ${result.devOtp} (also logged on the server console).`
        : 'Sent to your number. Valid for 5 minutes.';
      btn.textContent = 'Verify & create account';
    } catch (err) {
      showAuthError('regError', err.message);
      btn.textContent = 'Create account';
    } finally {
      btn.disabled = false;
    }
    return;
  }

  const otp = document.getElementById('regOtp').value.trim();
  if (otp.length !== 4) {
    showAuthError('regError', 'Enter the 4-digit OTP.');
    return;
  }
  btn.disabled = true;
  btn.textContent = 'Verifying…';
  try {
    const result = await Api.verifyOtp(registerMobileNumber, otp);
    localStorage.setItem('ks_token', result.token);
    State.farmer = result.farmer;
    State.crops = [];
    State.requests = [];
    resetRegisterForm();
    enterApp();
  } catch (err) {
    showAuthError('regError', err.message);
    btn.textContent = 'Verify & create account';
  } finally {
    btn.disabled = false;
  }
}

function resetRegisterForm() {
  registerOtpSent = false;
  registerMobileNumber = '';
  ['regName', 'regMobile', 'regVillage', 'regDistrict', 'regOtp'].forEach((id) => {
    document.getElementById(id).value = '';
  });
  document.getElementById('regOtpField').classList.add('hidden');
  document.getElementById('regBtn').textContent = 'Create account';
  hideAuthError('regError');
}

/* -------------------- SESSION -------------------- */
async function loadFarmerData() {
  const [cropsRes, reqRes] = await Promise.all([Api.listCrops(), Api.listRequests()]);
  State.crops = cropsRes.crops;
  State.requests = reqRes.requests;
  State.stages = reqRes.stages;
}

function enterApp() {
  document.getElementById('sidebarName').textContent = State.farmer.name;
  document.getElementById('sidebarVillage').textContent = `${State.farmer.village}, ${State.farmer.district}`;
  showScreen('screen-app');
  setView('dashboard');
}

function logout() {
  localStorage.removeItem('ks_token');
  State.reset();
  resetLoginForm();
  resetRegisterForm();
  showScreen('screen-landing');
}

/** Try to resume a session on page load if a token is already stored. */
async function tryResumeSession() {
  const token = localStorage.getItem('ks_token');
  if (!token) return;
  try {
    const meRes = await Api.me();
    State.farmer = meRes.farmer;
    await loadFarmerData();
    enterApp();
  } catch (e) {
    localStorage.removeItem('ks_token');
  }
}
