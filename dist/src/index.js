"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
require('dotenv').config();
const { scrapeAndPost } = require("./scraper");
net.createServer().listen();
const interval = Number((_a = process.env.fetchInterval) !== null && _a !== void 0 ? _a : 30000);
scrapeAndPost();
setInterval(() => {
    scrapeAndPost();
}, interval);
//# sourceMappingURL=index.js.map