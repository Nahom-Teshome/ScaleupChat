import React from 'react'
import UpdateUser from './UpdateUser'
import Sidebar from './Sidebar'
import { useUserContext } from '../hooks/useUserContext'
export default function ProfileCard({children,userId,classname}){
   
    const [profileForm,setProfileForm] = React.useState(false)
    const {user} =useUserContext()
        const hideUpdateUser=()=>{
            setProfileForm(false)
        }
        const toggleProfileForm=()=>{
            if(userId === user._id){
                setProfileForm(prev=>!prev)
            }
        }
    // onClick={()=>{setProfileForm(prev=>!prev)}
    return(
        <>
        <div  onClick={toggleProfileForm} className={`profile-card ${classname}`}>
            {children}   
        </div>
       {/* { profileForm && <Sidebar/>} */}
         {profileForm  &&   <UpdateUser 
                                profileForm={hideUpdateUser}
                            />   }      
        </>
    )
}