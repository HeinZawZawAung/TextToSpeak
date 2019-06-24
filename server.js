const express = require('express');
const app = express();
const server = require('http').createServer(app);
require('./route_for_auth')(express,app);
server.listen(3000,function () {
    console.log("Server is running in port 3000");
});