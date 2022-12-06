const mongoose = require('mongoose')
const Schema  = mongoose.Schema
const flowSchema = new Schema ({
    flow:{
        type:Array,
    }
})
const flowModel = mongoose.model('Flow', flowSchema)
module.exports=flowModel