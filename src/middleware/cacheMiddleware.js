const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 86400 }); // 24 hour TTL

const cacheMiddleware = (req, res, next) => {
  const key = req.originalUrl + JSON.stringify(req.body);
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    return res.json(cachedResponse);
  }

  res.sendResponse = res.json;
  res.json = (body) => {
    cache.set(key, body);
    res.sendResponse(body);
  };

  next();
};

module.exports = cacheMiddleware;