const Message = require('../models/message')
const User = require("../models/user")
const Room = require('../models/room')
// const {myRooms} = require('./roomController')
async function sendMessage(req,res){
        //user/frontend sends message(content) and the receiver Id 
    const {content,receiverId,roomId}= req.body
    const senderId = req.user//Auth middleware sends us the _id of the current logged in user 

    
    try{
        if(receiverId && !roomId)
            // console.log("receiverId found NO roomId: ", receiverId)
            {

                if(senderId === receiverId){// one shouldn't talk to self 
                    throw Error("Can't talk to self")
                }
                
                const exists = await User.findOne({_id:receiverId})//grab the receiver user
                
                if(!exists){// if the receiver user doesn't exist throw error
                    throw Error("The Person you are trying to reach does not exist")
                }
                
                //create a message with properties= content/message , senderId,and recieverID
                const message = await Message.create({content,sender_id:senderId,receiver_id:receiverId})

                if(!message){//if message wasn't created then throw and error
                    
                    throw Error("Couldn't send Message")
                }
            //  console.log("receiverId send message: ", message)
                res.status(200).json({message})//send the message that was created to the frontend(to be displayed)
            }
            if(roomId && !receiverId)
            {
                 //create a message with properties= content/message , senderId,and recieverID
                 const message = await Message.create({content,sender_id:senderId,room_id:roomId})

                 if(!message){//if message wasn't created then throw and error
                     
                     throw Error("Couldn't send Message")
                 }
            // console.log("roomId send message: ", message)
                 res.status(200).json({message})//send the message that was created to the frontend(to be displayed)
            }
    }
    catch(err){
        res.status(400).json({Error:err.message})// catch and forward the error to the frontend
    }
}

async function receiveMessage(req,res){
    //to see the you messages from one particular user 
    const receiverId = req.user//Auth middleware gives us the user that is currently logged in 
    const {senderId,roomId} = req.params//frontend must send the id of the user whose messages the logged-in user wants to see 

//    console.log("receiveMessage controller: req.params: ",req.params)

    try{
       if(!roomId && !senderId){
             console.log("NO SENDER OR ROOM ID FOUND ")
       }
        if(!roomId && senderId)
        {
        
         console.log("SenderId Found NO roomid",senderId)
            if(senderId === receiverId){// if the both sender and receiver id's match then throw error
        //  console.log("You haven't been talking to self")
                throw Error("You haven't been talking to self")
            }
            const exists = await User.findOne({_id:senderId})// use the id of the sender(user whose messages current-logged-in-user wants to see) to check if such user exists

            if(!exists){// if the sender doesn't exist throw an error
                
                throw Error("Sender Unknown")
            }
            // console.log("user exists: ",exists)
        
            // if sender user does exist ,then get a message that has a "sender_id" of (user whose messages logged-in-user wants to see) and a receiver_id of (current Logged in user)
            const message = await Message.find({
            $or:[
                        {sender_id:senderId,receiver_id:receiverId},
                        {receiver_id: senderId, sender_id: receiverId },
                ],
                    }).sort({createdAt:-1})//sort the messages by time of creation .
                    if(message.length < 1){// if messages array is empty throw an error
                //   console.log('You have no messages from user')
                        throw Error("You have no messages from user")
                    }
                    const text = message.map(text=>{return text.files?({content:text.content,files:text.files,sender_id:text.sender_id,receiver_id:text.receiver_id,createdAt:text.createdAt}):{content:text.content,sender_id:text.sender_id,receiver_id:text.receiver_id,createdAt:text.createdAt}})// for neatness. map over messages array and assign the message property to text. We need the sender_id because that is how we know which side to display the message

                  
                // console.log("senderId query message: ", message[0])
                    res.status(200).json({message:text})// send the messages 
        }    
        if(roomId && !senderId)
        {
            console.log("RoomId Found NO SenderId",roomId)
           
            if(senderId === receiverId){// if the both sender and receiver id's match then throw error
        
                throw Error("You haven't been talking to self")
            }
        
            const message = await Message.find({room_id:roomId }).sort({createdAt:-1})//sort the messages by time of creation .
                    if(message.length < 1 || !message){// if messages array is empty throw an error
                //  console.log("you have no messages")
                        throw Error("You have no messages from user")
                    }
                    const text = message.map(text=>{
                        return (text.files?{content:text.content,files:text.files,room_id:text.room_id,sender_id:text.sender_id,createdAt:text.createdAt}:{content:text.content,room_id:text.room_id,sender_id:text.sender_id,createdAt:text.createdAt})})// for neatness. map over messages array and assign the message property to text
                  
                //  console.log("roomId query message: ", message[0])
                    res.status(200).json({message:text})// send the messages 
        }

    }
    catch(err){
        res.status(400).json({Error:err.message})
    }
}

async function getAllMessages(req,res){//not in use at the moment
    const id = req.user

    try{
        if(!id)
        {
            throw Error("Not Authorized")
        }

        const exists = await User.find({_id:id})

        if(!exists)
        {
            throw Error("Your Id doesn't exist the database")
        }

        const messages = await Message.find({
            $or:[
                {sender_id:id},
                {receiver_id:id},
            ],
        }).sort({createdAt: -1})

        if(messages.length<1)
        {
            console.log('user has no messages')
            throw Error("user has no messages")
        }
        
        // console.log("messages from getAllMessages: ",messages[1])
        res.status(200).json({messages})
    }
    catch(err)
    {
        res.status(400).json({Error:err.message})
    }
}
async function getLastMessage(req,res){
    const id = req.user

    try{
        if(!id){
            console.log("You aren't logged in client")
            throw Error("You aren't logged in client")
        }
        //does the user Exist?
        const exist = await User.findOne({_id:id})
        if(!exist){
            console.log("You aren't signed up, user isn't found")
            throw Error("You aren't signed up, user isn't found")
        }
console.log("user does exits :",exist.name)
        const messagesIds = await Message.find({
            $or:[
                {sender_id:id},
                {receiver_id:id}
            ],
        },{sender_id:1,receiver_id:1})// this gets all messages that were either sent by or sent to logged-in user. specifically gets the sender_id and receiver_id of the messages

        if(!messagesIds){
            console.log("Lonely in here . talk to people more, NO MESSAGES FOUND!")
            throw Error("Lonely in here . talk to people more, NO MESSAGES FOUND!")
        }
// console.log("MY ROOMS FROM ROOM CONTROLLER IN MESSAGEController: ", myRooms)
        let users = new Set()
        messagesIds.map(messages=>{

            users.add(messages.sender_id)
            users.add(messages.receiver_id )
        })// i add the both the sender_id and receiver_id to a set to avoid duplicates and that gives me the users that the logged-in user has been talking to. I can then use those id's to get the conversation between the two and fetch the last messages
             // console.log("messagesIds added to a set to avoid duplication: ",users)
             const lastMessages = []
             const roomes =await myRooms(id)
             console.log('MYROOMS IN GETLASTMESSAGE() MESSAGE CCONTROLLER: ',roomes)
             if(myRooms )
                {
                let userRoomsId = []
                    userRoomsId= roomes

                userRoomsId.map(room =>{
                    users.add(room._id.toString())
                    })

                    // myRooms.clear()// myRooms must be cleared ,if not then when other users log on it will retain it's values and we will send unneccesary data
                }
            const userIDs = [ ...users]
            
            for(let i = 0 ; i < userIDs.length; i++)
                {
                    if( userIDs[i] !== undefined && userIDs[i]!== id)
                    {
                        console.log("ids of users: ",userIDs[i])

                        lastMessages.push(await Message.findOne({
                                $or:[
                                    {sender_id:userIDs[i], receiver_id:id},
                                    {receiver_id:userIDs[i],sender_id:id},
                                    {room_id:userIDs[i]}
                                    ]
                                }).sort({createdAt:-1}).limit(1)//sort({createdAt:-1}) fetches the last entry first and so .limit(1)makes it so that it only fetches one(the last one)
                                )
                    }
                }
            //   
           console.log(" last messages: " ,lastMessages.map(last => (last.content? last.content:last.files  )))
        res.status(200).json({message:'Success',lastMessages})
    }
    catch(err){
        console.log("err in getLastMessage: ",err)
        res.status(400).json({Error:err.message})
    }
}
async function myRooms(id){

    try{
     
        // const exists = await Room.find({participants:{$in:[id]}})//look in the database and check if my (id) is among the id's in participants list
           
        const exists = await Room.find({
            participants:{
              $elemMatch:{id:id}
            }})
           
        if(!exists){
            //  console.log("Can't find Room with those Credentials")
                throw Error("Can't find Room with those Credentials")
        }
        let roomse = new Set()
        exists.map(room=> (roomse.add(room)))
    // console.log("Rooms Available to you: ", exists)
      return(exists)
        }
    catch(err)
        {
            
    // console.log("error: ",err.message)
        return({Error:err.message})       
        }
}
module.exports = {sendMessage,receiveMessage,getAllMessages,getLastMessage}// export the function which will be called when a request is made from the path specified messageRoutes