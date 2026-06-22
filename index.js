const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// In-memory database
let urlDatabase = {};
let counter = 1;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create short URL
app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;

  // Validate URL format
  let urlRegex = /^https?:\/\//;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Extract hostname for DNS lookup
  let hostname = originalUrl.replace(/^https?:\/\//, '').split('/')[0];

  dns.lookup(hostname, (err) => {
    if (err) {
      res.json({ error: 'invalid url' });
    } else {
      let shortUrl = counter++;
      urlDatabase[shortUrl] = originalUrl;
      res.json({
        original_url: originalUrl,
        short_url: shortUrl
      });
    }
  });
});

// Redirect short URL
app.get('/api/shorturl/:id', (req, res) => {
  let id = req.params.id;
  let originalUrl = urlDatabase[id];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});