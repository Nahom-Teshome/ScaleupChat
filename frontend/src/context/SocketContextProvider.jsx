import {useEffect, createContext,useReducer,useState,useRef } from "react";
import io from 'socket.io-client'
import { useUserContext } from "../hooks/useUserContext";
import {useCustomUseEffect} from '../hooks/useCustomUseEffect'
import { preconnect } from "react-dom";
    export const SocketContext = createContext()

    export const socketReducer = (state,action)=>{

        // console.log('socketReducer triggered with action-type: ',action.type)
        switch(action.type){
            case 'CONNECT':
                return {...state,socket:action.payload}
            case 'ADD_ONLINE_USER':
                return {...state,onlineUsers:action.payload}
            case 'DISCONNECT':
                return {socket:null}
            default:
                return state
        }
    }

export default function SocketContextProvider({children}){
    const [state,dispatch ] = useReducer(socketReducer,{onlineUsers:null,socket:null})
    const {user} = useUserContext()
    const [localSocket, setLocalSocket] = useState(null)
    const {customUseEffect} = useCustomUseEffect(state.socket)
   
    useEffect(()=>{
    // console.log('SocketContext UseEffect')
        const connect=async()=>{
            try
            {
                const newSocket =  io(import.meta.env.VITE_API_URL,{//convert to localhost after
                    transports:["websocket"]
                })
// console.log("SocketContext newSocket: ",newSocket)
                dispatch({type:'CONNECT',payload:newSocket})

                newSocket.on('connect',()=>{
        //  user && console.log("user id from socketContext: ",user._id)
       
                // setLocalSocket(newSocket)               
                    console.log("Initial Connect with socket.id: ", newSocket.id)
                })
            }
            catch(err)
            {
                console.log('Error in socketContextProvider: ',err.message)
            }
        }

            connect()
    
    },[])
     
       customUseEffect((sock)=>{
            console.log("User has changed in custom useEffect!! socket: ",sock)
            const handleOnlineListener =(arg)=>
                {
                    console.log('New list of online users from socketContext: ',arg,"and current user: ",user?.id,"socket.id: ",sock.id)
                    dispatch({type:'ADD_ONLINE_USER', payload:arg})
                }
           sock.on('online',handleOnlineListener)
            const handleOnlineUsers=()=>
                { 
                    console.log("emitting userOnline event with socket.id:  ",sock.id)
                     sock.emit('userOnline',(user._id))
            
                 }
    
                sock ?  handleOnlineUsers(): console.log(" Either LocalSocket isn't set or User doesn't exist, Reading LOCALSOCKET: ",sock?.id," user.id ",user?._id)
    
      },[user])
    // useEffect(()=>{
        
    //     const handleOnlineListener =(arg)=>
    //         {
    //             console.log('New list of online users from socketContext: ',arg,"and current user: ",user?.id,"socket.id: ",localSocket.id)
    //             dispatch({type:'ADD_ONLINE_USER', payload:arg})
    //         }
    //     localSocket&& localSocket.on('online',handleOnlineListener)
    //     const handleOnlineUsers=()=>
    //         { 
    //              localSocket.emit('userOnline',(user._id))
        
    //          }

    //          user&& localSocket ?  handleOnlineUsers(): console.log(" Either LocalSocket isn't set or User doesn't exist, Reading LOCALSOCKET: ",localSocket?.id," user.id ",user?.id)

    //    return ()=>{
    //     localSocket && localSocket.off("online",handleOnlineListener)
    //    }
    // },[localSocket,user])
    return(
        <SocketContext.Provider value={{...state, dispatch}} >
            {children}
        </SocketContext.Provider>
    )
}
