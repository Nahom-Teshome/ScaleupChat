import { useUserContext } from "./useUserContext";
// import {useSocketContext} from './useSocketContext'
import {useNavigate} from 'react-router-dom'
import React from 'react'
// import io from 'socket.io-client'
import { useLastMessageContext } from "./useLastMessageContext";

export function useLogin(){
    
    const {dispatch} = useUserContext()
    // const {dispatch:socketDispatch} = useSocketContext()
    const [error,setError] =React.useState(null)
    const {dispatch:lastMessageDispatch} = useLastMessageContext()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = React.useState(false)
    const [socketState, setSocketState] = React.useState(false)
    const login= async(email,password)=>
        {

            try{
                setError(null)
                setIsLoading(true)
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
                   await getLastMessages()
                   setSocketState(true)
                    // setCurrentUser(data.user)
                    // socket.on('online',(arg)=>{
                    //     console.log("list of online users in useLogin: ", arg)
                    //     socketDispatch({type:'ADD_ONLINE_USER',payload:arg})
                    // })
                    navigate('/chat')
                    
                }
                catch(err)
                {
                    console.log("Error in Login: ",err)
                }
                finally{
                    setIsLoading(false)
                }
         }
         
                const getLastMessages =async()=>{
                    try{
                        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/message/receive/lastmessages`,{
                            method:'GET',
                            credentials:'include'
                        })
                        
                        if(!res.ok){
                            const errorData = await res.json()
                            console.log('Error in !res.ok: ',errorData)
                            throw Error(errorData)
                        }
                        console.log("Getting all data success!!!")
                        const data = await res.json()
                
                
                        console.log("last Messages: ",data)
                    lastMessageDispatch({type:"LOAD",payload:data.lastMessages,Location:" logIn"})
                        console.log("last Message Dispatch fired from Use LOGIN :")
                    }
                    catch(err){
                        console.log('Error in getAllMessages: ',err)
                    }
                }
               
         return {login,error,isLoading,socketState}
        }

