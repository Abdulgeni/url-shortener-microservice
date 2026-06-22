require('dotenv').config();
var express = require('express');
const cors = require('cors');
const app = express();
const urlparser = require('url');
const dns = require('dns');

const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory database
let urlDatabase = {};
let counter = 1;

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Create short URL
app.post('/api/shorturl', function(req, res) {
  const urlString = req.body.url;

  // Check if URL has valid format
  let urlRegex = /^https?:\/\/.+/;
  if (!urlRegex.test(urlString)) {
    return res.json({ error: 'invalid url' });
  }

  // Extract hostname
  try {
    const hostname = urlparser.parse(urlString).hostname;
    
    if (!hostname) {
      return res.json({ error: 'invalid url' });
    }

    dns.lookup(hostname, function(err, address) {
      if (err || !address) {
        res.json({ error: 'invalid url' });
      } else {
        const shortUrl = counter++;
        urlDatabase[shortUrl] = urlString;
        res.json({
          original_url: urlString,
          short_url: shortUrl
        });
      }
    });
  } catch (e) {
    res.json({ error: 'invalid url' });
  }
});

// Redirect short URL
app.get('/api/shorturl/:short_url', function(req, res) {
  const shorturl = parseInt(req.params.short_url);
  const originalUrl = urlDatabase[shorturl];

  if (originalUrl) {
    res.redirect(originalUrl);
  } else {
    res.json({ error: 'No short URL found' });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});