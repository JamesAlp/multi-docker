const keys = require('./keys');
const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000 // if lose connection attempt reconnect once every second
});
const sub = redisClient.duplicate();

/**
 * recursive function to caluclate fibonance number at supplied index
 * @param {*} index index number to calculate fibonance number
 * @returns calculated fibonance number
 */
function fibonanceAtIndex(index) {
  if(index < 2) return 1;
  return fibonanceAtIndex(index - 1) + fibonanceAtIndex(index - 2);
}

/**
 * any time a new index is supplied caluclate the fibonance number and cache
 */
sub.on('message', (channel, message) => {
  redisClient.hset('values', message, fibonanceAtIndex(parseInt(message)));
});

/**
 * any time a new value is inserted into redis (?) i have no idea what this does
 */
sub.subscribe('insert');