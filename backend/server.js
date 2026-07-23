const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', note: 'Full search API is added in Q4.' });
});

app.listen(PORT, () => console.log(`Backend placeholder listening on ${PORT}`));
