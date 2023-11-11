// Import express framework for web 
const express = require('express');
const appExpress = express();
// Create server
var server = require("http").Server(appExpress);
// Import body-parser middleware using to extract body from HTTP request
const bodyParser = require('body-parser');
// Import mongoDB
const mongoose = require('mongoose');
// System time
var startTime = process.hrtime();
// Import evironment variables
const config = require('./config/config');
const dotenv = require('dotenv');
// const { setLight } = require('./mqtt/mqtt');
dotenv.config();
// Using ejs as a tool simulate HTML
appExpress.set("view engine", "ejs");
// Add router for ejs
appExpress.set("views", "./views");
// Add router resource for client
appExpress.use(express.static("./public"));
// Import routes
const route = require('./routes/route')(io, startTime);
// Route middleware
appExpress.use('/', route);
// Config body parser
appExpress.use(bodyParser.urlencoded({ extended: true, limit: "30mb" }));
appExpress.use(bodyParser.json());

var activeNode = new Set();
let LightObj = {
    Green: 30000,
    Red: 3000,
    Yellow: 10000
}
console.log(LightObj.Green)
// const URI = 'mongodb+srv://1111:1234@checkpoint.dvt4rzg.mongodb.net/?retryWrites=true&w=majority' 
// const URI = 'mongodb+srv://quangduytran:habui28052003@cluster0.n11dnbs.mongodb.net/?retryWrites=true&w=majority'
const URI = 'mongodb://0.0.0.0:27017/Test'
// const URI = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0/Test'

// URI of mongo DB
// const URI = 'mongodb://localhost:27017/test'
// Global dir
global.__basedir = __dirname;
console.log("Max number check points: " + process.env.maxCheckPoints);


//Import socket io
var io = require("socket.io")(server);

//MQTT
const mqtt = require('./mqtt/mqtt')(io, activeNode, startTime);
// Start and connect mongoDB and server

// Import socket io for server
require('./helper/socket-io')(io, mqtt, activeNode, startTime);

global._io = io;

mongoose
    .connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Connected to db")
        appPort = config.port;
        appHost = config.host;
        server.listen(appPort, appHost, () => {
            console.log(`Server listening at host ${appHost} port ${appPort}`);
            // setInterval(() => {
            //     setTimeout(() => {
            //         mqtt.setLight({ light: "yellow" })
            //         console.log(`Yellow: ${new Date()}`)
            //     }, LightObj.Green)

            //     setTimeout(() => {
            //         mqtt.setLight({ light: "red" })
            //         console.log(`Red: ${new Date()}`)
            //     }, LightObj.Yellow)
            //     setTimeout(() => {
            //         mqtt.setLight({ light: "green" })
            //         console.log(`Green: ${new Date()}`)
            //     }, LightObj.Red)
            // }, 44000);


        });
    }).catch((err) => {
        console.log(err)
    })

