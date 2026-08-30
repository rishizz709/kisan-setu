# Kisan Setu — Farmer Procurement Schedule & Status System

A smart digital platform that helps farmers schedule crop procurement at
nearby procurement centres and track the complete process in real time —
slots, queues, quality checks, weighing, and payment status — using
capacity-aware scheduling to reduce waiting time and prevent centre
overcrowding.

**How it works:** Farmer registers → enters crop and land details → the
system recommends a suitable procurement centre and time slot → the farmer
receives a digital token → the centre officer verifies and processes the
crop → the farmer tracks every stage until payment completion.

Built for a Smart India Hackathon–style Agri-Tech submission.

## Project structure

```
kisan-setu/
├── backend/                 Express REST API + JSON-file "database"
│   ├── server.js            Entry point
│   └── src/
│       ├── app.js           Express app assembly
│       ├── routes/          /api/auth, /api/crops, /api/centres, /api/requests
│       ├── controllers/     Route handlers / business logic
│       ├── middleware/      JWT auth, error handling
│       ├── utils/           OTP store, token/id generators
│       └── data/            centres.json, cropRates.json, db.js (JSON store)
└── frontend/                 Static multi-file frontend (no build step)
    ├── index.html
    ├── css/                  base.css, auth.css, app.css, extras.css
    └── js/                   config.js, api.js, state.js, hero3d.js,
                               auth.js, dashboard.js, crops.js, request.js,
                               status.js, history.js, map.js, main.js
```

## Running it

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

The API runs on `http://localhost:4000` by default (change `PORT` in `.env`
if needed). On first run it creates `src/data/db.json` automatically.

### 2. Frontend

The frontend is plain HTML/CSS/JS — no build step. Serve it with any static
file server (opening `index.html` directly via `file://` will hit CORS
issues with `fetch`, so use a server):

```bash
cd frontend
npx serve .
# or: python3 -m http.server 8080
```

Then open the printed URL in your browser. If your backend runs somewhere
other than `http://localhost:4000`, update `API_BASE` in
`frontend/js/config.js`.

## The OTP flow (and the bug it fixes)

The original prototype compared whatever you typed against a hardcoded
`'1234'` in the browser's JavaScript — no server involved at all, and
nothing was ever actually generated or sent. That's why "OTP not coming"
was expected: there was no OTP to receive.

This build generates a real random 4-digit OTP per mobile number
server-side (`backend/src/utils/otpStore.js`), stores it with a 5-minute
expiry, rate-limits resends, and verifies it on the server. Since a real
SMS gateway costs money, it ships in `DEV_MODE` (see `.env.example`): the
OTP is logged to the backend console and also returned in the API response
so the frontend can display it — enough to demo the whole flow end-to-end
without an SMS budget. When you're ready for production, set
`DEV_MODE=false` and wire a real provider (Twilio, MSG91, Fast2SMS, etc.)
into `requestOtp()` in that same file.

## Smart centre recommendation

`GET /api/centres/recommend?crop=Paddy` scores every centre that accepts
that crop using a weighted formula (`backend/src/controllers/centreController.js`):
current load 45%, distance 35%, queue depth 20% — steering farmers toward
nearby centres with spare capacity instead of piling onto the closest one.

## What's implemented

- **Register / login** with real server-side OTP (JWT session afterward)
- **Crop & land details** — add/remove crop type, variety, land area,
  expected quantity, harvest date
- **Request procurement** — pick a crop, get ranked centre recommendations,
  get a slot and a digital token (`AP-PDY-88213` style)
- **Track status** — five-stage progress tracker (token → slot → quality &
  weighing → procurement completed → payment released), with a demo
  "advance stage" action standing in for the centre-officer side
- **Centre map** — Leaflet map of all centres, colour-coded by load
- **History** — completed procurement with an estimated payout
- **3D wheat field** on the landing page — rebuilt with tapered stems,
  curved leaf blades, and a proper clustered grain ear (golden-angle
  kernel spiral + awns) instead of a single stick-and-cone shape

## Not implemented (roadmap)

- Centre-officer role/login (the "advance stage" button is a stand-in)
- Real SMS gateway integration
- Document upload, quality-assessment photos
- Push/SMS notifications
- A real database in place of the JSON file store
