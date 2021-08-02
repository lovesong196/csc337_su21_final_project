const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const port = 80;
var app = express();
app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res)=> res.end("OK"));

app.listen(port);