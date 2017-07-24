const express = require('express');
const app = express();
const bot = require('./bot');

app.get('/messenger', function(req, res) {
  console.info('Messenger Webhook', 'verify');
  if (req.query['hub.verify_token'] === require('./config.json').verifyToken)
    return res.send(req.query['hub.challenge']);
  res.send('Error, wrong validation token');
});

app.use('/messenger', bot.messengerConnector.listen());

app.get('*', function(req, res) {
  res.send(200, 'Hello Messenger Bot');
});

const port = normalizePort(process.env.PORT || '9090');

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

app.listen(port, function() {
  console.log('server is running. ' + port);
});
