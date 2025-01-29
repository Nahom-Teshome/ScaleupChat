import {createContext,useReducer,useEffect} from 'react'
import { useUserContext } from '../hooks/useUserContext'
    export const LastMessageContext = createContext()


    export const lastMessageReducer =(action,state)=>{
        switch(action.type){
            case 'LOAD':
                return {lastMessage:action.payload}
            case 'CLEAR':
                    return {lastMessage:null}
                default:
                    return state
        }
    }

export default function LastMessageContextProvider({children}){
    const [state,dispatch] = useReducer(lastMessageReducer,{lastMessage:null})
    const {user} = useUserContext()
    useEffect(()=>{
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
               dispatch({type:"LOAD",payload:data.lastMessages})
            }
            catch(err){
                console.log('Error in getAllMessages: ',err)
            }
        }
        getLastMessages()
      
    },[user])
    return(
        <LastMessageContext.Provider value={{...state,dispatch}}>
            {children}
        </LastMessageContext.Provider>
    )
}
