// request.js — "Request procurement" view: pick a crop, get a smart-matched
// centre, and generate a digital token + slot for it.

function renderRequestCropOptions() {
  const select = document.getElementById('reqCrop');
  const recommendBox = document.getElementById('recommendBox');
  const slotBox = document.getElementById('slotBox');
  const tokenBox = document.getElementById('tokenBox');
  recommendBox.innerHTML = '';
  slotBox.innerHTML = '';
  tokenBox.innerHTML = '';

  if (!State.crops.length) {
    select.innerHTML = '<option value="">No crops added yet</option>';
    select.disabled = true;
    recommendBox.innerHTML = '<div class="empty-state">Add a crop under "My crops" before requesting procurement.</div>';
    return;
  }
  select.disabled = false;
  select.innerHTML = State.crops.map((c) =>
    `<option value="${c.id}">${escapeHtml(c.type)} — ${c.qty} q${c.variety ? ' (' + escapeHtml(c.variety) + ')' : ''}</option>`
  ).join('');
  onReqCropChange();

  const dateField = document.getElementById('reqDate');
  if (!dateField.value) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateField.value = tomorrow.toISOString().slice(0, 10);
  }
}

function onReqCropChange() {
  const select = document.getElementById('reqCrop');
  const crop = State.crops.find((c) => c.id === Number(select.value));
  const qtyField = document.getElementById('reqQty');
  qtyField.value = crop ? crop.qty : '';
  qtyField.readOnly = true;
  qtyField.title = 'Set from your registered crop quantity. Edit it under "My crops".';
}

async function findCentres() {
  const select = document.getElementById('reqCrop');
  const crop = State.crops.find((c) => c.id === Number(select.value));
  const date = document.getElementById('reqDate').value;
  const recommendBox = document.getElementById('recommendBox');
  const slotBox = document.getElementById('slotBox');
  const tokenBox = document.getElementById('tokenBox');
  slotBox.innerHTML = '';
  tokenBox.innerHTML = '';

  if (!crop) { alert('Add a crop first.'); return; }
  if (!date) { alert('Choose a preferred date.'); return; }

  recommendBox.innerHTML = '<div class="empty-state">Finding the best centre…</div>';
  try {
    const res = await Api.recommendCentres(crop.type);
    if (!res.recommendations.length) {
      recommendBox.innerHTML = `<div class="empty-state">No procurement centre currently accepts ${escapeHtml(crop.type)}.</div>`;
      return;
    }
    recommendBox.innerHTML = '<div class="section-title-sm" style="margin-top:24px;">Recommended centres</div>' +
      '<div class="centre-list">' + res.recommendations.map((c, idx) => `
        <div class="centre-card ${idx === 0 ? 'best' : ''}">
          ${idx === 0 ? '<span class="badge-best">Best match</span>' : ''}
          <div class="centre-name">${escapeHtml(c.name)}</div>
          <div class="centre-meta">
            <span>${c.distanceKm} km away</span>
            <span class="status-${c.status}">${c.status}</span>
            <span>${c.queue} in queue</span>
          </div>
          <button class="btn btn-primary btn-sm" onclick="chooseCentre('${c.id}', ${crop.id}, '${date}')">Choose this centre</button>
        </div>`).join('') + '</div>';
  } catch (err) {
    recommendBox.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}

async function chooseCentre(centreId, cropId, date) {
  const tokenBox = document.getElementById('tokenBox');
  tokenBox.innerHTML = '<div class="empty-state">Generating your token…</div>';
  try {
    const res = await Api.createRequest({ cropId, centreId, date });
    State.requests.unshift(res.request);
    State.stages = res.stages;
    tokenBox.innerHTML = `
      <div class="token-card">
        <div class="section-title-sm">Your digital token</div>
        <div class="token-code">${escapeHtml(res.request.token)}</div>
        <dl>
          <dt>Centre</dt><dd>${escapeHtml(res.request.centre)}</dd>
          <dt>Date</dt><dd>${formatDate(res.request.date)}</dd>
          <dt>Time slot</dt><dd>${escapeHtml(res.request.slot)}</dd>
          <dt>Queue position</dt><dd>#${res.request.queuePosition}</dd>
        </dl>
        <button class="btn btn-primary btn-sm" onclick="goToStatus('${res.request.token}')">Track this request</button>
      </div>`;
    document.getElementById('recommendBox').innerHTML = '';
    document.getElementById('slotBox').innerHTML = '';
  } catch (err) {
    tokenBox.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
  }
}
