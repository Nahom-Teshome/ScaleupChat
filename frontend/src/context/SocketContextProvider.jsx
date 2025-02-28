import {useEffect, createContext,useReducer } from "react";
import io from 'socket.io-client'
import { useUserContext } from "../hooks/useUserContext";
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
    useEffect(()=>{
    // console.log('SocketContext UseEffect')
        const connect=async()=>{
            try{
                const newSocket =  io(import.meta.env.VITE_API_URL,{//convert to localhost after
                    transports:["websocket"]
                })
// console.log("SocketContext newSocket: ",newSocket)
                dispatch({type:'CONNECT',payload:newSocket})

                newSocket.on('connect',()=>{
        //  user && console.log("user id from socketContext: ",user._id)
                   user&& newSocket.emit('userOnline',(user._id))

                    newSocket.on('online',(arg)=>{
            // console.log('New list of online users from socketContext: ',arg,"and current user: ",user?.id)
                        dispatch({type:'ADD_ONLINE_USER', payload:arg})
                    })
                })
            }
            catch(err){
                console.log('Error in socketContextProvider: ',err.message)
            }
        }
       
    
            connect()
        
    
    },[user])
    return(
        <SocketContext.Provider value={{...state, dispatch}} >
            {children}
        </SocketContext.Provider>
    )
}
