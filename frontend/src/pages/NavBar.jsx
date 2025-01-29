import React from 'react'
import {Navigate,Link} from 'react-router-dom'
import { useUserContext } from '../hooks/useUserContext'
import { useLogout } from '../hooks/useLogout'
export default function NavBar(){
    const {user} = useUserContext()
    const {logout} = useLogout()

    const handleLogout= async(e)=>{
        e.preventDefault()
        console.log("Loggin Out")
        await logout()
    }
    return(
        <div className="navbar">
            {!user? <h2 className="title--navbar"><Link to="/">ScaleChat</Link></h2>:
            <h2 className="title--navbar"><Link to="/">{user.name}</Link></h2>}
            
           {!user? <div className="register--navbar">
                <h5 className="login--navbar"><Link to="login">Login </Link></h5>
                <h5 className="signup--navbar"><Link to="signup">SignUp </Link></h5>
            </div>:
            <div className="register--navbar">
                <h3 className="chat--navbar"><Link to="chat">Chat </Link></h3>
                <h3 className="group--navbar"><Link to="group">Group </Link></h3>
                <button onClick={handleLogout}>Logout</button>
               
            </div>}
        </div>
    )
}