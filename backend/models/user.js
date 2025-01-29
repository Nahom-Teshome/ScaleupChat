const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')// for encrypting the password
const validator = require('validator')//checking for strong password and a valid email

    //a user document must have an email,name,password ,role and time of creation
const userSchema = new Schema(
    {
        email:{
             type:String,
             required:true
            },
        name:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        },
        role:{
            type:String,
            default:'user'
        }
    },
    {timestamp:true}
)

    // this is a custom method attached to the schema which will be called when users signup(userSignup in '../controllers/userController')
userSchema.statics.signup=async function (name,email,password,role){
        //
    let missing = []
        if(!email){
            missing.push('email')
        }
        if(!password){
            missing.push('password')
        }
        if(!name){
            missing.push('name')
        }
        if(!role){
            missing.push('role')
        }
    if(missing.length > 0 ){
        console.log("missisng items ", missing)
        throw Error('please fill out all fields', missing)
        //everything in above (within signup() ) is to make sure all feilds are populated and if not we add them to the missing[] and finally if missing[] has any data we throw an error 
    }

    if(!validator.isEmail(email)){//checks for email validity
        throw Error('Please use a valid email address')
    }
    if(!validator.isStrongPassword(password)){//checks the strength of the password
        throw Error('Please use a strong password')
    }
        //given all checkes are passed we use the email and grab the user if one exists
    const exists = await this.findOne({email})
    if(exists){// if a user exists the user can't signup with that email
        throw Error(`The email ${email} is already linked to an account`)
    }

    //if a user doesn't exist encrypt the password
    const salt = await bcrypt.genSalt(10)// bcrypt will create a salt for us after 10 salt rounds
    const hash = await bcrypt.hash(password, salt)// create the hash that we store in the DB

    const user = await this.create({email,name,password:hash,role})//creating the user
   
    if(!user){
        throw Error("User could not be created")
    }
    //only return the user info without the password
    return {name:user.name,email:user.email,role:user.role,_id:user._id}
}

//another custom method . THis one is for  logging in and is called by "userLogin"in "../controllers/messageController.js"
userSchema.statics.login = async function(email,password){
   
    let missing = []
    if(!email){
        missing.push('email')
    }
    if(!password){
        missing.push('password')
    }
    if(missing.length > 0){
        throw Error('Both Password and Email are required')
    }
// we perform the same check on the input provided 


        const user = await this.findOne({email})//grab the user with the email sent from frontend
       
        if(!user){
            //if user doesn't exist throw an error
            
            throw Error(`Couldn't find user with email: ${email}`)
        }
        
        const valid = await bcrypt.compare(password, user.password)//bcrypt compare compares the password sent from the frontend(user logging in ) and the hashed password stored in DB of the user(user we grabbed using the email) 
        if(!valid){
            // if the passwords don't match throw and error
            throw Error('Incorrect Password')
        }
            //don't return the password
        return {name:user.name,email:user.email,role:user.role,_id:user._id}
    
}

module.exports = mongoose.model('User',userSchema)//create a collection called " Users" the "s " is added by mongoose and then  export the User schema