const db = require('../controllers/controller')
module.exports = function (io, mqtt, activeNode) {
    var nowNode = 0;
    io.on("connection", function (socket) {
        console.log("Socket connected")
        socket.emit("ESP-check-data", [...activeNode]);
        socket.on("disconnect",()=>{
            console.log("Socket disconnected")
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
        socket.on('Change-flow',  (data)  =>  {
            // console.log(data)
            db.addFlow(data);
        })
        socket.on('esp-send',(data)=>{
            io.sockets.emit('esp-send', data)
            console.log(data)
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
        socket.on('Connection-refresh',()=>{
            mqtt.refreshConnection();
        })
        socket.on("Get-line",()=>{
            db.getLine((lineList)=>{
                io.sockets.emit('List-line',lineList)
            });
        });
    })
}