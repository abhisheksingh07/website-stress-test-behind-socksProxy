const conf = require('./conf/conf.json');
const url = require('url');
let winston = require('winston');
let generateLogData = require('./filereadlinebyline.js');
let SocksProxyAgent = require('socks-proxy-agent');
const proxy = `socks://${conf.proxyIporHostname}:${conf.proxyPort}`;
let urlRequest = url.parse(conf.requestUrl);

let loggers = {
  mjson: winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [new winston.transports.File({ filename: 'stresstest.log' })],
  })
}


// create an instance of the `SocksProxyAgent` class with the proxy server information
let agent = new SocksProxyAgent(proxy);

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
  urlRequest.agent = agent;
  for (let requestCount = 1; requestCount <= conf.loopCount; requestCount++) {
    try {
      let result = await sendRequest(urlRequest, thread, requestCount);
      loggers.mjson.log({
        level: 'info',
        message: `${result}`
      })
    }
    catch (error) {
      loggers.mjson.log({
        level: 'error',
        message: `${error}`
      })
    }
  }
  if (--thread) threadRequest(thread);
  if (thread == 0) {
    generateLogData.generateLogData();
  }
}

// Support direct execution
if (require.main === module) threadRequest(conf.threadNumber);
