import { useContext } from 'react'
import { SocketContext} from '../context/SocketContextProvider'


export function useSocketContext(){
    const socketContext = useContext(SocketContext)
    
    if(!socketContext){
        console.log("socketContext must be used with SocketContextProvider")
    }

    return socketContext
}