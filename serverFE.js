const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const port = 3001;

app.use(cors({
  origin: 'http://localhost:3001' // Ganti dengan domain frontend Anda
}));

app.use(bodyParser.json());

// Menggunakan middleware express.static untuk menyajikan file statis
app.use(express.static('public'));

// Rute untuk halaman index
app.get('/index', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.post('/check-links', (req, res) => {
  const { url } = req.body;

  // ... (Kode pemrosesan pemeriksaan tautan)

  // Setelah pemrosesan selesai, kirimkan respons JSON dengan hasil pemeriksaan tautan
  res.json({
    url,
    linkCount,
    brokenCount,
    greenCount,
  });
});