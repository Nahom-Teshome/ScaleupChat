const express = require('express')
const app = express()
require('dotenv').config()
const mongoose = require('mongoose')
const userRoutes = require('./routes/userRoutes')
const messageRoutes = require('./routes/messageRoutes')
const roomRoutes = require('./routes/roomRoutes')
const initializeSocket = require('./middleware/socketIo')
const cookieParser = require('cookie-parser')
const http = require('http')
const {Server} = require('socket.io')
const server = http.createServer(app)
const cors = require('cors')
const auth = require("./middleware/Auth")
        const allowedOrigin = ["https://scaleupchat-test-frontend.onrender.com","http://localhost:5173","http://192.168.8.72:5173"]
app.use(cors({
    // origin: process.env.ALLOWED_ORIGIN?.split(',') || [],
    origin: allowedOrigin,// Allow requests only from this origin
    credentials:true,  
    allowedHeaders :['content-type','Authorization'],
    methods: ["GET", "POST","PATCH"],
}));
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

app.use(express.json())//allows json data to be received
app.use(cookieParser())// parses incoming cookie data
// app.use((req,res,next)=>{
//     // req.io = io
//     next()
// })
// app.get('/', (req, res) => {
//     console.log('Mobile Request')
// })
// io.on('connection ',(socket) => {
//         console.log("User connected ",socket.id);
       
//         socket.on("disconnect", () => {
//             console.log("A user disconnected:", socket.id);
//           });
//   })

app.use('/api/user',userRoutes)// this is the route for users (signup,logging ...)
app.use('/api/message', messageRoutes)// this is the route for messages (send,receive ...)
app.use('/api/room/',roomRoutes)

io.on('connection', initializeSocket)


const port=process.env.PORT || 3000
server.listen(port,'0.0.0.0', () => {
    mongoose.connect(process.env.MONGO_URI)// connects our server to our mongoDb Atlas Db
    .then(()=>{
        console.log('Connected to MONGO and listening on port: ',port)
    })
    .catch((error)=>{
        console.log('Error in server: ',error)
    }
    )
  });
// app.listen(port,()=>{// start listening for request on port 3000
//     mongoose.connect(process.env.MONGO_URI)// connects our server to our mongoDb Atlas Db
//     .then(()=>{
//         console.log('Connected to MONGO and listening on port: ',port)
//     })
//     .catch((error)=>{
//         console.log('Error in server: ',error)
//     }
//     )
    
// })
