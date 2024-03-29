const team = require("../model/team.js");
const flow = require("../model/flow.js");
const teamweb = require("../model/teamweb.js");
const score = require("../model/score.js");
const { response } = require("express");

var that = (module.exports = {
  setupPage: async (req, res, next) => {
    res.render(__basedir + "/views/setup.ejs", {
      maxCheckPoints: process.env.maxCheckPoints,
    });
  },
  leaderBoard: async (req, res, next) => {
    res.render(__basedir + "/views/leaderboard.ejs", {
      maxCheckPoints: process.env.maxCheckPoints,
    });
  },
  scoreBoard: async (req, res, next) => {
    res.render(__basedir + "/views/scoreboard.ejs", {
      maxCheckPoints: process.env.maxCheckPoints,
    });
  },
  dualPage: async (req, res, next) => {
    res.render(__basedir + "/views/dual_v2.ejs");
  },
  mainPage: async (req, res, next) => {
    res.render(__basedir + "/views/scoreboard_view.ejs");
  },
  addTeam: async (data) => {
    try {
      await team.create({
        name: data.name,
        group: data.group,
        image_link: data.image_link,
        score: 0,
        numcheckpoint: 0 
      });

      console.log({ message: "Add user Successfully" });
    } catch (err) {
      console.log({ error: err });
    }
  },
  deleteTeam: async (name) => {
    team
      .findOneAndRemove({ name: name })
      .then(() => {
        console.log({ message: "Delete user Successfully" });
      })
      .catch((err) => {
        console.log({ error: err });
      });
  },
  getTeam: (callback) => {
    team
      .find()
      .select("name group score numcheckpoint image_link -_id")
      .then((respond) => {
        return callback(respond);
      })
      .catch((err) => {
        console.log({ error: err });
      });
  },
    addFlow: async (data) => {
    try {
      flow.collection.deleteMany();
      const newFlow = new flow({
        flow: data.flow,
        type: data.type,
      });
      await newFlow.save();
      console.log({ message: "Add flow Successfully" });
    } catch (err) {
      console.log({ error: err });
    }
  },
  getLine: (callback) => {
    flow
      .find()
      .then((respond) => {
        // console.log(respond)
        return callback(respond);
      })
      .catch((err) => {
        console.log({ error: err });
      });
  },
  addrecord: async (data) => {
    try {
      await teamweb.create({
        team: data.team,
        dualwith: data.dualwith,
        turn: data.turn,
        time: data.time,
        cp: data.cp,
      });

      console.log({ message: "Add teamweb Successfully !" });
    } catch (err) {
      console.log({ error: err });
    }
  },
  addrecordteam: async (data) => {
    try {
      console.log(data)
      await team
      .findOne({name: data[0].name})
      .select("name score numcheckpoint -_id")
      .then(async (respond) => {
        let updateData = ({
          score : ((data[0].result == 'w') ? 3 : ((data[0].result == 'l') ? 0 : 1))  + respond.score,
          numcheckpoint: data[0].numcp + respond.numcheckpoint,
        })
        await team.findOneAndUpdate({name: data[0].name}, {$set:updateData})
        // console.log(respond)
      })
      await team
      .findOne({name: data[1].name})
      .select("name score numcheckpoint -_id")
      .then(async (respond) => {
        let updateData1 = ({
          score : ((data[1].result == 'w') ? 3 : ((data[1].result == 'l') ? 0 : 1))  + respond.score,
          numcheckpoint: data[1].numcp + respond.numcheckpoint,
        })
        await team.findOneAndUpdate({name: data[1].name}, {$set:updateData1})
        console.log(data[1].name)
      })
      console.log({ message: "Add teamweb Successfully !" });
      } catch (err) {
        console.log({ error: err });
      }
  },
  addRecordScore: async (data) => {
    try {
      await score.collection.deleteMany();
      const newScore = new score({
        scores: data
      });
      await newScore.save();
      // console.log({ message: "Add score Successfully" });
    } catch (err) {
      console.log({ error: err });
    }
  },
  getScore: (callback) => {
    score
      .find()
      .then((respond) => {
        // console.log(respond)
        return callback(respond);
      })
      .catch((err) => {
        console.log({ error: err });
      });
  },
});
