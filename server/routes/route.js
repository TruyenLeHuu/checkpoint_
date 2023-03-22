const router = require("express").Router();
const {
  setupPage,
  dualPage,
  addFlow,
  leaderBoard,
  sendData,
  mainPage,
} = require("../controllers/controller");

module.exports = function (io, startTime) {
  router.get("/", mainPage);
  router.get("/setup", setupPage);
  router.get("/dual", dualPage);
  router.get("/leaderBoard", leaderBoard);
  router.post("/add_flow", addFlow);
  router.post("/send-data", (req, res, next) => {
    try {
      io.sockets.emit("esp-send", req.body);
      console.log("Esp send " + req.body.Data);
      res.json({ message: "Send data successful!" });
    } catch (err) {
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
