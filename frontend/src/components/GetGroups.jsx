import React from 'react'
import {useLastMessageContext} from '../hooks/useLastMessageContext'
import { useUserContext } from '../hooks/useUserContext'

export default function GetGroups({getRoomId,selectedGroup,isOnline,sentMessage,receivedMessage}){
    const [groups,setGroups] = React.useState([])
    const [lastMessages,setLastMessages] = React.useState()
    const {user}= useUserContext()
    const {lastMessage} = useLastMessageContext()
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
    // console.log("Groupj Fetch was Successfull: ", data)
                setGroups(data.rooms)
                
                }
            catch(err){
                console.log("Error in Group.getMyRooms(): ", err.Error)
            }
        }
        getMyRooms()
        
// console.log("groups : ",groups)
    },[])
    React.useEffect(()=>{
        console.log("last Message in GetGroup: ",lastMessage)
        setLastMessages(lastMessage)
    },[lastMessage,user])

    React.useEffect(()=>{
console.log("sent message in gerGroups: ",sentMessage)

        lastMessages && setLastMessages((prev)=>{
            const newLastMessage= prev.map(last=>{
               return  last.room_id === selectedGroup ? {content:sentMessage,room_id:selectedGroup,sender_id:user._id,createdAt:new Date().toISOString()}: last
                })
            return newLastMessage
            })
        
    },[sentMessage])
    React.useEffect(()=>{
console.log("received message in geTGroups: ",receivedMessage)

        lastMessages && setLastMessages((prev)=>{
            const newLastMessage= prev.map(last=>{
               return  last.room_id === receivedMessage.room_id ? receivedMessage: last
                })
            return newLastMessage
            })
        
    },[receivedMessage])

    const convertToDate=(time)=>{
        const date = new Date(time)
        const options={
            hour :'2-digit',
            minute:'2-digit',
            hour12:true
        }

        return date.toLocaleTimeString('en-US',options)
    }
    const upperCasing=(name)=>{
        const newName = []
         for(let i = 0; i< name.length;i++){
             if(i === 0){
               newName.push(name[i].toUpperCase())
             }
             else{
               newName.push(name[i])
             }
         }
         return newName
       }
    return(
        <>
         { groups.length > 0 &&groups.map((group,i)=>{
                      return(<button 
                        className={selectedGroup === group._id?'current-user':'user'} 
                        key={i}
                        onClick={()=>{getRoomId(group._id,group.participants,upperCasing(group.room_name))}}
                        >
                            <div className='group-info user_info'>
                                <h4>{upperCasing(group.room_name)}</h4>
                            </div>
                            <div className="user-latest-message group-latest-message">
                                {
                    lastMessages && lastMessages.map((last,i) =>{
                            const time = convertToDate(last.createdAt)
                                        return last.receiver_id===group.room_id ?
                                        <div  key={i}className="latest-message-wrapper">
                                            <p>{last.content}</p>
                                            <p className='time'>{time }</p>
                                        </div>:null
                                     })
                                    }
                            </div>
                            </button>)})
                  }
        </>
    )
}