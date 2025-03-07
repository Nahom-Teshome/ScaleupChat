import { useUserContext } from "./useUserContext";
import {useSocketContext}  from './useSocketContext'
import { useLastMessageContext } from "./useLastMessageContext";
export function useLogout(){
    const {dispatch,user} = useUserContext()
    const {dispatch:socketDispatch,socket} = useSocketContext()
    const {dispatch:lastMessagesDispatch} = useLastMessageContext()
    const logout= async()=>{
        try{
           console.log('This is socket from useLogout:',socket)
           socket && socket.emit("disconnection",(user._id))
            console.log(" socket.id ", socket.id)
            socket.disconnect()
            socketDispatch({type:'DISCONNECT'})
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/logout`,{
                method:'POST',
                credentials:'include'
            })

            if(!res.ok){
                const errorData = await res.json()
                throw Error(errorData)
            }
            dispatch({type:'LOGOUT'})
            lastMessagesDispatch({type:'CLEAR'})
            localStorage.clear()
            console.log("Logged out Successfuly")
        }
        catch(err){
            console.log("Error in useLogout(): ",err.message)
        }
    }

    return {logout}
}
