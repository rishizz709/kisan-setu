require('dotenv').config();
const app = require('./src/app');

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Kisan Setu backend running on http://localhost:${PORT}`);
  console.log(`DEV_MODE=${String(process.env.DEV_MODE || 'true')} — OTPs are logged to this console.`);
});
