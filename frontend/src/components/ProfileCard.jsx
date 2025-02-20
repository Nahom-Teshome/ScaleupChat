import React from 'react'
import UpdateUser from './UpdateUser'
import Sidebar from './Sidebar'
import { useUserContext } from '../hooks/useUserContext'
export default function ProfileCard({children,userId,classname}){//classname is used to handle user-list-profile because it needs a margin to align 
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
    React.useEffect(()=>{
        const clickOutside=(event)=>{

            if(profileForm && !event.target.closest('.update-profile'))
            {
                setProfileForm(false)
            }
        }
        document.addEventListener('mousedown', clickOutside)//adds an event listener to handle outside clicks 
    },[profileForm])
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