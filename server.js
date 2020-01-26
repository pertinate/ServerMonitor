const PM2Scraper = require('./pm2Scraper');
const express = require('express');
const app = express();
const WebSocket = require('ws');
const SocketHandler = require('./SocketHandler');

app.use('/getstatus', (request, response) =>
{
    PM2Scraper.getStatus()
    .then(result => response.status(200).send(result));
})

app.listen(8080, () =>
{
    console.log('listening');
})

const wss = new WebSocket.Server({port: 8081});

const socketHandler = new SocketHandler(wss);

global.broadcast = socketHandler.broadcast;

PM2Scraper.beginScrape();

console.log('starting')

