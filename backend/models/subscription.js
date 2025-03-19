const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SubscriptionSchema = new Schema({
    userId:{type:String,required:true,unique:true},
    subscription:{type:Object, required:true}
})

module.exports = mongoose.model('Subscription',SubscriptionSchema)