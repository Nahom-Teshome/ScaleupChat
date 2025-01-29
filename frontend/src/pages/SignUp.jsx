
import React from 'react'
import '../index.css'


export default function SignUp(){
    const [userCred, setUserCred] = React.useState(null)


    const signIn=async()=>{
        try{
            const res = await fetch('/api/user/signup',{
                method:'POST',
                headers:{'Content-Type': 'application/json'},
                body:JSON.stringify(userCred)
            })
            if(!res.ok){
                const dataError = await res.json()
                throw Error(dataError.Error)
            }
            const data =await res.json()
            console.log("Successfully Signed Up: ", data)
        }
        catch(err){
            console.log("Error in SignUp: ", err)
        }
    }
    const handleChange=(e)=>{
        const {name,value} = e.target
        setUserCred(prev=>{
            return(
                {...prev,[name]:value}
            )
        })

        console.log(userCred)
    }

    const submit=(e)=>{
        e.preventDefault()
        console.log(userCred)
        signIn()
    }

    return(
        <div className='signIn-container cred-container'>
            This is SignUp

            <form className="signup-form form"action="">
                    <label htmlFor="name">Name</label>
                    <input type="text"
                           id="name"
                           name="name"
                           onChange={(e)=>{handleChange(e)}} />

                    <label htmlFor="email">Email</label>
                    <input type="text"
                           id="email"
                           name="email"
                           onChange={(e)=>{handleChange(e)}} />

                    <label htmlFor="password">Password</label>
                    <input type="password"
                           id="password"
                           name="password"
                           onChange={(e)=>{handleChange(e)}} />

                    <button onClick={submit}>SignIn</button>
            </form>

            {/* {userCred && <div>
              Name: <h5>{userCred.name}</h5>
              Email:<h5>{userCred.email}</h5>
              Password:<h5>{userCred.password}</h5>
            </div>} */}
        </div>
    )
}
