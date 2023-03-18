const team = require('../model/team.js')
const flow = require('../model/flow.js')
const teamweb1 = require('../model/teamweb.js')

var that = module.exports = {
    setupPage:  async(req,  res,  next)  =>  {
        res.render(__basedir  +  '/views/setup.ejs',{ maxCheckPoints: process.env.maxCheckPoints });
    },
    dualPage:  async(req,  res,  next)  =>  {
        res.render(__basedir  +  '/views/new_dual.ejs');
    },
    mainPage:  async(req,  res,  next)  =>  {
        res.render(__basedir  +  '/views/dual_view.ejs');
    },
    addTeam: async(data)=>{
        try{
            await team.create({
                name: data.name,
                id: data.id,
                group: data.group,
                side: data.side
            })
            
            console.log({message:"Add user Successfully"})
            }
            catch (err) {
                console.log({error:err})
            }
    },
    deleteTeam: async(id)=>{  
        team.findOneAndRemove({id: id})
        .then (()=>{
            console.log({message:"Delete user Successfully"})
        })
        .catch ((err)=> {
            console.log({error:err})
        })
    },
    getTeam: (callback)=>{
        team.find().select('name -_id')
        .then ((respond)=>{
            return callback(respond)
        })
        .catch ((err)=> {
            console.log({error:err})
        })
    },
    addFlow: async(data)=>{
        try{
            flow.collection.deleteMany();
            const newFlow = new flow({
                flow: data.flow
            })
            await newFlow.save()
            console.log({message:"Add flow Successfully"})
            }
            catch (err) {
                console.log({error:err})
            }
    },
    getLine: (callback)=>{
        flow.find()
        .then ((respond)=>{
            return callback(respond)
        })
        .catch ((err)=> {
            console.log({error:err})
        })
    },
    adrecord: async(data)=>{
        try{
            await  teamweb1.create({
               team:    data.team,
               turn:    data.turn,
               time:    data.time,
               cp:    data.cp
            })
            
            console.log({message:"Add teamweb Successfully !"})
            }
            catch (err) {
                console.log({error:err})
            }
    }
}