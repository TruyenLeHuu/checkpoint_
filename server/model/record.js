const mongoose = require('mongoose')
const Schema  = mongoose.Schema
const recordSchema = new Schema ({
    id:{
        type:String
    },
    rank:{
        type:Number,
    },
    maxcp:{
        type:Number,
    },
    time:{
        type:Number,
    },
})
const recordModel = mongoose.model('Record', recordSchema)
module.exports=recordModel