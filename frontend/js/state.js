// state.js — small shared in-memory store for the logged-in session.
// Populated after login/register and refreshed as the farmer uses the app.

const State = {
  farmer: null,     // { id, name, mobile, village, district, lang }
  crops: [],        // this farmer's crop/land entries
  requests: [],      // this farmer's procurement requests
  stages: [],        // stage name/desc list, fetched alongside requests
  centres: [],        // all procurement centres (cached)

  reset() {
    this.farmer = null;
    this.crops = [];
    this.requests = [];
    this.stages = [];
  },

  isLoggedIn() {
    return !!localStorage.getItem('ks_token') && !!this.farmer;
  }
};

const CROP_PRICE = { Paddy: 2183, Wheat: 2275, Maize: 2090, Cotton: 7121, Groundnut: 6377 };

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}
