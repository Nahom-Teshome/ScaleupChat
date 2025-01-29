const mongoose = require('mongoose')//an ODM library that is the middleman b/n NODE.js and mognoDb
const Schema = mongoose.Schema

// define a schema, define the structure of the data you want to store in the "Messages" Collection
const messageSchema = new Schema({
    content:{
        type:String,
        required:false
    },
    files:[
        {
        public_id:{type:String,required:true},
        secure_url: {type:String, required:true},
        filename: {type:String, required:false},
        format: {type:String, required:false},
        resource_type: {type:String, required:false},
        bytes:{ type:Number, required:false}
        }
    ],
    sender_id:{
        type:String,
        
    },
    receiver_id:{
        type:String,
        required:false
    },
    room_id:{
        type:String,
        required:false,
        default:'client-to-client'
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})
    
// ,{timestamps:true}   
module.exports = mongoose.model('Message',messageSchema)//export Messages