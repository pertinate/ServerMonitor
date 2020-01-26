const PM2Scraper = require('./pm2Scraper');
const express = require('express');
const app = express();
const WebSocket = require('ws');
const SocketHandler = require('./SocketHandler');
const {name} = require('./package.json');
const server = require('http').createServer(app);
const moment = require('moment');
const PORT = 8080;
const socket = require('socket.io');

const wss = socket(server);
function msg(msg)
{
    wss.emit('broadcast', {msg});
}
global.broadcast = msg;

const {log, warn, error} = console;
console.log = (...msg) => 
{
    global.broadcast(`<[${name}]:[${PORT}]:[${new moment().format('MM/DD/YYYY hh:mm:ss A')}] <LOG>> ${msg.join(' ')}`);
    return log(`<[${name}]:[${PORT}]:[${new moment().format('MM/DD/YYYY hh:mm:ss A')}] <LOG>> ${msg.join(' ')}`);
};
console.error = (...msg) => 
{
    global.broadcast(`<[${name}]:[${PORT}]:[${new moment().format('MM/DD/YYYY hh:mm:ss A')}] <ERROR>> ${msg.join(' ')}`);
    return error(`<[${name}]:[${PORT}]:[${new moment().format('MM/DD/YYYY hh:mm:ss A')}] <ERROR>> ${msg.join(' ')}`);
};
console.warn = (...msg) => 
{
    global.broadcast(`<[${name}]:[${PORT}]:[${new moment().format('MM/DD/YYYY hh:mm:ss A')}] <WARN>> ${msg.join(' ')}`);
    return warn(`<[${name}]:[${PORT}]:[${new moment().format('MM/DD/YYYY hh:mm:ss A')}] <WARN>> ${msg.join(' ')}`);
};

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    return next();
  });

app.get('/getstatus', (request, response) =>
{
    PM2Scraper.getStatus()
    .then(result => response.status(200).send(result));
})

server.listen(PORT, () =>
{
    console.log('listening');
})



PM2Scraper.beginScrape();

console.log('starting')

setInterval(() =>
{
    console.log('test')
}, 1000)