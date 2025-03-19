import React from 'react'
import {Route,Navigate,BrowserRouter,Routes} from 'react-router-dom'
import { registerServiceWorker,requestNotificationPermission } from './utils/notificationService'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ChatPage from './ChatPage'
import CreateGroup from './components/CreateGroup'
import { useUserContext } from './hooks/useUserContext'

export default function App(){
    const {user} = useUserContext()
    // const [localUser, setLocalUser] = React.useState(null)
    // React.useEffect(()=>{
    //    setLocalUser(localStorage.getItem('user'))
    //    console.log("localStorage user in APP.JSX: ", localStorage.getItem('user'))
    // },[])
    React.useEffect(()=>{
        console.log("User.name has changed setting up notification: ", user?.name)
        async function setUpNotification (){
            try{
              const registration = await registerServiceWorker()
              if(!registration){
                throw new Error("registration was not successfull")
              }
                await requestNotificationPermission()
            }
            catch(err)
            {
                console.error("Error setting up Notification: ",err)
            }
        }
        if(user){
            setUpNotification()
        }
    },[user?.name])
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>} >
                    <Route index element={<Login/>}/>
                    <Route path="chat" element={!(user)? <Navigate to="/login"/> :<ChatPage/>}/>
                    <Route path='group' element={<CreateGroup/>}/>
                    <Route path="login" element={!(user)?<Login/>:<Navigate to="/chat"/>}/>
                    <Route path="signUp" element={!(user)?<SignUp/>:<Navigate to="/chat"/>}/>
                    <Route path="group" element={<CreateGroup/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}