import React from 'react'
import {Route,Navigate,BrowserRouter,Routes} from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ChatPage from './ChatPage'
import CreateGroup from './components/CreateGroup'
import { useUserContext } from './hooks/useUserContext'

export default function App(){
    const {user} = useUserContext()
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>} >
                    <Route path="chat" element={!user? <Navigate to="/login"/> :<ChatPage/>}/>
                    <Route path='group' element={<CreateGroup/>}/>
                    <Route path="login" element={!user?<Login/>:<Navigate to="/chat"/>}/>
                    <Route path="signUp" element={!user?<SignUp/>:<Navigate to="/chat"/>}/>
                    <Route path="group" element={<CreateGroup/>}/>
                </Route>
            </Routes>
        </BrowserRouter>
    )
}