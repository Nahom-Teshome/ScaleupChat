import React from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import '../index.css'
import { useUserContext } from '../hooks/useUserContext'
import { useLogin } from '../hooks/useLogin'
import Loading from '../components/Loading'
export default function Login(){
    const [userCred, setUserCred] = React.useState(null)
    // const [currentUser,setCurrentUser] = React.useState(null)
    const {user} = useUserContext()
    const {login ,error,isLoading}= useLogin()
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
            <div className="login-wrapper">

           
                <img className="login-background" src="https://i.pinimg.com/736x/65/b3/fb/65b3fb3b402d47686da415366f151297.jpg" alt="" />
            {isLoading&& <Loading/>}
                {user&& navigate('/chat')}
                <div className="login-form-container">
                    <h1 className='login-form-title' >SCALEUP CHAT</h1>
                    <h3 className='login-form-message'>Welcome Back!</h3>
                    <form className="login-form form"action="">
                            <label className="login-form-lable" htmlFor="name">Name</label>
                            <input type="text"
                                id="name"
                                name="name"
                                placeholder='user name'
                                onChange={(e)=>{handleChange(e)}} />

                            <label className="login-form-lable" htmlFor="email">Email</label>
                            <input type="text"
                                id="email"
                                name="email"
                                placeholder='email address'
                                onChange={(e)=>{handleChange(e)}} />

                            <label className="login-form-lable" htmlFor="password">Password</label>
                            <input type="password"
                                id="password"
                                name="password"
                                placeholder='password'
                                onChange={(e)=>{handleChange(e)}} />

                            <button onClick={submit} disabled={isLoading}>Login</button>
                    </form>
            {error&& <div className="error">
                    {error}
                </div>}
                </div>    
            </div>
        </div>
    )
}