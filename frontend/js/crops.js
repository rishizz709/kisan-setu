// crops.js — "My crops" view: add land/crop details, list them, delete them.

function renderCropsTable() {
  const body = document.getElementById('cropsTableBody');
  if (!State.crops.length) {
    body.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--husk-cream-dim);">No crops added yet.</td></tr>';
    return;
  }
  body.innerHTML = State.crops.map((c) => `
    <tr>
      <td>${escapeHtml(c.type)}</td>
      <td>${escapeHtml(c.variety || '—')}</td>
      <td>${c.land} acres</td>
      <td>${c.qty} q</td>
      <td>${formatDate(c.harvest)}</td>
      <td><button class="btn btn-danger btn-sm" onclick="deleteCrop(${c.id})">Remove</button></td>
    </tr>`).join('');
}

async function addCrop() {
  const type = document.getElementById('cropType').value;
  const variety = document.getElementById('cropVariety').value.trim();
  const land = parseFloat(document.getElementById('cropLand').value);
  const qty = parseFloat(document.getElementById('cropQty').value);
  const harvest = document.getElementById('cropHarvest').value;

  if (!land || land <= 0 || !qty || qty <= 0) {
    alert('Enter a valid land area and expected quantity.');
    return;
  }
  try {
    const res = await Api.addCrop({ type, variety, land, qty, harvest: harvest || null });
    State.crops.push(res.crop);
    document.getElementById('cropVariety').value = '';
    document.getElementById('cropLand').value = '';
    document.getElementById('cropQty').value = '';
    document.getElementById('cropHarvest').value = '';
    renderCropsTable();
    renderDashboard();
  } catch (err) {
    alert(err.message);
  }
}

async function deleteCrop(id) {
  if (!confirm('Remove this crop entry?')) return;
  try {
    await Api.deleteCrop(id);
    State.crops = State.crops.filter((c) => c.id !== id);
    renderCropsTable();
    renderDashboard();
  } catch (err) {
    alert(err.message);
  }
}
