import React from 'react'
// import { useRoomIdContext } from '../hooks/useRoomIdContext'

export default function CreateGroup(){
    const [users , setUsers] = React.useState(null)
    const [participants, setParticipants] = React.useState([])
    const [group, setGroup] = React.useState({groupName:''})
    const [usersGroups, setUsersGroups] = React.useState([])
    // const {roomId,dispatch} = useRoomIdContext()
    React.useEffect(()=>{

        const getUsers=async()=>{
// also returns a password FIX QUICKLY
            try{
                const res = await fetch('/api/user/getusers',{
                    method:'GET',
                    credentials:'include'
                })
                if(!res){
                    const errorData = await res.json()
                    throw Error(errorData)
                }
                const data = await res.json()
                setUsers(data)
            }
            catch(err){
                console.log("Error in Group.getUsers():", err.Error)
            }
        }
        getUsers()
    },[])

    React.useEffect(()=>{
        const getMyRooms=async()=>{
            try{
                const res = await fetch('/api/room/getmyrooms',{
                    method:'GET',
                    credentials:'include'
                })

                if(!res.ok){
                    const errorData = await res.json()
                    throw Error(errorData)
                }

                const data = await res.json()
                console.log("Groupj Fetch was Successfull: ", data)
                setUsersGroups(data.rooms)
                
                }
            catch(err){
                console.log("Error in Group.getMyRooms(): ", err.Error)
            }
        }
        getMyRooms()
        console.log("groups : ",usersGroups)
    },[])
    const handleChange= (e)=>{
            const {value,name} = e.target
           name === 'groupName' && setGroup(prev=>{
                return(
                    {...prev,[name]:value}
                )
            })
            if(name === 'participants')
            {
                const newParticipants = users && users.message.find(user=> user._id === value)
                console.log("newParticipants value: ", newParticipants)
                setParticipants(prev=>{
                    return(
                        [...prev,{id:newParticipants._id, name:newParticipants.name}]
                    )
                })
             }    
             
        }

        const handleSubmit =async(e)=>{
            e.preventDefault()

            console.log("Here are values of Group : ", group, "and participants: ", participants)
                try{
                    const res = await fetch('./api/room/create-room',{
                        method:"POST",
                        headers:{'Content-Type':'application/json'},
                        body:JSON.stringify({room_name:group.groupName,participants})
                    })

                    if(!res.ok){
                        const errorData = await res.json()
                        throw Error(errorData)
                    }

                    const data = await res.json()
                    console.log("Room Created: ", data)
                }
                catch(err){
                    console.log('Error in group.handleSubmit(): ', err)
                }

        }

        const handleClick=(e,id)=>{
            e.preventDefault()
            dispatch({type:"CHANGE",payload:id})

            console.log("room id : ", id)

            console.log("Room Id context : ", roomId )
        }

    return(
        <div className="group-container">
            {users&& <form action="" className="create-room form">
                    <label htmlFor="groupName">Group Name</label>
                    <input
                             type="text" 
                             id='groupName'
                             onChange={(e)=>{handleChange(e)}}  
                             name='groupName'  />
                    <label htmlFor="participants">Select Participants</label>
                    <select multiple name="participants" id="participants" onChange={(e)=>{handleChange(e)}}>
                     { users.message.map((user,ind)=>{
                        return(<option value={user._id}className='participant' key={ind}>{user.name}</option>)
                      })}
                     
                    </select>
                      <button onClick={handleSubmit}>create</button>
                  </form>}
                <div className="groups">
                    {usersGroups.length > 0 && usersGroups.map((grp,ind)=>{
                        return(
                            <button key={ind}
                            onClick={(e)=>{handleClick(e,grp._id)}}>{grp.room_name}</button>
                        )
                    })}
                </div>
        </div>
    )
}

// {grp.room_name}