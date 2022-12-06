const mongoose = require('mongoose')
const Schema  = mongoose.Schema
const teamSchema = new Schema ({
    id:{
        type:String
    },
    name:{
        type:String
    },
    group:{
        type:String,
    }, 
    side:{
        type:Number,
    }
})
const teamModel = mongoose.model('Team', teamSchema)
module.exports=teamModel