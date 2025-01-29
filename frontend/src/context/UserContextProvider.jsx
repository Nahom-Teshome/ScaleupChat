import React, { createContext , useReducer} from 'react'


    export const UserContext = createContext()
    export const userReducer = (state,action)=>{
        switch(action.type){
            case 'LOGIN':
                return {user:action.payload}
            case 'SIGNUP':
                return {user:action.payload}
            case 'LOGOUT':
                return {user:null}
            default:
                return state
        }
    }
    export default function UserContextProvider({children}){
        const [state,dispatch] = useReducer(userReducer,{user:null})
        React.useEffect(()=>{
            
            const fetchUser = async()=>{
                try{

                        const res = await fetch('/api/user/currentuser',{
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
                    }
                    catch(err)
                    {
                        console.log("Error from userContext useEffect: ",err)
                    }
            }
                fetchUser()
        //  console.log("useEffect: ","User REGISTERED: ",state.user)
            
        },[])

    return(
        <UserContext.Provider value={{...state,dispatch}}>
            {children}
        </UserContext.Provider>
    )
}