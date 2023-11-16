const router = require("express").Router();
const {
  setupPage,
  dualPage,
  addFlow,
  leaderBoard,
  scoreBoard,
  sendData,
  mainPage,
} = require("../controllers/controller");

module.exports = function (io,mqtt, startTime,lightNode) {
  router.get("/", mainPage);
  router.get("/setup", setupPage);
  router.get("/dual", dualPage);
  router.get("/leaderBoard", leaderBoard);
  router.get("/scoreBoard", scoreBoard);
  router.post("/add_flow", addFlow);
  router.post("/send-data", (req, res, next) => {
    try {
      // js = JSON.stringify(req.body)
      console.log(lightNode)
      console.log("Esp send " + req.body.Data);
      io.sockets.emit("esp-send", req.body);
      res.json({ message: "Send data successful!" });
      if (lightNode.value == req.body.Data) {
        mqtt.startCrossLight()
      }
    } catch (err) {
      console.log(err)
      res.json({ message: "Error" });
    }
  });
  router.get("/getTick", (req, res) => {
    var hrTime = process.hrtime();
    var ticks = Math.round(
      (hrTime[0] - startTime[0]) * 100 + (hrTime[1] - startTime[1]) / 10000000
    );
    res.json({ tick: ticks });
  });
  // router.get('/setup', (req, res, next) => {
  //   res.render('setupEsp',{ maxCheckPoints: process.env.maxCheckPoints });
  // });
  // router.get('/dual', (req, res, next) => {
  //   res.render('dual');
  // });
  //s
  return router;
};
