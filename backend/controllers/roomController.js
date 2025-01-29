const Room = require("../models/room")
async function createRoom(req,res){
    const {room_name,  participants} = req.body
    const emptyList =[]

    if(!room_name){
        emptyList.push('room_name')
    }
    if(!participants){
        emptyList.push('participants')
    }

    if(emptyList.length > 0){
    //  console.log("All fields must be populated")
        throw Error("All fields must be filled. Missing:",emptyList.map(list=> list) )
    }

    try{
    //  console.log("Participant from createRoom controller: ", participants)
        const room = await Room.create({room_name,participants})

        if(!room){
            console.log("Error: Room was not created")
            throw Error("Room was not created")
        }
    // console.log("Room Created: ", room)

        res.status(200).json({message:room })
    }
    catch(err){
    //  console.log("Error: ",err.message)
        res.status(400).json({Error:err.message})
    }
}
// myRooms will be used to fetch messages(the last messages )of available rooms and its of type "set" because i want to avoid duplicated automatically 
async function getMyRooms(req,res){
   
    const id = req.user
    // console.log('getMyRooms req.id : ', id)
    try{
        if(!id)
            {
            // console.log("Need both RoomId and UserId")
                throw Error("Need both RoomId and UserId")
            }
        // const exists = await Room.find({participants:{$in:[id]}})//look in the database and check if my (id) is among the id's in participants list
           
        const exists = await Room.find({
            participants:{
              $elemMatch:{id:id}
            }})
           
        if(!exists){
            //  console.log("Can't find Room with those Credentials")
                throw Error("Can't find Room with those Credentials")
        }
        let myRooms = new Set()
        exists.map(room=> (myRooms.add(room)))
    // console.log("Rooms Available to you: ", exists)
        res.status(200).json({rooms:exists})
        }
    catch(err)
        {
            
    // console.log("error: ",err.message)
         res.status(400).json({Error:err.message})       
        }
}

// async function getLastRoomMessages
module.exports = {createRoom,getMyRooms}