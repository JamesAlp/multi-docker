const keys = require('./keys');
const express = require('express');
const app = express();
const port = process.env.port ?? 5000;
const bodyParser = require('body-parser');
const cors = require('cors');
// Postgres client setup
const { Pool } = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
  ssl:
    process.env.NODE_ENV !== 'production'
      ? false
      : { rejectUnauthorized: false },
});
// Redis client setup
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

app.use(cors());
app.use(bodyParser.json()); // parse incoming requests into JSON values

// Connect to postgres client
pgClient.on("connect", (client) => {
  // Create initial table if not already exists
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});

pgClient.on('error', () => console.log('Lost PG connection'));

// Express route handlers
app.get('/', (req, res) => {
  console.log('GET on /');
  res.send('Hello world!');
});

app.get('/values/all', async (req, res) => {
  console.log('GET on /values/all');
  const values = await pgClient.query('SELECT * FROM values');
  res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
  console.log('GET on /values/current');
  redisClient.hgetall('values', (err, values) => {
    if(err) {
      console.log('error: ', err);
    }
    res.send(values);
  })
});

app.post('/values', async (req, res) => {
  console.log('POST on /values');
  const index = req.body.index;
  // requesting too large of a number takes a very long time to calculate, so cap the index
  if (parseInt(index) > 40) {
    console.log('index too high');
    return res.status(422).send('Index too high');
  }

  if(parseInt(index) < 1) {
    console.log('index too low');
    return res.status(422).send('Index too low');
  }

  redisClient.hset('values', index, 'Nothing yet!'); // insert to redis cache
  redisPublisher.publish('insert', index); // publish event (message) to worker
  pgClient.query('INSERT INTO values (number) VALUES ($1)', [index]); // save index to db
  res.send({ working: true });
});

app.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});