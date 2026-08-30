// history.js — "History" view: completed procurement (final stage reached).

function renderHistory() {
  const body = document.getElementById('historyTableBody');
  const lastStage = State.stages.length ? State.stages.length - 1 : 4;
  const completed = State.requests.filter((r) => r.stage === lastStage);

  if (!completed.length) {
    body.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--husk-cream-dim);">No completed procurement yet.</td></tr>';
    return;
  }
  body.innerHTML = completed.map((r) => {
    const rate = CROP_PRICE[r.crop] || 0;
    const value = (rate * Number(r.qty)).toLocaleString('en-IN');
    return `
      <tr>
        <td>${escapeHtml(r.token)}</td>
        <td>${escapeHtml(r.crop)}</td>
        <td>${r.qty} q</td>
        <td>${escapeHtml(r.centre)}</td>
        <td>₹${value}</td>
        <td><span class="status-normal">Paid</span></td>
      </tr>`;
  }).join('');
}
