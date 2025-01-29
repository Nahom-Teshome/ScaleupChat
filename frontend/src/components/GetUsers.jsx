import '../index.css'
import React from 'react'
import { useUserContext } from '../hooks/useUserContext'
// import { useSocketContext } from '../hooks/useSocketContext'
import { useLastMessageContext } from '../hooks/useLastMessageContext'
export default function GetUsers({fetchMessages,selectedUser,isOnline,sentMessage,receivedMessage}){
    const [users,setUsers] =React.useState(null)
    const {user} = useUserContext()
    const [lastMessages,setLastMessages] = React.useState([])
    const {lastMessage} = useLastMessageContext()
    // const {onlineUsers} = useSocketContext()
    React.useEffect(()=>{
        const getLastMessages =async()=>{
            try{
                const res = await fetch('/api/message/receive/lastmessages',{
                    method:'GET',
                    credentials:'include'
                })

                if(!res.ok){
                    const errorData = await res.json()
                    console.log('Error in !res.ok: ',errorData)
                    throw Error(errorData)
                }

                const data = await res.json()
                // console.log("Getting all data success!!!")
                setLastMessages(data.lastMessages)
                // console.log("last Messages: ",data)
                //    dispatch({type:"LOAD",payload:data.lastMessages})
            }
            catch(err){
                console.log('Error in getLastMessages: ',err)
            }
        }
        // getLastMessages()
        setLastMessages(lastMessage)
        console.log("last Messages in user: ",lastMessage)

    },[lastMessage])

    React.useEffect(()=>{
        const getMyUsers=async()=>{
            try{
                const res = await fetch('/api/user/myusers',{
                    method:'GET',
                    credentials:'include'
                })
                if(!res.ok){
                    const errorData = await res.json()
                    console.log("Error in getMyUsers !res.ok: ",errorData)
                    throw Error(errorData)
                }
                const data = await res.json()

            // console.log("Data from GetMyUsers: ",data)
                setUsers(data.myUsers)
            }
            catch(err){
                console.log("Error in getMyUsers: ",err.Error)
            }
        }
        getMyUsers()
    },[])

    React.useEffect(()=>{
        if(sentMessage){

            setLastMessages((prev)=>{
                const newLastMessage = prev.map(last =>{ 
                    return last.sender_id===user._id && last.receiver_id ===selectedUser ||
                           last.receiver_id===user._id && last.sender_id ===selectedUser  ?
                    {content:sentMessage,sender_id:user._id,receiver_id:selectedUser,createdAt:new Date().toISOString()}:last
                    })
                    // console.log("The new LAST message: ", newLastMessage)
                 return newLastMessage
            })
        }
        // console.log("last message update sent messages: ",sentMessage)
    },[sentMessage])
    React.useEffect(()=>{
    //   ||last.sender_id===user._id && last.receiver_id ===selectedUser
        if(receivedMessage){

            setLastMessages((prev)=>{
            const newLastMessage = prev.map(last =>{
            
                return last.receiver_id=== receivedMessage.receiver_id && last.sender_id===receivedMessage.sender_id || last.receiver_id === receivedMessage.sender_id && last.sender_id ===receivedMessage.receiver_id ?
                receivedMessage:last
            })
                                console.log("The new LAST message receive: ", newLastMessage)
              return newLastMessage
        })
    }
    // console.log("last message update receive messages: ",receivedMessage,)
    },[receivedMessage])

    const convertToDate= (time)=>{
        const date= new Date(time)
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

return(// SLOW LOADING ISSUE
        <>
            {(users&& user)&&
                users.map((userI,i)=>{ 
                    
                    let online = isOnline && isOnline.includes(userI._id) ? true: false
                    return userI._id !== user._id && (<button className={userI._id === selectedUser? 'current-user':'user'}
                        onClick={()=>{fetchMessages(userI._id, userI.name.toUpperCase())}} 
                        key={i} >  
                                <div className="user_info">
                                    {online?
                                    <div className="user_online" ></div>:
                                    <div className="user_offline" ></div>}
                                    <h4 className="user-name">{upperCasing(userI.name)}</h4>
                                 </div>
                                    <div className='user-latest-message'>{   
                   lastMessages   && lastMessages.map((last,i)=>{
                        if(last.room_id === undefined || last.room_id === 'client-to-client')//ENSURES that users who are senders don't have room messages previewing
                        {
                            const time = convertToDate(last.createdAt)
                            return (last.sender_id === userI._id || last.receiver_id === userI._id) &&
                            <div key={i} className='latest-message-wrapper'>
                               <p> {last.content} </p>
                                <p className='time'>{time} </p>
                            </div>
                            
                        }
                     })   
                                    }</div>
                                        
                        </button>
                        )
                    }
                )
            }
        </>
    )
}
// className={userI._id === userId?'current-user':'user'}