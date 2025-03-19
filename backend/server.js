const express = require('express')
const app = express()
require('dotenv').config()
const mongoose = require('mongoose')
const {createClient} = require('redis')
const userRoutes = require('./routes/userRoutes')
const messageRoutes = require('./routes/messageRoutes')
const roomRoutes = require('./routes/roomRoutes')
const subscriptionRoutes =require("./routes/subscriptionRoutes")
const initializeSocket = require('./middleware/socketIo')
const cookieParser = require('cookie-parser')
const http = require('http')
const {Server} = require('socket.io')
const webpush = require('web-push')
const server = http.createServer(app)
const cors = require('cors')
const auth = require("./middleware/Auth")
const { subscribe } = require('diagnostics_channel')
        const allowedOrigin = ["https://scaleupchat-test-frontend.onrender.com","http://localhost:5173","https://chat.scaleuptutor.com","http://192.168.69.229:5173","*"]
app.use(cors({
    // origin: process.env.ALLOWED_ORIGIN?.split(',') || [],
    origin: allowedOrigin,// Allow requests only from this origin
    credentials:true,  
    allowedHeaders :['content-type','Authorization'],
    methods: ["GET", "POST","PATCH"],
}));
// app.use(cors({
//     origin:"https://chat.scaleuptutor.com",
//     credentials:true, 
// }))
// const  io = new Server(server,{
//     cors:{
//         origin:"https://chat.scaleuptutor.com",
//         credentials:true, 
//     }})
const  io = new Server(server,{
    cors:{
    //    origin:process.env.ALLOWED_ORIGIN?.split(',') ||[], // Allow connections from your production server
        // origin:"http://localhost:5173", // Allow connections from your development server
        // origin:allowedOrigin,
        origin:allowedOrigin,
        methods: ["GET", "POST","PATCH"],
        credentials: true,
        allowedHeaders:['content-type','Authorization']
    }
})
const client = createClient({
    username:'default',
    password:process.env.REDIS_PASSWORD,
    socket:{
        host:process.env.REDIS_HOST,
        port:process.env.REDIS_PORT
    }
})

client.on('error', err=>{console.log("Redis client Error: ", err)})
client.on('connect', ()=>{console.log("Connected to Redis")})
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY
webpush.setVapidDetails(
'mailto:nahumt77@gmail.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
)

app.use(express.json())//allows json data to be received
app.use(cookieParser())// parses incoming cookie data

app.use('/get',()=>{console.log("get Fired")})
app.use('/api/user',userRoutes)// this is the route for users (signup,logging ...)
app.use('/api/message', messageRoutes)// this is the route for messages (send,receive ...)
app.use('/api/room/',roomRoutes)
app.use('/api/subscribe',subscriptionRoutes)



const port=process.env.PORT || 3000
// server.listen(port,'0.0.0.0', () => {
    //     mongoose.connect(process.env.MONGO_URI)// connects our server to our mongoDb Atlas Db
    //     .then(()=>{
        //         console.log('Connected to MONGO and listening on port: ',port)
        //     })
        //     .catch((error)=>{
            //         console.log('Error in server: ',error)
            //     }
            //     )
            //   });
    server.listen(port,()=>{// start listening for request on port 3000
                mongoose.connect(process.env.MONGO_URI)// connects our server to our mongoDb Atlas Db
    .then(async()=>{
        await client.connect()
        io.on('connection', (socket)=>{initializeSocket(socket,io,client)})
        console.log('Connected to MONGO and listening on port: ',port)
    })
    .catch((error)=>{
        console.log('Error in server: ',error)
    }
    )
    
})
