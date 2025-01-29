const mongoose = require('mongoose')
const Schema =  mongoose.Schema

const roomSchema = new Schema({
    room_name:{
        type:String,
        required:true
    },
    participants:{
        type:Array,
        required:true
    }
},{timestamp:true})
module.exports = mongoose.model('Room',roomSchema)