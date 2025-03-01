const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const MongoClient = require('mongodb').MongoClient;
const url = ''; // Put mongoDB link here
const client = new MongoClient(url);
client.connect();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use((req, res, next) =>
{
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.listen(5000); // start Node + Express server on port 5000

