
const User = require('../models/user')
const Message = require('../models/message')
const jwt = require('jsonwebtoken')
const cookie = require('cookie')
const cloudinaryConfig = require("./cloudinary")
const cloudinary = require('cloudinary').v2
const {Transformation} = require("cloudinary")
const multer = require('multer')
const upload = multer({storage:multer.memoryStorage(),
                       fileFilter:(req,file,cb)=>{
                            cb(null,true)//always accept the files
                       }
})
let onlineUsers = new Set()

module.exports =(socket,io)=>{
    
    
            let cookieHeader =socket.handshake?.headers.cookie
            if(!cookieHeader){
             console.log('NO Cookies found in socket middleware')
               socket.emit('error',{message:'NO Cookies found'})
                 return
            }
            // TODO: H
            // console.log("Cookie Socket: ", cookieHeader)
            
            //the cookie contains other information like sessionId and other values that the jwt.verify can't decode . so i have filtered out the token and stored in "auth" to the give it to verify.
            // let auth = cookie.split(' ')[2].split('=')[1].split(';')[0]
            
            let parsedCookies = cookie.parse(cookieHeader)
            
            
                
                let auth = parsedCookies.authCookie
                if(!auth){
                    
                    console.log("no auth cookie sent in socket ")
                    socket.emit('error',{message:"auth token not found in socket"})
                    socket.disconnect()
                    return
                    throw new Error("No auth cookie sent")
                }
            // console.log("auth cookie: ",auth)
                let token = jwt.verify(auth,process.env.SECRET)
            // console.log("token Socket: ", token)
                let user_id = token._id
                
                
                console.log("User_id Socket: ", user_id,socket.id)
                
                socket.user_id = user_id
                
                
                
                // socket.user_id ="6773e68710454a240aad1f00"
            
     
        
           
         
        
        console.log("Connection Established . user: ",socket.user_id)
        socket.on('userOnline',(userId)=>{//logged in user send's his/her id when logged in
            console.log("currentuser. sent from frontend: ",userId ,"and socket.id: ",socket.id)
          
                onlineUsers.add(userId)//userid is added to OnlineUsers set . so every user that logs in is added to this
                
            
                io.emit('online',[...onlineUsers])//onlineUsers id's are sent as an array to all rooms
            console.log("list of online users: broadcasted", onlineUsers)
            
        })
        socket.on('private-Room',async(selectedUserId)=>{
            
                       if(selectedUserId){
                            console.log("sokcet.selectedUserId does exits")
                        const message = await Message.find({
                                  $or:[
                                              {sender_id:selectedUserId,receiver_id:socket.user_id},//socket.selectedUserId is the id of the selected user
                                              {receiver_id:selectedUserId, sender_id:socket.user_id },
                                      ],
                                          }).sort({createdAt:-1}).limit(20)//sort the messages by time of creation .
                                          if(message.length < 1){// if messages array is empty throw an error
                                              console.log('You have no messages from user: socketIo,',message)
                                              throw Error("You have no messages from user")
                                          }
                                          const text = message.map(text=>{return text.files?({content:text.content,files:text.files,sender_id:text.sender_id,receiver_id:text.receiver_id,createdAt:text.createdAt}):{content:text.content,sender_id:text.sender_id,receiver_id:text.receiver_id,createdAt:text.createdAt}})// for neatness. map over messages array and assign the message property to text. We need 
                    console.log(socket.id,"loading messages for user",text.length)
                    console.log("user joined rooms: ",socket.rooms)
                    io.to(socket.user_id).emit('load-user-Messages',text)
                  }
                  else{console.log('socket.selectedUserId: ',socket.selectedUserId)}
                
            })
            socket.on('group-Room',async(roomId=null)=>{
                if(socket.rooms.has(roomId)){
                    socket.join(roomId)
                    console.log(`A room Id was passed: Trying to join Group! with Room Id ${roomId}`)
                    const message = await Message.find({room_id:roomId }).sort({createdAt:-1}).limit(20)//sort the messages by time of creation .
                    if(message.length < 1 || !message){// if messages array is empty throw an error
                                    //  console.log("you have no messages")
                                            throw Error("You have no messages from user")
                                        }
                                        const text = message.map(text=>{
                                            return (text.files?{content:text.content,files:text.files,room_id:text.room_id,sender_id:text.sender_id,createdAt:text.createdAt}:{content:text.content,room_id:text.room_id,sender_id:text.sender_id,createdAt:text.createdAt})})// for neatness. map over messages array and assign the message property to text
                    console.log(`socketio middleware: loading messages!! for room: ${roomId}`,text.length)
                    console.log("USER JOINED ROOM: ", socket.rooms)

                    io.to(roomId).emit('load-group-Messages',text)//emit loadMessage event as soon as user joins group
                    
                }
                else{console.log(`${roomId} does not exist in rooms. looking at socket.id: ${socket.id}`)}
                // console.log("All rooms on the server:", io.sockets.adapter.rooms);

            })
            
                socket.on('sendMessage',async(data)=>{
                        const {receiverId,content,senderId,file} = data

                        const {roomId} =data
                        
                        if(!roomId){// one to one messaging 
                            // console.log("No roomId: receiverId: ",receiverId)
                            // console.log('sent from frontend receiverId: ', receiverId)
                            //user exists?
                            const exists = await User.findOne({_id:receiverId})

                            if(!exists)
                                {
                                console.log("ERROR, User doesn't exist")
                                socket.emit("ERROR, User doesn't exist")
                                return 
                            }
                            const message = await Message.create({receiver_id:receiverId,sender_id:socket.user_id,content,files:file})// this is one to one messaging so the message has both receiver and sender id but on the group(room)messaging the message only has sender_id and that is what we will be using
                             
                            message&&   console.log("message added to db: ", message)// if message exists show it 
                                console.log(socket.id,"user joined room: ",socket.rooms)
                        //notify the receiver of the incomming message
                     socket.to(receiverId).emit('receiveMessage',message)
                        
                    }
                    if(roomId){
                        const groupExists = await Message.find({room_id:roomId})
                        if(!groupExists){
                            socket.emit('Error',`Group with id ${roomId} doesn't exists`)
                            return
                        }
                        const message = await Message.create({room_id:roomId,sender_id:socket.user_id,content,files:file})// here we are sending the message, so that means the sender_id = the user_id from cookie token. we also need the sender_id to determine which side the message should be displayed on
                        
                        message&&   console.log("message added to db: ", message)// if message exists show it 
                        message && console.log("Message emitted to room: ", roomId)
                        console.log(socket.id,"USER JOINED ROOM: ", socket.rooms)
                        socket.to(roomId).emit('receiveMessage',message)
                    }
                    
                })      
                socket.on("loadMoreMessages",async({roomId,page})=>{//listening for "loadMoreMessages" event from frontend

                    console.log("loadMoreMessages event triggered from frontend: with page: ", page, 'roomId: ',roomId)
                    const pageSize = 20 
                    if(roomId)
                        {
                            const message = await Message.find({room_id:roomId }).sort({createdAt:-1}).skip(page*pageSize).limit(20)//sort the messages by time of creation .
                        
                        if(message.length < 1 || !message){// if messages array is empty throw an error
                            console.log("you have no messages", message.length)
                            // throw Error("You have no messages from user: ", message)
                        }
                   
                        const text = message.map(text=>{
                            return (text.files?{content:text.content,files:text.files,room_id:text.room_id,sender_id:text.sender_id,createdAt:text.createdAt}:{content:text.content,room_id:text.room_id,sender_id:text.sender_id,createdAt:text.createdAt})})// for neatness. map over messages array and assign the message property to text
                        console.log("Setting olderMessages: ", text.map(text=>text.content))
                        console.log("emitting olderMessages data to frontend:",)
                        // io.sockets.adapter.rooms 
                        socket.emit('olderMessages',text)
                    }
            })
            socket.on("disconnect",()=>{
                onlineUsers.delete(socket.user_id)
                socket.broadcast.emit('online',[...onlineUsers])
                // console.log("this is socket id: ",socket.id)
                console.log("user ", socket.user_id," disconected")
            })
            
            
            
            socket.on('joinrooms',({rooms})=>{
                    socket.join(socket.user_id)//joining own room Automatically then also join rooms when the rooms load
                    console.log(socket.id,"joining own room Automatically then also join rooms when the rooms load: ",socket.user_id)
                    if(Array.isArray(rooms))
                    {
                        rooms.forEach((room)=>{
                            socket.join(room._id)
                            // console.log(`Room : ${room._id} joined`)
                        })
                    }
                    else(console.log("Room is not an array"))
    
                        // console.log("socket.rooms",socket.rooms)
                 
                   
            })
        }
        
        const handleUploadfiles=async(formData)=>{
            return new Promise((resolve,reject)=>{
                upload.array('userfiles')(formData,(err,file)=>{
                if(err){
                    reject(err)
                }
                else{
                    resolve(file)
                }
            })
        })
    }
    // cloudinary.config(cloudinaryConfig)
    const uploadCloudniary = async(file)=>{
        return new Promise((resolve,reject)=>{
            const uploadStream = cloudinary.uploader.upload_stream({resource_type:'auto'},(result,err)=>{
                if(err){
                    reject(err)
                }
                else{
                    resolve(result)
                }
            })// uploadStream is a writable stream obj created by cloudinary .the callback will be called when the upload is complete or an error occurs
        uploadStream.on('progress', (progress) => {
            console.log(`Upload progress: ${progress.bytes_uploaded} / ${progress.total_bytes}`);
        });
        uploadStream.end(file.buffer)
    })
}
            // console.log("file in socketIo: ",file)
            // const downloadUrl = await getDownloadUrl(file)
            //add the download url ***
            // console.log("file in socketIo with dowloadUrl: ",file)
            //                         const files =await handleUploadfiles(formData)
            //                         const cloudinaryResults = await Promise.all(files.map(uploadCloudniary))
            
            // console.log("CloudinaryResults: ", cloudinaryResults)
         // function getDownloadUrl(file){
            //     const public_id= file.public_id
            //     const  originalFileName= file.fileName
            //     const download_url = cloudinary.url(public_id,{
            //        flags:"attachment",
            //        filename:originalFileName
            //     })
            //     console.log("download Url: ", download_url)
            //     return download_url
            // }