// main.js — view router (setView) and app boot.

function setView(view) {
  document.querySelectorAll('.app-nav button').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
  document.getElementById('view-' + view).classList.add('active');

  if (view === 'dashboard') renderDashboard();
  if (view === 'crops') renderCropsTable();
  if (view === 'request') renderRequestCropOptions();
  if (view === 'status') renderStatusSelect();
  if (view === 'history') renderHistory();
  if (view === 'map') {
    initMap();
    setTimeout(() => { if (window.__map) window.__map.invalidateSize(); }, 80);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initHero3d();
  tryResumeSession();
});
