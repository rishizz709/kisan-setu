# 🌾 Kisan Setu

### Farmer Procurement Schedule & Status System

> **From harvest to payment — a simpler, smarter and more transparent procurement journey for farmers.**

Kisan Setu is a full-stack Agri-Tech web application designed to help farmers **register, manage crop details, find suitable procurement centres, schedule crop procurement, receive digital tokens, and track procurement progress through payment release**.

The system uses **capacity-aware centre recommendations** to help reduce unnecessary waiting and overcrowding at procurement centres.

---

## 🚀 Live Demo

| Component | URL |
|---|---|
| 🌐 Frontend | `https://YOUR-NETLIFY-SITE.netlify.app` |
| ⚙️ Backend API | `https://YOUR-BACKEND.onrender.com` |
| ❤️ Health Check | `https://YOUR-BACKEND.onrender.com/api/health` |

> Replace the placeholder URLs after deployment.

---

## 🎯 Problem

Farmers can face long queues, uncertain procurement schedules, overcrowded centres, and limited visibility into what happens after they arrive at a procurement centre.

Kisan Setu addresses this by providing a digital workflow where farmers can:

- Register and verify their mobile number
- Add crop and land information
- Discover suitable procurement centres
- Receive recommended procurement slots
- Get a digital procurement token
- Track procurement progress
- View procurement history and estimated payout

---

## 💡 Solution

### Farmer → Recommendation → Scheduling → Token → Processing → Payment

```text
👨‍🌾 Farmer
   │
   ▼
📱 Registration / OTP
   │
   ▼
🌾 Crop & Land Details
   │
   ▼
📍 Centre Recommendation
   │
   ▼
📅 Slot Selection
   │
   ▼
🎫 Digital Token
   │
   ▼
🔍 Quality & Weighing
   │
   ▼
✅ Procurement Completed
   │
   ▼
💰 Payment Released
```

---

## ✨ Key Features

### 👨‍🌾 Farmer Authentication
- Farmer registration
- Mobile-number validation
- Server-side OTP generation
- OTP expiry and resend cooldown
- JWT-based authentication

### 🌾 Crop & Land Management
Farmers can maintain crop information including:

- Crop type
- Variety
- Land area
- Expected quantity
- Harvest date

### 📍 Smart Procurement Centre Recommendation

Kisan Setu ranks eligible procurement centres using a capacity-aware scoring approach based on:

- **Current centre load — 45%**
- **Distance — 35%**
- **Queue depth — 20%**

This helps avoid directing every farmer to the nearest or most crowded centre.

### 📅 Procurement Scheduling
- Recommended centres
- Available slots
- Procurement date
- Digital token generation

Example:

```text
AP-PDY-88213
```

### 📊 Procurement Tracking

The farmer can follow the procurement journey through five stages:

```text
1. Token Generated
       ↓
2. Slot Confirmed
       ↓
3. Quality & Weighing
       ↓
4. Procurement Completed
       ↓
5. Payment Released
```

### 🗺️ Procurement Centre Map
- Leaflet-based interactive map
- Centre locations
- Load-based visual indicators

### 📜 Procurement History
Farmers can review completed procurement requests and estimated payout information.

### 🌾 Interactive Landing Page
The landing page includes a custom 3D wheat-field visual built with JavaScript.

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Farmer         │
                    │   Web Browser       │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Netlify        │
                    │  HTML/CSS/JavaScript│
                    └──────────┬──────────┘
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │       Render        │
                    │  Node.js + Express  │
                    └──────────┬──────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        Authentication    Procurement      Centre Data
           + JWT           Requests       + Crop Rates
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                    ┌─────────────────────┐
                    │ JSON File Data Store│
                    │     db.json         │
                    └─────────────────────┘
```

> **Note:** The current JSON file database is intended for a prototype/demo. A production deployment should use a persistent database such as PostgreSQL, MongoDB, or another managed database.

---

# 🛠️ Technology Stack

## Frontend

- HTML5
- CSS3
- JavaScript
- Leaflet.js
- Browser Local Storage
- Fetch API

## Backend

- Node.js
- Express.js
- REST API
- JWT Authentication
- CORS
- dotenv

## Data

- JSON-based prototype datastore
- Centre master data
- Crop-rate data

## Deployment

- **Netlify** — frontend
- **Render** — backend API
- **GitHub** — source code and version control

---

# 📁 Project Structure

```text
kisan-setu/
│
├── frontend/
│   ├── index.html
│   │
│   ├── css/
│   │   ├── base.css
│   │   ├── app.css
│   │   ├── auth.css
│   │   └── extras.css
│   │
│   └── js/
│       ├── api.js
│       ├── auth.js
│       ├── config.js
│       ├── crops.js
│       ├── dashboard.js
│       ├── hero3d.js
│       ├── history.js
│       ├── main.js
│       ├── map.js
│       ├── request.js
│       ├── state.js
│       └── status.js
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   │
│   └── src/
│       ├── app.js
│       │
│       ├── controllers/
│       │   ├── authController.js
│       │   ├── centreController.js
│       │   ├── cropController.js
│       │   └── requestController.js
│       │
│       ├── middleware/
│       │   ├── auth.js
│       │   └── errorHandler.js
│       │
│       ├── routes/
│       │   ├── authRoutes.js
│       │   ├── centreRoutes.js
│       │   ├── cropRoutes.js
│       │   └── requestRoutes.js
│       │
│       ├── data/
│       │   ├── centres.json
│       │   ├── cropRates.json
│       │   └── db.js
│       │
│       └── utils/
│           ├── otpStore.js
│           └── tokenGen.js
│
└── README.md
```

---

# 🔌 API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | Backend health check |
| `POST` | `/api/auth/register` | Register farmer |
| `POST` | `/api/auth/otp/request` | Request OTP |
| `POST` | `/api/auth/otp/verify` | Verify OTP and receive JWT |
| `GET` | `/api/auth/me` | Get logged-in farmer |
| `GET` | `/api/crops` | List farmer crops |
| `POST` | `/api/crops` | Add crop |
| `DELETE` | `/api/crops/:id` | Delete crop |
| `GET` | `/api/centres` | List procurement centres |
| `GET` | `/api/centres/recommend?crop=Paddy` | Recommend centres |
| `GET` | `/api/requests` | List procurement requests |
| `POST` | `/api/requests` | Create procurement request |
| `GET` | `/api/requests/:token/track` | Track procurement |
| `POST` | `/api/requests/:token/advance` | Advance demo stage |
| `GET` | `/api/requests/slots` | Get available slots |

---

# 💻 Run Locally

## Prerequisites

Install:

- Node.js 18+
- npm
- VS Code
- Git

Check Node.js:

```bash
node --version
npm --version
```

---

## 1. Start Backend

```bash
cd backend
npm install
```

Create `.env` from `.env.example`.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Example `.env`:

```env
PORT=4000
JWT_SECRET=change-this-secret
DEV_MODE=true
OTP_EXPIRY_MINUTES=5
```

Start the API:

```bash
npm start
```

Backend:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/api/health
```

---

## 2. Start Frontend

Open a second terminal:

```bash
cd frontend
npx serve .
```

Open the URL shown by the terminal, usually:

```text
http://localhost:3000
```

> Do not open `index.html` directly with `file://`. The frontend communicates with the backend through `fetch()`.

---

# 🔐 Demo OTP

For development/demo mode:

```env
DEV_MODE=true
```

The backend generates a random OTP and logs it in the backend terminal.

Example:

```text
[DEV OTP] mobile=9876543210 otp=4821
```

The OTP expires after the configured period.

### Production

Before using this system with real users:

```env
DEV_MODE=false
```

and integrate a real SMS provider.

Possible providers include:

- Twilio
- MSG91
- Fast2SMS

Never expose development OTPs in a production application.

---

# ☁️ Deployment

## Recommended Deployment Architecture

For the current project, the simplest deployment is:

```text
GitHub
  │
  ├──► Netlify
  │      └── Frontend
  │
  └──► Render
         └── Node.js Backend API
```

### Why not Streamlit?

The current project is **not a Streamlit application**. It is already built as a traditional HTML/CSS/JavaScript frontend with a Node.js/Express backend.

Using Streamlit would require rewriting the frontend in Python/Streamlit.

For this codebase, keeping the existing architecture is simpler:

**Netlify + Render.**

---

# 🌐 Deploy Frontend to Netlify

### Option 1 — GitHub deployment

1. Push the project to GitHub.
2. Open Netlify.
3. Select **Add new project → Import an existing project**.
4. Connect GitHub.
5. Select the Kisan Setu repository.
6. Configure the frontend directory.

For this repository:

```text
Base directory: frontend
Build command:   leave empty
Publish directory: .
```

7. Deploy.

Netlify will provide a URL similar to:

```text
https://kisan-setu.netlify.app
```

---

# ⚙️ Deploy Backend to Render

1. Push the project to GitHub.
2. Open Render.
3. Select **New → Web Service**.
4. Connect your GitHub repository.
5. Set the backend root directory to:

```text
backend
```

6. Configure:

```text
Environment: Node
Build Command: npm install
Start Command: npm start
```

7. Add environment variables:

```text
PORT=10000
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
DEV_MODE=true
OTP_EXPIRY_MINUTES=5
```

Render will provide a backend URL similar to:

```text
https://kisan-setu-backend.onrender.com
```

Health check:

```text
https://kisan-setu-backend.onrender.com/api/health
```

---

# 🔗 Connect Netlify Frontend to Render Backend

Open:

```text
frontend/js/config.js
```

Change:

```javascript
const API_BASE = 'http://localhost:4000/api';
```

to:

```javascript
const API_BASE = 'https://YOUR-BACKEND.onrender.com/api';
```

Example:

```javascript
const API_BASE = 'https://kisan-setu-backend.onrender.com/api';
```

Then commit and push:

```bash
git add .
git commit -m "Connect frontend to production API"
git push origin main
```

Netlify will automatically deploy the updated frontend when the Git repository is connected to the site.

---

# 🧪 Deployment Testing Checklist

After deployment, test:

- [ ] Landing page loads
- [ ] Registration works
- [ ] OTP is generated
- [ ] OTP verification works
- [ ] Login creates a session
- [ ] Crop can be added
- [ ] Crop can be removed
- [ ] Centre list loads
- [ ] Centre recommendation works
- [ ] Slot selection works
- [ ] Procurement request can be created
- [ ] Digital token is generated
- [ ] Status tracking works
- [ ] Map loads
- [ ] History loads
- [ ] Backend health endpoint returns `ok: true`

---

# ⚠️ Current Prototype Limitations

This project is designed as a hackathon/demo prototype.

### Current limitations

- JSON file instead of a production database
- OTP is demo-only
- No real SMS provider
- No centre-officer authentication
- Demo stage advancement is available from the application
- No document upload
- No quality-assessment image processing
- No push/SMS notifications
- No production payment gateway integration

---

# 🗺️ Roadmap

### Phase 1 — Prototype
- [x] Farmer authentication
- [x] OTP flow
- [x] Crop management
- [x] Centre recommendation
- [x] Slot scheduling
- [x] Digital token
- [x] Procurement tracking
- [x] Centre map
- [x] History

### Phase 2 — Production
- [ ] PostgreSQL / MongoDB database
- [ ] Centre officer portal
- [ ] Real SMS OTP
- [ ] Document upload
- [ ] Quality verification
- [ ] Automated notifications
- [ ] Payment integration
- [ ] Role-based access control

### Phase 3 — Intelligent Agriculture Platform
- [ ] Demand forecasting
- [ ] Centre congestion prediction
- [ ] Crop price intelligence
- [ ] Multilingual voice assistant
- [ ] AI-based quality assessment
- [ ] Farmer analytics dashboard
- [ ] Government/centre analytics dashboard

---

# 🏆 Hackathon Value

Kisan Setu demonstrates how a digital procurement workflow can connect farmers with procurement infrastructure through:

**Registration → Crop Data → Intelligent Recommendation → Scheduling → Digital Token → Tracking → Payment**

The architecture is intentionally modular so the prototype can later be extended with real databases, SMS services, officer dashboards, AI models and government procurement integrations.

---

# 👥 Project

**Project:** Kisan Setu  
**Domain:** Agri-Tech / Digital Agriculture  
**Type:** Full-Stack Web Application  
**Purpose:** Farmer Procurement Scheduling & Status Tracking

---

## 📄 License

This project is developed as an academic/hackathon prototype.

---

## ⭐ If you find this project useful

Give the repository a ⭐ and feel free to explore, improve and extend the system.
