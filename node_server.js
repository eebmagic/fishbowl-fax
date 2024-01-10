const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/fishbowl.lol.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/fishbowl_lol.crt')),
  ca: fs.readFileSync(path.join(__dirname, 'ssl/fishbowl_lol.ca-bundle')),
}

app.post('/addDocument', async (req, res) => {
  const { message } = req.body;
  console.log(`Got call to add doc for message: ${message}`);
});

app.get('/heartbeat', async (req, res) => {
  console.log(`Got heartbeat call. Sending response.`);
  res.status(200).send("Server is up and running!");
});


const PORT = process.env.PORT || 5000;
https.createServer(options, app).listen(PORT, () => {
// app.listen(PORT, () => {
  console.log(`HTTPS server running on port ${PORT}`);
});
