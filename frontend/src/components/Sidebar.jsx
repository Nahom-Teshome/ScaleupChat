import React from 'react'
import { useUserContext } from '../hooks/useUserContext'
export default function Sidebar(){
    const {user} = useUserContext()

    return(
        <div className="sidebar">
                <div className="sidebar-header">
                    <h5>Profile</h5>
                </div>
                <div className="sidebar-image">
                    <img src={user.imageUrl} alt="" />
                </div>
           
        </div>
    )
}