const express = require('express');
const appExpress = express();
appExpress.use(express.static("./public"));
appExpress.set("view engine", "ejs");
appExpress.set("views", "./views");
const bodyParser = require('body-parser');
const config = require('./config/config');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Flow = require('./model/flow')

appExpress.use(bodyParser.urlencoded({extended:true, limit:"30mb" }));
appExpress.use(bodyParser.json());

var startTime = process.hrtime();

// const URI = 'mongodb+srv://1111:1234@checkpoint.dvt4rzg.mongodb.net/?retryWrites=true&w=majority' 
// const URI = 'mongodb+srv://quangduytran:habui28052003@cluster0.n11dnbs.mongodb.net/?retryWrites=true&w=majority'
// const URI = 'mongodb://0.0.0.0:27017/Test' 



// const URI = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.8.0/Test'
const URI = 'mongodb://localhost:27017/test'

global.__basedir  =  __dirname;
dotenv.config();

console.log("Max number check points: " + process.env.maxCheckPoints);

var server = require("http").Server(appExpress);

var activeNode = new Set();
//socket io and pass port
var io = require("socket.io")(server);
global._io  =  io;

//Import routes
const route = require('./routes/route')(io, startTime);
//MQTT
const mqtt = require('./mqtt/mqtt')(io, activeNode, startTime);
//Route middleware
appExpress.use('/', route);

require('./helper/socket-io')(io, mqtt, activeNode, startTime);

//global._io.on('connection',  socketServices.connection)

mongoose
.connect(URI, {useNewUrlParser:true, useUnifiedTopology:true})
.then(()=>{
    console.log("Connected to db")
    //InitRole()
    appPort = config.port;
	appHost = config.host;
     Flow.find()
     .then(flow => {
        console.log(flow)
     })
	server.listen(appPort, appHost, () => {
		console.log(`Server listening at host ${appHost} port ${appPort}`);
});
}).catch((err) => {
    console.log(err)
})

