const User = require('../models/user')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookieparser')
const Message = require('../models/message')
// create a token upon signup and login
const createToken= (_id,role)=>{
    //signature requires all three parameters
    return jwt.sign({_id,role},process.env.SECRET,{expiresIn:'3d'})
}
async function userSignup(req,res){
    //frontend sends name ,email password and role upon signing up and we collect that from req.body
    const {name,email,password} = req.body
    const role = !req.body.role? 'user': req.body.role

    try{
            //User is a schema created and imported from user model
            //it has custom static methods for signup and returns a user{_id,email,role}
        const user = await User.signup(name,email,password,role)// throws errors if any
            //creating token 
        const token = createToken(user._id,user.role)

            // below we are sending cookie named "authCookie" which contains the TOKEN we created above to the frontend
        res.cookie('authCookie',token,{
                 httpOnly:true,//no javascript manipulationddd
                 secure: false, //for production 
                 sameSite:"lax", // must be accessed only when request comes from the same path
                 path:"/",
                //  domain:".onrender.com",
                 maxAge:(60000 * 60 *24)// expiry date for 1 day 60000seconds * 60 * 24
             })
             // below we send back the user object with necessary data
        res.status(200).json({user})
    }
    catch(err){
            //catches errors from the User.signup method as well
        res.status(400).json({Error:err.message})
    }

}

async function userLogin(req,res){
        //frontend sends email password upon logingin and we collect that from req.body
    const {email,password} = req.body
 

    try{
            // User is the Schema defined user model .It also has a method "login" that takes 2 parameters
            console.log("user trying to login with email and password: ", email , password)

        const user = await User.login(email,password)// treturns errors of it's own
            // create token
        const token = createToken(user._id,user.role)
            //sending cookie named "authCookie" which contains the TOKEN we created above ,to the frontend
        res.cookie('authCookie',token,{
                httpOnly:true,
                //  secure:true, 
                 sameSite:'lax',//change to none when in production
                //  domain:".onrender.com",
                 path:"/",
               maxAge:(60000 * 60 *24)
             })
       console.log("userLogin: ",user)
            //Sending  positive response along with the "user " object
        res.status(200).json({user,message:"Logging In"})
    }
    catch(err){
        console.log("login error: ",err.message)
        res.status(400).json({Error:err.message})//catches error and sends them to the frontend 
    }
}
async function updateuser(req,res){
    const id = req.user

    try{
        if(!id){
            console.log("user NOT logged in")
            throw error("user NOT logged in")
        }

        const exists = await User.findOne({_id:id})
        if(!exists){
            console.log("User not recognized")
            throw error("User not recognized")
        }

        const update = await User.updateOne(
            {_id:id,},
            {$set:req.body}
        )
        if(!update){
            console.log("update unsuccessfull")
            throw Error("update unsuccessfull")
        }
        console.log("success updating User: ", update)
        res.status(200).json({message:'Success',update:update})
    }
    catch(err){
        res.status(400).json({Error:err.message})
    }
}

async function getUsers(req,res){
    const senderId = req.user

    // console.log("user id inside getUsers: ", senderId, "REQ.USER: ",req.user)
    if(!senderId){
        throw Error("NO Id Found")
    }

    try{
        const exists = await User.findOne({_id:senderId})

        if(!exists){
            throw Error("You Don't have an Account")
        }
        const users = await User.find()
        // console.log("users ", users)
        res.status(200).json({message:users})
    }
    catch(err){
        res.status(400).json({Error:err.message})
    }
}


async function getCurrentUser(req,res){
    const user_id = req.user
    if(!user_id){
        console.log("user id not found . Auth should attach id first")
    }
    try{
        const user = await User.findOne({_id:user_id})
        if(!user){
            throw Error("No user Found with id: ",user_id)
        }
console.log('get current user :', user.name)
        res.status(200).json({message:`user${user.name} found`, user})
    }
    catch(err){
        res.status(400).json({Error:err.message})
    }
}

async function logout(req,res){
    const id = req.user

    if(!id){
        throw Error("was never logged in")
    }

    try{

            res.clearCookie('authCookie',{
                httpOnly:true,//no javascript manipulationddd
                secure: process.env.NODE_ENV === 'production', //for production 
                sameSite:'lax', // must be accessed only when request comes from the same path
               // expiry date for 1 day 60000seconds * 60 * 24
            })
            console.log("Logged out !")
            res.status(200).json({message:"Logged out"})
        }
    catch(err)
        {
            res.status(200).json({Error:err.message})
        }   

}
let users = new Set()
async function getMyUsers(req,res){
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
    // console.log("user does existed :",exist.name)
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
    
            messagesIds.map(messages=>{
    
                users.add(messages.sender_id)
                users.add(messages.receiver_id )
            })// i add the both the sender_id and receiver_id to a Set to avoid duplicates and that gives me the users the logged-in user has been talking to. I can use those id's to get the conversation between the two and fetch the last messages but right now i will get the users

            const userIds = [...users]//since "users" is a SET i can't loop over it hence why it is spread into an array
            const myUsers =[]

            for(let i = 0 ; i<userIds.length; i++){
                if(userIds[i] !== undefined){
                    // console.log("user id shouldn't be null or undefined: ",userIds[i])
                    myUsers.push( await User.findOne({_id:userIds[i]},{_id:1,name:1,email:1,role:1,imageUrl:1})  )
                }
                }// the loop allows me to fetch all the users and their specific fields and store it in an array
         
// console.log("my users IN GetmyUsers controller : ", myUsers)
            res.status(200).json({message:'Success',myUsers})
        }
        catch(err){
            res.status(400).json({Error:err.message})
        }
}

// exporting functions to use them in the routes(message routes)
module.exports = {userSignup,userLogin,getUsers,getCurrentUser,logout,getMyUsers,users,updateuser}