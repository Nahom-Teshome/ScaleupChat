import React from 'react'
import propTypes from 'prop-types'
import { useUserContext } from '../hooks/useUserContext'
import { AiOutlineDownload } from "react-icons/ai";
import {useQuery, useQueryClient   } from '@tanstack/react-query'


export default function GetMessages({selectedUserID,receivedMessage,loadMessage,oldMessages,sentMessage,roomID,sentFiles}){
//   console.log("FROM BRANCH ******CACHING****!!!",selectedUserID.id)
   
    const [messages,setMessages] = React.useState([])
    const {user} = useUserContext()
    const {data,isLoading,error}=[1,false,false]
    // const {data,isLoading,error}= useQuery(
    //     {
    //         queryKey:['data',roomID?roomID:selectedUserID.id],
    //         queryFn:async ()=>{
    //                     const res = roomID?await fetch(`${import.meta.env.VITE_API_URL}/api/message/receive/group/${roomID}`,{
    //                         method:'GET',
    //                         credentials:'include'
    //                     }): await fetch(`${import.meta.env.VITE_API_URL}/api/message/receive/one2one/${selectedUserID.id}`,{
    //                         method:'GET',
    //                         credentials:'include'
    //                     })
    //                     if(!res.ok){
    //                         const data = await res.json();
    //                         console.log("New Error in fetch Messages: ",data.Error)
    //                          throw new Error(data.Error)}
    //                        const data = await res.json()
    //                     console.log("Message Received from SERVER: ",data)
    //                         return data.message
    //                  },
    //         enabled: selectedUserID.id?true:false,
    //         // keepPreviousData:true,
    //         staleTime: 1000 * 60 * 5,
    //     }
    // )
    // React.useEffect(()=>{
    //     console.log("SET Message UseEFFFECT ")
    // //  data&& setMessages(data)
    // //  datas && setMessages(datas)
    // },[data])
    React.useEffect(()=>{
          
            const fetchMessages=async()=>{

                try{
                    // setRoomId(null)
                    setMessages([])
                    console.log("SelectedUserID iN GETmESSAGES ", selectedUserID.id)
                    
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/message/receive/one2one/${selectedUserID.id}`,{
                        method:'GET',
                        credentials:'include'
                    })

                    if(!res.ok){
                        const errorData = await res.json()
                        console.log("Error in !res.ok: ",errorData.Error)
                        throw Error(errorData)
                    }
                    const data = await res.json()
                    console.log("message from GetMessages.receiverId component: " ,data)

                    setMessages(data.message)
                   }
             catch(err)
                    {
                        console.log("Error in GetMessagesRoomId component: ", err.message)
                        setMessages([])
                        
                    }
                 }
                 if(selectedUserID && !roomID){//SelectedUserId is not only used to fetch messages for the selected user but also to properly create a message object state in setMessages() so here roomID must be null for this function to fire

                    //  fetchMessages()
                    }
        
        },[selectedUserID])
    React.useEffect(()=>{
        // setRoomId(roomID)
        
            const fetchMessages=async()=>{
                // setSender_id(null)
                try{
                    setMessages([])
                   
                    console.log("SelectedRoomID iN GETmESSAGES ",roomID)
                    
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/message/receive/group/${roomID}`,{
                        method:'GET',
                        credentials:'include'
                    })

                    if(!res.ok){
                        const errorData = await res.json()
                        console.log("Error in !res.ok: ",errorData)
                        throw Error("RESPONSE NOT OK",errorData)
                    }
                    const data = await res.json()
         console.log("message from GetMessages.RoomId component: " ,data)

                    setMessages(data.message)
                   }
             catch(err)
                    {
                        console.log("Error in GetMessages.RoomId component: ",err.Error)
                        setMessages([])
                        
                    }
                 }
                 if(roomID){

                    //  fetchMessages()
                    }
        
        },[roomID])
// console.log("Get MESSAGES WAS TRIGGERED: logged in user", user)

       React.useEffect(()=>{
           // displaying the message that current-user sent to self
        //    console.log("IN sentMessages useEffect : ","sentFiles", sentFiles, " sentMessages ",sentMessage, 'messagest: ',messages)
               messages.length> 0? setMessages(prev=>{
                    return(
                        [{content:sentMessage,sender_id:user._id,receiver_id:selectedUserID.id,createdAt:new Date().toISOString(),files:sentFiles?[sentFiles]:null},...prev]//current-user is the sender here and receiver_id will only have a value if the messaging is one to one , if it is a group chat it will be null
                    )
                }):setMessages([{content:sentMessage,sender_id:user._id,receiver_id:selectedUserID.id,createdAt:new Date().toISOString(),files:sentFiles?[sentFiles]:null}])

        },[sentMessage,sentFiles])
        React.useEffect(()=>{
            console.log("useEffect in GetMESSAGES. RECEIVED MESSAGES: ",receivedMessage)
            console.log("useEffect in GetMESSAGES. RECEIVED MESSAGES selected user: ",selectedUserID.id)
            if(receivedMessage)
            {
                if(receivedMessage.sender_id === selectedUserID.id || receivedMessage.room_id === selectedUserID.id)
                {//to make sure that the selected user only gets his/her messages

                    console.log("messsage belongs to user room!!")
                    messages.length>0? setMessages(prev=>{
                        return  (
                          [receivedMessage,...prev]
                        )
                    }):setMessages([receivedMessage])
                }
            }
        },[receivedMessage])
        React.useEffect(()=>{
            if(loadMessage)
            {
                console.log("Loading new Message in GetMessages(): ",loadMessage)

                if(((loadMessage[0].sender_id === selectedUserID.id && loadMessage[0].receiver_id === user._id)||(loadMessage[0].sender_id === user._id && loadMessage[0].receiver_id === selectedUserID.id)) || loadMessage[0].room_id === selectedUserID.id)
                {
                    console.log("Messsage Belongs to user")
                                        setMessages(loadMessage)
                }
            }
        },[loadMessage])
        React.useEffect(()=>{
            if(oldMessages && oldMessages.length > 0){
                console.log("selectedUser.id: ",selectedUserID.id," roomID: ",roomID)
                if(oldMessages[0].room_id === roomID ||
                    (oldMessages[0].sender_id=== selectedUserID.id && oldMessages[0].receiver_id === user._id || 
                     oldMessages[0].sender_id === user._id && oldMessages[0].receiver_id === selectedUserID.id
                    ))
                {
                    console.log("OldMessages UseEffect in GetMessages: ",oldMessages, messages.length)
                      setMessages.length> 0 ? setMessages(prev=>{
                        return[...prev,...oldMessages]
                    }):console.warn("Messages in GetMessages() isn't populated yet. can't load oldMessages")
                }
            }
        },[oldMessages])

         const formatDate=(createdAt)=>{
                  const date =  new Date(createdAt)
        
                  const options={
                    hour :'2-digit',
                    minute:'2-digit',
                    hour12:true
                  }
        
                  return  date.toLocaleTimeString('en-US',options)
                }
            
    return(
      !error? <>
            {messages.length >=1 && !isLoading?
                  messages.map((text,ind)=>{   
                    const time = formatDate(text.createdAt)
                    const groupname =selectedUserID.name.find(name =>(name.id=== text.sender_id))
                // console.log("text.files: ",text.files,'and here are the classNames; ',!text.files||text.files[0]?(user._id === text.sender_id ?'my-message':`message`):(user._id === text.sender_id ?'my-message my-img-message':`message img-message`))
                        return (text.files||text.content )&& (
                          
                        <div
                          className={!text.files||text.files.length===0?(user._id === text.sender_id ?'my-message':`message`):(user._id === text.sender_id ?'my-message my-img-message':`message img-message`)}
                              key={ind} >
                               
                                <p className='message-name'>{text.sender_id===selectedUserID.id?selectedUserID.name:
                                groupname?groupname.name:
                                user.name}</p>
                                    {(text.files?.length>0 &&text.files[0])&&
                                    <>
                                        {text.files[0].resource_type === 'image' ? <img
                                        className='img-content'
                                        src={text.files[0].secure_url} 
                                        alt={text.files[0].public_id}
                                        />:<p>{text.files[0].filename}</p>}
                                        <a className="download-link" href={text.files[0].secure_url} download={text.files[0].filename||'download'} target='_blank' rel="noopener noreferrer">
                                        <AiOutlineDownload />
                                        </a>
                                   </>
                                }
                                {text.content&& <p className='message-content'>{text.content}</p>}
                                <p className="time">{time}</p>
                        </div>

                      
                              )}) :
                              <div>looking for messages</div>
                            }
        </>:
        <div>{error }:   Fetching MessageData</div>
    )
    
}

// GetMessages.propTypes ={
//     selectedUserID:propTypes.shape(
//         {
//          name:propTypes.string.isRequired
//     }),
//     receivedMessage:propTypes.shape(
//         { 
//             sender_id:propTypes.number,
//             room_id:propTypes.number
//         }
//     ),
//     sentMessage:propTypes.string,
//     roomID:propTypes.number,
//     sentFiles:propTypes.shape(
//         {
//             public_id:propTypes.string,
//             secure_url:propTypes.string,
//             filename:propTypes.string,
//             format:propTypes.string,
//             resource_type:propTypes.string,
//             bytes:propTypes.number
//         }
//     )}