import { useUserContext } from "./useUserContext";
import {useSocketContext} from './useSocketContext'
import React from 'react'
export function useLogin(){
    
    const {dispatch} = useUserContext()
    const {dispatch:socketDispatch,socket} = useSocketContext()
    const [error,setError] =React.useState(null)
    const login= async(email,password)=>
        {

            try{
                setError(null)
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/login`,{
                        method:'POST',
                        headers:{'Content-Type':'application/json'},
                        credentials:"include",
                        body:JSON.stringify({email,password})
                    })
                    
                    if(!res.ok){
                        const dataError =await  res.json()
                        setError(dataError.Error)
                        console.log(dataError.Error)
                    throw new Error(dataError.Error)
                    }
                    const data=await  res.json()
                    console.log("Login Successful, data: ", data )
                    dispatch({type:"LOGIN",payload:data.user})
                    // setCurrentUser(data.user)
                    socket.on('online',(arg)=>{
                        console.log("list of online users in useLogin: ", arg)
                        socketDispatch({type:'ADD_ONLINE_USER',payload:arg})
                    })
                }
                catch(err)
                {
                    console.log("Error in Login: ",err)
                }
         }
         
         return {login,error}
}
