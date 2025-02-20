const mongoose = require('mongoose')
const Schema =  mongoose.Schema

const roomSchema = new Schema({
    room_name:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        default:"https://res.cloudinary.com/dvxd92zeg/image/upload/v1738554069/photo_2024-01-17_11-41-25_ymvfyb.jpg"
    },
    participants:{
        type:Array,
        required:true
    }
},{timestamp:true})
module.exports = mongoose.model('Room',roomSchema)