// api.js — thin wrapper around fetch() for talking to the Express backend.
// Every function returns the parsed JSON body. On a non-2xx response it
// throws an Error whose message is the backend's `error` field, so callers
// can just try/catch and show err.message to the farmer.

const Api = (() => {
  function authHeader() {
    const token = localStorage.getItem('ks_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function request(method, path, body) {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: body !== undefined ? JSON.stringify(body) : undefined
    });
    let data;
    try { data = await res.json(); } catch (e) { data = { ok: false, error: 'Unexpected server response.' }; }
    if (!res.ok || data.ok === false) {
      throw new Error(data.error || `Request failed (${res.status})`);
    }
    return data;
  }

  return {
    // auth
    register: (payload) => request('POST', '/auth/register', payload),
    requestOtp: (mobile) => request('POST', '/auth/otp/request', { mobile }),
    verifyOtp: (mobile, otp) => request('POST', '/auth/otp/verify', { mobile, otp }),
    me: () => request('GET', '/auth/me'),

    // crops
    listCrops: () => request('GET', '/crops'),
    addCrop: (payload) => request('POST', '/crops', payload),
    deleteCrop: (id) => request('DELETE', `/crops/${id}`),

    // centres
    listCentres: () => request('GET', '/centres'),
    recommendCentres: (crop) => request('GET', `/centres/recommend?crop=${encodeURIComponent(crop)}`),

    // requests
    listRequests: () => request('GET', '/requests'),
    createRequest: (payload) => request('POST', '/requests', payload),
    trackRequest: (token) => request('GET', `/requests/${encodeURIComponent(token)}/track`),
    advanceRequest: (token) => request('POST', `/requests/${encodeURIComponent(token)}/advance`),
    suggestSlot: (centreId, date) => request('GET', `/requests/slots?centreId=${encodeURIComponent(centreId)}&date=${encodeURIComponent(date)}`)
  };
})();
