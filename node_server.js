const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const options = {
  key: fs.readFileSync(path.join(__dirname, 'ssl/fishbowl.lol.key')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl/fishbowl_lol.crt')),
  ca: fs.readFileSync(path.join(__dirname, 'ssl/fishbowl_lol.ca-bundle')),
}


async function addDocumentToCollection(message) {
  const dbURL = process.env.MONGO_URI;
  const client = new MongoClient(dbURL);

  try {
    await client.connect();
    console.log("Connected to server");

    const db = client.db('fishbowl-fax');
    const collection = db.collection('messages');

    const doc = {
      'message': message,
      'date-received': new Date(),
      'printed': false,
      'date-printed': null
    }
    const result = await collection.insertOne();
    console.log(`Added doc: ${JSON.stringify(doc, null, 2)}`);
    // return true;
  } catch {
    console.log(`FAILED`);
    // return false;
  }
}

app.post('/addDocument', async (req, res) => {
  const { message } = req.body;
  console.log(`Got call to add doc for message: ${message}`);
  addDocumentToCollection(message);
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
