const Subscription = require('../models/subscription')

async function createSubscription(req,res){
    console.log("createSubscription fired")
    const user = req.user
    const subscription = req.body
    console.log("user in subscription: ",user ,'AND SUBCCRIPTION: ',subscription)
    try{
        const sub = await Subscription.updateOne(
            { userId:user }, // Find by userId
            { userId:user,subscription}, // Set new values
            { upsert: true } // Insert if not found
          )
        if(!sub){
            throw new Error("Subscription not created")
        }
        console.log("Subscription created: ",)

        res.status(200).json({message:'Subscription Created',sub})
    }
    catch(error){
        console.log("error in subscription: ",error)
        res.status(400).json({Error:error.message})
    }
}
module.exports = {createSubscription}