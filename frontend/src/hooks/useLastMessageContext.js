import {useContext} from 'react'
import { LastMessageContext } from '../context/LastMessgeContextProvider'


export function useLastMessageContext(){
    const lastMessageContext = useContext(LastMessageContext)

    if(!lastMessageContext ){
        console.log("lastMessagesContext must be used with LastMessagesContextProvider component")
    }
    return lastMessageContext
}