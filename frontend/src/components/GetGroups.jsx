import React from 'react'
import {useLastMessageContext} from '../hooks/useLastMessageContext'
import { useUserContext } from '../hooks/useUserContext'
import { useSocketContext } from '../hooks/useSocketContext'
import ProfileCard from './ProfileCard'

export default function GetGroups({getRoomId,selectedGroup,isOnline,sentMessage,receivedMessage,sentFiles,mobileView}){
    const [groups,setGroups] = React.useState([])
    const [lastMessages,setLastMessages] = React.useState([])
    const [unreadMessages,setUnreadMessages] = React.useState([''])
    const {socket}= useSocketContext()
    const {user}= useUserContext()
    const {lastMessage} = useLastMessageContext()
    React.useEffect(()=>{
        const getMyRooms=async()=>{
            try{
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/room/getmyrooms`,{
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
                socket.emit('joinrooms',{rooms:data.rooms})
                }
            catch(err){
                console.log("Error in Group.getMyRooms(): ", err.Error)
            }
        }
        if(user){
            getMyRooms()
        }
        
// console.log("groups : ",groups)
    },[])

    // React.useEffect(()=>{
    //         if(groups.length > 0)
    //         {

    //             socket.on('connect',()=>{
    //                 console.log("Reconecting with socket.id: ",socket.id, "and group: ",groups)
    //                 socket.emit("joinrooms",{rooms:groups})
    //             })
                
    //         }else{console.log("Groups not populated yet, can't emit Connect event")}
        
    // },[groups])
    
   
    React.useEffect(()=>{
        // console.log("last Message in GetGroup: ",lastMessage)
        setLastMessages(lastMessage)
    },[lastMessage])

    React.useEffect(()=>{
// console.log("sent message in gerGroups: ",sentMessage)

        lastMessage ? setLastMessages((prev)=>{
            const newLastMessage= prev.map(last=>{
               return  last.room_id === selectedGroup ? {content:sentMessage,room_id:selectedGroup,sender_id:user._id,createdAt:new Date().toISOString(),files:[sentFiles]}: last
                })
            return newLastMessage
            }):setLastMessages([{content:sentMessage,room_id:selectedGroup,sender_id:user._id,createdAt:new Date().toISOString(),files:[sentFiles]}])
        
    },[sentMessage,sentFiles])
    React.useEffect(()=>{
// console.log("received message in geTGroups: ",receivedMessage)

        lastMessage ? setLastMessages((prev)=>{
            const newLastMessage=prev.map(last=>{
               return  last.room_id === receivedMessage.room_id ? receivedMessage: last
                })
            return newLastMessage
            }):setLastMessages([receivedMessage])

            groups && setGroups(prev=>{
                const newList = []
                const topUser =[]
                prev.map(group=>{
                    if(group._id === receivedMessage.room_id){
                        topUser.push(group)
                    }
                    else{
                        newList.push(group)
                    }

                })
                return [...topUser,...newList]
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
       const handleClick=(group)=>{
            getRoomId(group._id,group.participants,upperCasing(group.room_name),group.imageUrl);
            mobileView();
            clearUnreadMessage(group._id)
       }
        React.useEffect(()=>{
                  if( receivedMessage)
                  {
                      setUnreadMessages(prev =>{
                        //   console.log("reading receivedMessages in unread useEffect: " , receivedMessage)
                         return receivedMessage.room_id!== selectedGroup ?[...prev, receivedMessage]:[...prev]
                       })
                  }
                },[receivedMessage])
                  React.useEffect(()=>{
                        socket.on("unreadMessage",(unreadMessages)=>{
                            // console.log("unreadMessages in get group: ",unreadMessages)
                            setUnreadMessages(unreadMessages)
                        })
                      },[])
        const  clearUnreadMessage = (id,count)=>{
      
                    unreadMessages || unreadMessages.lenght> 0 ?setUnreadMessages(prev=>{
                      const newUnread= prev.filter(unread=> unread.room_id !== id )
                    //   console.log("newUnread messages in prev : ",newUnread)
                      socket.emit("clearUnread",(id))
                      return newUnread
                    }):  console.log("newUnread messages in prev could not be displayed, as unreadMessages doesn't have value: ",unreadMessages)
             
             
                    }
                  
    return(
        <>
         { groups.length > 0 &&groups.map((group,i)=>{
                let unreadCount = 0
                unreadMessages&& unreadMessages.map((unread)=> unread.room_id === group._id && selectedGroup !== group._id? unreadCount +=1:unreadCount)
                      return(<button 
                        className={selectedGroup === group._id?'current-user':'user'} 
                        key={i}
                        onClick={()=>{handleClick(group)}}
                        >
                            <ProfileCard classname="user-list-profile">
                                <img className="profilePic-img" src={group.imageUrl} alt="" />
                            </ProfileCard>

                            <div className='group-info user_info'>
                                <div style={{display:'flex',justifyContent:'space-between',width:'100%'}}>
                                    <div className='user-name-unread'>
                                        <h4 className="user-name"> {upperCasing(group.room_name)}</h4>
                                        {unreadCount >0 ? <div className="unread-badge">{unreadCount}</div>: null}
                                    </div>
                                    
                                </div>
                                    <div className="user-latest-message group-latest-message">
                                   
                                 {
                                    lastMessages ? lastMessages.map((last,i) =>{

                                            const time = convertToDate(last.createdAt)
                                                        return last.room_id===group._id ?
                                                        <div  key={i}className="latest-message-wrapper">
                                                            <div className="latest-message-content">
                                                                <p>{last.content?last.content.slice(0,30):last.files[0].resource_type}</p>
                                                            </div>
                                                                 <p className='time'>{time }</p>
                                                           
                                                        </div>:null
                                                    }):<div className="latest-message-wrapper">
                                                          <div className="latest-message-content">
                                                          <p>...</p>
                                                          </div>
                                                    </div>
                                 }
                                  
                            </div>
                            </div>
                           
                            </button>)})
                  }
        </>
    )
}
