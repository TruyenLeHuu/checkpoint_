const db = require('../controllers/controller')
// const schedule = require('node-schedule');
// const { TaskTimer } = require('tasktimer');
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler')
module.exports = function (io, mqtt, activeNode, startTime) {
    let LightSignal = {
        Green: 0,
        Red: 1,
        Yellow: 2
    }
    // const timer = new TaskTimer(1000);
    const scheduler = new ToadScheduler();  
    var nowNode = 0;
    io.on("connection", function (socket) {
        // console.log("Socket connected")
        socket.emit("ESP-check-data", [...activeNode]);
        
        socket.on("disconnect",()=>{
            // console.log("Socket disconnected")
        })
        // socket.on('ESP-connect', (data) => {
        //     socket.userID = data;
        //     activeNode.add(data);
        //     console.log("ESP connected: ", socket.userID);
        //     io.sockets.emit('ESP-connect', data);
        // });
        // socket.on("ESP-connect", function (reason) {
        //     if (socket.userID) {
        //         activeNode.delete(socket.userID);
        //         console.log("ESP disconnect: " + socket.userID)
        //         io.emit('ESP-disconnect', socket.userID);
        //     }
        //     console.log("----------- " + reason + " -------------");
        // });
        socket.on("Set-range", function (value) {
            nowNode = value.node;
            mqtt.setRange(value);
            // console.log("io")
        });
        socket.on("Set-ip", function (ip) {
            // nowNode = value.node;
            mqtt.setIP(ip);
            // console.log("io")
        });
        socket.on("Check-esp", function (node) {
            nowNode = node;
            mqtt.checkEsp(node);
        });
        socket.on('AddTeam',  data  =>  {
            db.addTeam(data);
        })
        socket.on('DeleteTeam',  data  =>  {
            db.deleteTeam(data.id);
        })
        socket.on('GetTeam',()=>{
            db.getTeam((teamList)=>{
                io.sockets.emit('ListTeam',teamList)
            });
        })
        socket.on("web-send-record",  (data)  =>  {
            db.addrecord(data);
        })
        socket.on("call-list",  ()  =>  {
            db.getTeam((teamList)=>{
                io.sockets.emit('update-leader-board', teamList)
            });
        })
        socket.on("record-team",  async (data)  =>  {
            await db.addrecordteam(data);
            await db.getTeam((teamList)=>{
                io.sockets.emit('update-leader-board', teamList)
            });
            
        })
        socket.on('Change-flow',  (data)  =>  {
            db.addFlow(data);
        })
        socket.on('esp-send',(data)=>{
            io.sockets.emit('esp-send', data)
        })
        socket.on('start', () =>{
            io.sockets.emit('start-res')
            mqtt.sendStartTraffic({start: "all"})
        })
        socket.on('start-light', () => {
            taskTimer.start();
            console.log("Traffic Light starte")            
        })
        socket.on('reset-light', () => {
            console.log("reset light")
            mqtt.restartLight({restart: 'all'})
        })
        socket.on('refresh', ()=>{
            io.sockets.emit('refresh-res')
        })
        socket.on('restart', ()=>{
            io.sockets.emit('restart-res')
        })
        socket.on('get-tick',()=>{
            var hrTime = process.hrtime()
            io.sockets.emit('send-tick', Math.round((hrTime[0]-startTime[0]) * 100 + (hrTime[1]-startTime[1]) / 10000000));
        })
        socket.on('get-tick-setup',(data)=>{
            var hrTime = process.hrtime()
            io.sockets.emit('send-tick-setup', {Data: data.id, Tick: (Math.round((hrTime[0]-startTime[0]) * 100 + (hrTime[1]-startTime[1]) / 10000000) - data.tick)});
        })
        socket.on('esp-send-1',(data)=>{
            io.sockets.emit('esp-send-1', data)
        })
        socket.on('esp-send-2',(data)=>{
            io.sockets.emit('esp-send-2', data)
        })
        socket.on('Change-team-web',(data)=>{
            io.sockets.emit('Change-team-web', data)
        })
        socket.on('Change-team-side',(data)=>{
            io.sockets.emit('Change-team-side', data)
        })
        socket.on('outline1',()=>{
            io.sockets.emit('_outline1')
        })
        socket.on('outline2',()=>{
            io.sockets.emit('_outline2')
        })
        socket.on('subcheckpoint1',(data)=>{
            io.sockets.emit('_subcheckpoint1', data)
        })
        socket.on('subcheckpoint2',(data)=>{
            io.sockets.emit('_subcheckpoint2', data)
        })
        socket.on('Connection-refresh',()=>{
            mqtt.refreshConnection();   
        })
        socket.on("set-light-time",(data) => {
            let cycle = data.red+data.green+data.yellow       
            const red_task = new Task('red_task', () => {
                let hrTime = process.hrtime()
                console.log("Time started: "+Math.round((hrTime[0]-startTime[0]) * 100 + (hrTime[1]-startTime[1]) / 10000000));
                console.log('red_task triggered');
            });
            const green_task = new Task('green_task', () => {
                let hrTime = process.hrtime()
                console.log("Time started: "+Math.round((hrTime[0]-startTime[0]) * 100 + (hrTime[1]-startTime[1]) / 10000000));
                console.log('green_task triggered');
            });
            const yellow_task = new Task('yellow_task', () => {
                let hrTime = process.hrtime()
                console.log("Time started: "+Math.round((hrTime[0]-startTime[0]) * 100 + (hrTime[1]-startTime[1]) / 10000000));
                console.log('yellow_task triggered');
            });
            
            const red_job = new SimpleIntervalJob(
                { seconds: cycle, runImmediately: true },
                red_task,
                { 
                    id: 'red',
                    preventOverrun: true,
                }
            );
            const green_job = new SimpleIntervalJob(
                { seconds: cycle, runImmediately: true },
                green_task,
                { 
                    id: 'green',
                    preventOverrun: true,
                }
            );
            const yellow_job = new SimpleIntervalJob(
                { seconds: cycle, runImmediately: true },
                yellow_task,
                { 
                    id: 'yellow',
                    preventOverrun: true,
                }
            );   
            let sTime = process.hrtime()
            scheduler.addSimpleIntervalJob(red_job);        
            while(!(process.hrtime(sTime)[0] >= data.red)){}
            scheduler.addSimpleIntervalJob(green_job);
            while(!(process.hrtime(sTime)[0] >= data.green+data.red)){}
            scheduler.addSimpleIntervalJob(yellow_job);
        })
        socket.on("stop-light",(data)=>{
            taskTimer.stop()
            console.log("Traffic Light: stop")
            mqtt.stopLight()
        })
        socket.on("Get-line",()=>{
            db.getLine((lineList)=>{
                io.sockets.emit('List-line',lineList)
                console.log("get line")
            });
        });
    })
}