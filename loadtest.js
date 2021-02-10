const conf = require('./conf/conf.json');
const url = require('url');

const winston = require('winston');
const _LOGGER = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename: 'stresstest.log' })],
});

const LOGGER = {
  info: (message) => _LOGGER.log({ level: "info", message: `${message}` }),
  error: (message) => _LOGGER.log({ level: "error", message: `${message}` })
};

const sendRequest = (url, threadNumber, requestNumber) => {
  const caller = conf.ssl ? require("https") : require("http");
  return new Promise((resolve, reject) => {
    caller.get(url, response => {
      if (response.statusCode == 200) {
        resolve(`Thread ${threadNumber} - ${requestNumber} status code ${response.statusCode}`);
      }
      reject(`Error Thread ${threadNumber} - ${requestNumber} status code ${response.statusCode}`)
    }).on('error', (error) => (reject(`Error Thread ${threadNumber} - ${requestNumber} Error status${error}`))).end()
  })
};

const threadRequest = async (numThreads) => {

  const SocksProxyAgent = require('socks-proxy-agent');
  const urlRequest = url.parse(conf.requestUrl);
  urlRequest.agent = new SocksProxyAgent(`socks://${conf.proxyIporHostname}:${conf.proxyPort}`);

  const generateLogData = require('./filereadlinebyline.js');

  for (let requestCount = 1; requestCount <= conf.loopCount; requestCount++) {
    try {
      let result = await sendRequest(urlRequest, numThreads, requestCount);
      LOGGER.info(result);
    }
    catch (error) {
      LOGGER.error(error)
    }
  }
  if (--numThreads) threadRequest(numThreads);
  if (numThreads == 0) {
    generateLogData.generateLogData();
  }
}

module.exports = { threadRequest };

// Support direct execution
if (require.main === module) threadRequest(conf.numThreads);
