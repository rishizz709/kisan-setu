// map.js — "Centre map" view: Leaflet map of procurement centres, colored by load.

const STATUS_COLOR = { normal: '#7ea15a', moderate: '#e2b23e', overloaded: '#c15a34' };

async function initMap() {
  const container = document.getElementById('centreMap');
  if (!State.centres.length) {
    try {
      const res = await Api.listCentres();
      State.centres = res.centres;
    } catch (err) {
      container.innerHTML = `<div class="empty-state">${escapeHtml(err.message)}</div>`;
      return;
    }
  }

  if (!window.__map) {
    window.__map = L.map('centreMap', { scrollWheelZoom: false }).setView([16.95, 81.9], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(window.__map);
    window.__mapMarkers = [];
  }

  window.__mapMarkers.forEach((m) => window.__map.removeLayer(m));
  window.__mapMarkers = State.centres.map((c) => {
    const marker = L.circleMarker([c.lat, c.lng], {
      radius: 10,
      color: STATUS_COLOR[c.status] || STATUS_COLOR.normal,
      fillColor: STATUS_COLOR[c.status] || STATUS_COLOR.normal,
      fillOpacity: 0.75,
      weight: 2
    }).addTo(window.__map);

    marker.bindPopup(`
      <div class="popup-title">${escapeHtml(c.name)}</div>
      <div class="popup-row"><span>Accepts</span><b>${c.crops.map(escapeHtml).join(', ')}</b></div>
      <div class="popup-row"><span>Load</span><b>${c.booked}/${c.capacity}</b></div>
      <div class="popup-row"><span>Queue</span><b>${c.queue}</b></div>
      <div class="popup-row"><span>Distance</span><b>${c.distanceKm} km</b></div>
      <div class="popup-row"><span>Status</span><b class="status-${c.status}">${c.status}</b></div>
    `);
    return marker;
  });
}
