// dashboard.js — renders the dashboard view from State.

function renderDashboard() {
  document.getElementById('dashGreeting').textContent = `Welcome, ${State.farmer.name.split(' ')[0]}`;

  const requests = State.requests;
  const lastStage = State.stages.length ? State.stages.length - 1 : 4;
  const active = requests.filter((r) => r.stage < lastStage).length;
  const completed = requests.filter((r) => r.stage === lastStage).length;
  const procured = requests.filter((r) => r.stage === lastStage).reduce((s, r) => s + Number(r.qty), 0);

  document.getElementById('statActive').textContent = active;
  document.getElementById('statCompleted').textContent = completed;
  document.getElementById('statCrops').textContent = State.crops.length;
  document.getElementById('statProcured').textContent = procured.toFixed(1) + ' q';

  const upcoming = requests.filter((r) => r.stage < lastStage).sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  const box = document.getElementById('upcomingBox');
  if (upcoming) {
    box.innerHTML = `
      <div class="upcoming-card">
        <dl>
          <dt>Crop</dt><dd>${escapeHtml(upcoming.crop)}</dd>
          <dt>Quantity</dt><dd>${upcoming.qty} quintals</dd>
          <dt>Centre</dt><dd>${escapeHtml(upcoming.centre)}</dd>
          <dt>Date</dt><dd>${formatDate(upcoming.date)}</dd>
          <dt>Time</dt><dd>${escapeHtml(upcoming.slot)}</dd>
          <dt>Token</dt><dd>${escapeHtml(upcoming.token)}</dd>
        </dl>
        <button class="btn btn-ghost btn-sm" onclick="goToStatus('${upcoming.token}')">View status</button>
      </div>`;
  } else {
    box.innerHTML = '<div class="empty-state">No upcoming procurement. Submit a request to get a slot.</div>';
  }

  const cropsBox = document.getElementById('dashCropsBox');
  if (State.crops.length) {
    cropsBox.innerHTML = '<ul class="mini-list">' + State.crops.map((c) =>
      `<li><b>${escapeHtml(c.type)}</b><span>${c.qty} q &middot; ${c.land} acres</span></li>`
    ).join('') + '</ul>';
  } else {
    cropsBox.innerHTML = '<div class="empty-state">No crops added yet.</div>';
  }
}

function goToStatus(token) {
  setView('status');
  const select = document.getElementById('statusSelect');
  select.value = token;
  renderStatus();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
