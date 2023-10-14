const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const async = require('async');
const bodyParser = require('body-parser');


const app = express();
const port = 3000;

app.use(bodyParser.json());

// Fungsi untuk menghitung jumlah tautan dengan status "broken" dan "green"
function countLinkStatuses(linkStatuses) {
  let brokenCount = 0;
  let greenCount = 0;

  linkStatuses.forEach((linkStatus) => {
    if (linkStatus.status === 'broken') {
      brokenCount++;
    } else if (linkStatus.status === 'green') {
      greenCount++;
    }
  });

  return { brokenCount, greenCount };
}

app.post('/check-links', (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Fungsi untuk memeriksa semua tautan di satu URL, termasuk tautan gambar
  function checkAllLinks(url, callback) {
    axios.get(url)
      .then((response) => {
        const $ = cheerio.load(response.data);
        const links = $('a, img');
        const allLinks = [];

        links.each((i, link) => {
          let href = $(link).attr('href') || $(link).attr('src');
          if (href) {
            if (!href.startsWith('http') && !href.startsWith('https')) {
              href = new URL(href, url).href;
            }
            allLinks.push(href);
          }
        });

        // Fungsi untuk memeriksa status tautan
        function checkLinkStatus(link, cb) {
          axios.head(link)
            .then((response) => {
              const status = response.status;
              const linkStatus = status === 200 ? 'green' : 'broken';

              // Menentukan skema tautan
              const linkScheme = link.startsWith('https://') ? 'HTTPS' : 'HTTP';

              cb(null, { link, status: linkStatus, scheme: linkScheme });
            })
            .catch(() => {
              const linkStatus = 'broken';
              // Menentukan skema tautan
              const linkScheme = link.startsWith('https://') ? 'HTTPS' : 'HTTP';

              cb(null, { link, status: linkStatus, scheme: linkScheme });
            });
        }

        async.map(allLinks, checkLinkStatus, (err, linkStatuses) => {
          if (err) {
            callback(err);
          } else {
            callback(null, { url, linkStatuses, linkCount: allLinks.length });
          }
        });
      })
      .catch((error) => {
        callback(error);
      });
  }

  // Jalankan pemeriksaan semua tautan di URL yang diberikan
  checkAllLinks(url, (err, result) => {
    if (err) {
      res.status(500).json({ error: 'Error while checking links' });
    } else {
      const { linkStatuses, linkCount } = result;
      const { brokenCount, greenCount } = countLinkStatuses(linkStatuses);

      res.json({
        url,
        linkStatuses,
        linkCount,
        brokenCount,
        greenCount,
      });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// Menggunakan middleware CORS
// app.use(cors());
