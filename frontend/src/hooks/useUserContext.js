import  {useContext} from 'react'
import {UserContext}  from '../context/UserContextProvider'

export function useUserContext(){
    const userContext = useContext(UserContext)

    if(!userContext){
        console.error("UserContext must be used within UserContextProvider!")
    }

    return userContext
}