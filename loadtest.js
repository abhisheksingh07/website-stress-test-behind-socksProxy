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
}

function sendRequest(url, thread, requestNumber) {
  const caller = conf.ssl ? require("https") : require("http");
  return new Promise((resolve, reject) => {
    caller.get(url, response => {
      if (response.statusCode == 200) {
        resolve(`Thread ${thread} - ${requestNumber} status code ${response.statusCode}`);
      }
      reject(`Error Thread ${thread} - ${requestNumber} status code ${response.statusCode}`)
    }).on('error', (error) => (reject(`Error Thread ${thread} - ${requestNumber} Error status${error}`))).end()
  })
}

async function threadRequest(thread) {

  const SocksProxyAgent = require('socks-proxy-agent');
  const urlRequest = url.parse(conf.requestUrl);
  urlRequest.agent = new SocksProxyAgent(`socks://${conf.proxyIporHostname}:${conf.proxyPort}`);

  const generateLogData = require('./filereadlinebyline.js');

  for (let requestCount = 1; requestCount <= conf.loopCount; requestCount++) {
    try {
      let result = await sendRequest(urlRequest, thread, requestCount);
      LOGGER.info(result);
    }
    catch (error) {
      LOGGER.error(error)
    }
  }
  if (--thread) threadRequest(thread);
  if (thread == 0) {
    generateLogData.generateLogData();
  }
}

// Support direct execution
if (require.main === module) threadRequest(conf.threadNumber);
