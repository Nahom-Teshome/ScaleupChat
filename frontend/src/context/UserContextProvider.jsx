import React, { createContext , useReducer} from 'react'
import { useNavigate } from 'react-router-dom'


    export const UserContext = createContext()
    export const userReducer = (state,action)=>{
        switch(action.type){
            case 'LOGIN':
                return {user:action.payload}
            case 'SIGNUP':
                return {user:action.payload}
            case 'UPDATE':
                return {user:{...state.user,imageUrl:action.payload}}
            case 'LOGOUT':
                return {user:null}
            default:
                return state
        }
    }
    export default function UserContextProvider({children}){
        const [state,dispatch] = useReducer(userReducer,{user:null})
        const navigate = useNavigate()
        React.useEffect(()=>{
            if(state.user){
                localStorage.setItem('user',state.user.name)
                console.log("Local Storage user Set to : ", state.user)
            }
        },[state])
        React.useEffect(()=>{
            
            const fetchUser = async()=>{
                try{

                        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/currentuser`,{
                            method:'GET',
                            credentials:'include'
                        })

                        if(!res){
                            const errorData = await res.json()
                            throw Error(errorData)
                        }

                        const data = await res.json()
                        
            //  console.log("data from useContext: ", data)

                        dispatch({type:'LOGIN',payload:data.user})
                        navigate('/chat')
                    }
                    catch(err)
                    {
                        console.log("Error from userContext useEffect: ",err)
                    }
            }
             if(localStorage.getItem('user')){
                fetchUser()//  todo: comment out for the timebeing
             }
        //  console.log("useEffect: ","User REGISTERED: ",state.user)
            
        },[])

    return(
        <UserContext.Provider value={{...state,dispatch}}>
            {children}
        </UserContext.Provider>
    )
}
