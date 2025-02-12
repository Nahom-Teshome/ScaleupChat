import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import '../index.css'
import { useUserContext } from '../hooks/useUserContext'
import { useLogin } from '../hooks/useLogin'
export default function Login(){
    const [userCred, setUserCred] = React.useState(null)
    // const [currentUser,setCurrentUser] = React.useState(null)
    const {user} = useUserContext()
    const {login ,error}= useLogin()
    const navigate = useNavigate()
        
   

    const handleChange=(e)=>{
        const {name,value} = e.target
        setUserCred(prev=>{
            return(
                {...prev,[name]:value}
            )
        })

        console.log(userCred)
    }

    const submit=async(e)=>{
        e.preventDefault()
        console.log(userCred)
        await login(userCred.email,userCred.password)
    }
    // <div>{user.name}</div>

    return(
        <div className='login-container cred-container'>
            This is Login
            {user&& navigate('/chat')}
            <form className="login-form form"action="">
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

                    <button onClick={submit}>Login</button>
            </form>
            {error&& <div className="error">
                    {error}
                </div>}
        
        </div>
    )
}