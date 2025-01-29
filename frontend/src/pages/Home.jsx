import {Outlet} from 'react-router-dom'
import NavBar from './NavBar'
import { useUserContext } from '../hooks/useUserContext'
export default function Home(){
    const {user} = useUserContext()
    return(
        <div className="all-parent">
{ user&& (user.role  === 'client') && <NavBar/>}
            {/* This is home */}
            <Outlet/>
        </div>
    )
}