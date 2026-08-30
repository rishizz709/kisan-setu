// status.js — "Track status" view: shows a request's stage-by-stage progress.

function renderStatusSelect() {
  const select = document.getElementById('statusSelect');
  if (!State.requests.length) {
    select.innerHTML = '<option value="">No requests yet</option>';
    select.disabled = true;
    renderStatus();
    return;
  }
  select.disabled = false;
  select.innerHTML = State.requests.map((r) => `<option value="${r.token}">${escapeHtml(r.token)} — ${escapeHtml(r.crop)}</option>`).join('');
  renderStatus();
}

function renderStatus() {
  const card = document.getElementById('statusCard');
  const select = document.getElementById('statusSelect');
  const request = State.requests.find((r) => r.token === select.value);

  if (!request) {
    card.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
        No request selected yet. Submit a procurement request first.
      </div>`;
    return;
  }

  const stages = State.stages.length ? State.stages : [
    { name: 'Token generated' }, { name: 'Slot confirmed' }, { name: 'Quality & weighing' },
    { name: 'Procurement completed' }, { name: 'Payment released' }
  ];
  const lastStage = stages.length - 1;
  const rate = CROP_PRICE[request.crop] || 0;
  const estValue = (rate * Number(request.qty)).toLocaleString('en-IN');

  const stepsHtml = stages.map((s, idx) => {
    const state = idx < request.stage ? 'done' : idx === request.stage ? 'current' : 'pending';
    return `
      <div class="stage-step stage-${state}">
        <div class="stage-dot">${idx < request.stage ? '✓' : idx + 1}</div>
        <div class="stage-text">
          <b>${escapeHtml(s.name)}</b>
          <span>${escapeHtml(s.desc || '')}</span>
        </div>
      </div>`;
  }).join('');

  card.innerHTML = `
    <dl class="status-meta">
      <dt>Token</dt><dd>${escapeHtml(request.token)}</dd>
      <dt>Crop</dt><dd>${escapeHtml(request.crop)} · ${request.qty} q</dd>
      <dt>Centre</dt><dd>${escapeHtml(request.centre)}</dd>
      <dt>Slot</dt><dd>${formatDate(request.date)}, ${escapeHtml(request.slot)}</dd>
      <dt>Estimated value</dt><dd>₹${estValue}</dd>
    </dl>
    <div class="stage-track">${stepsHtml}</div>
    ${request.stage < lastStage
      ? `<button class="btn btn-ghost btn-sm" onclick="advanceStatus('${request.token}')">Simulate next stage (demo)</button>`
      : '<div class="hint" style="margin-top:12px;">Payment released — procurement complete.</div>'}
  `;
}

async function advanceStatus(token) {
  try {
    const res = await Api.advanceRequest(token);
    const idx = State.requests.findIndex((r) => r.token === token);
    if (idx !== -1) State.requests[idx] = res.request;
    renderStatus();
    renderDashboard();
  } catch (err) {
    alert(err.message);
  }
}
