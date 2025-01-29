const express = require('express')
const jwt = require("jsonwebtoken")

// this a middleware that is used to authenticate the users everytime they make a request to see or send a message . It is applied in the messageRoutes

async function auth(req,res,next){
        // grabs the cookies sent automatically by the frontend
    const cookieToken = req.cookies?.authCookie //ensuring cookies exist before getiing "authCookie"
    // console.log("request.cookie: ", req.headers.cookie)
    //checking to see if cookies exists
    
    try{
        if(!cookieToken){
            throw Error("No cookies found")
        }
        // given that the cookies exist or sent from the frontend. We use "jwt.verify" to collect the info stored the token(the ones we signed it with).They are _id and role
        const token = jwt.verify(cookieToken, process.env.SECRET)// we use the 'SECRET'to decode it

        if(!token){//checking if we have the token
            console.log("token not found in  auth: ", token)
            throw Error('No tokens found in cookies')
        }
        // console.log('Token From AUTH middleware: ', token)
        req.user = token._id// attach the _id from the token to the req.user object. which will then always be accessible to  messages controllers. Attaching the id to req.user here allows for it to be  accessed only   through this middleware because we don't attach it anywhere else
        
        next()// ensures that other middleware in the pipeline are accessed next 
    }
    catch(err){
        res.status(400).json({Error:err.message})//return an error to frontend
    }
}

module.exports = auth//export it so we can import it so requests must pass through it in messagesRoutes