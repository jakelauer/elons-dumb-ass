import * as net from 'net';

require('dotenv').config()

const { scrapeAndPost } = require("./scraper");

net.createServer().listen();

const interval = Number(process.env.fetchInterval ?? 30000);

scrapeAndPost();

setInterval(() => {
    scrapeAndPost();
}, interval);