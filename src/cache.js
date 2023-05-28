// cache.js
const mcache = require('memory-cache');

let cache = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cachedBody = mcache.get(key);

    if (cachedBody) {
      res.send(cachedBody);
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        let durationInSeconds = convertDurationToSeconds(duration);
        mcache.put(key, body, durationInSeconds * 1000);
        res.sendResponse(body);
      };
      next();
    }
  };
};

function convertDurationToSeconds(duration) {
  const unit = duration.slice(-1);
  const amount = parseInt(duration.slice(0, -1));
  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    default:
      return 0; // If the format is not recognized, don't cache
  }
}

module.exports = cache;
