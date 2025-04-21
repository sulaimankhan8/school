const express = require('express');
const db = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Add School API
app.post('/addSchool', (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  if (!name || !address || isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, address, latitude, longitude], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'School added successfully' });
  });
});

// List Schools API
app.get('/listSchools', (req, res) => {
  const { latitude, longitude } = req.query;
  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }

  db.query('SELECT * FROM schools', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const lat = parseFloat(latitude);
    const long = parseFloat(longitude);

    results.forEach(school => {
      const latDiff = school.latitude - lat;
      const longDiff = school.longitude - long;
      school.distance = Math.sqrt(latDiff ** 2 + longDiff ** 2);
    });

    results.sort((a, b) => a.distance - b.distance);
    res.json(results);
  });
});

app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
