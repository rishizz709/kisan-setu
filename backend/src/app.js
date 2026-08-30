const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const cropRoutes = require('./routes/cropRoutes');
const centreRoutes = require('./routes/centreRoutes');
const requestRoutes = require('./routes/requestRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'kisan-setu-backend', time: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/centres', centreRoutes);
app.use('/api/requests', requestRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
