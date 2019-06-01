"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var path = require("path");
var app = express();
app.use(express.static(path.join(__dirname, '../../client/build')));
app.get('*', function (req, res) {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
});
var port = 3000;
app.listen(port);
console.log('App is listening on port ' + port);
