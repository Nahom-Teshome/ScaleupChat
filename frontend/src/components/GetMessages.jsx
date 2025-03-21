import React from 'react'
import PropTypes from 'prop-types'
import { useUserContext } from '../hooks/useUserContext'
import { AiOutlineDownload } from "react-icons/ai";
// import ProfileCard from './ProfileCard.jsx'


export default function GetMessages({selectedUserID,receivedMessage,sentMessage,roomID,sentFiles}){
  
    const [messages,setMessages] = React.useState([])
    const {user} = useUserContext()
    
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

                     fetchMessages()
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

                     fetchMessages()
                    }
        
        },[roomID])
// console.log("Get MESSAGES WAS TRIGGERED: logged in user", user)

       React.useEffect(()=>{
           // displaying the message that current-user sent to self
           console.log("IN sentMessages useEffect : ","sentFiles", sentFiles, " sentMessages ",sentMessage)
                setMessages(prev=>{

                    return(
                        [{content:sentMessage,sender_id:user._id,receiver_id:selectedUserID.id,createdAt:new Date().toISOString(),files:sentFiles?[sentFiles]:null},...prev]//current-user is the sender here and receiver_id will only have a value if the messaging is one to one , if it is a group chat it will be null
                    )
                })

        },[sentMessage,sentFiles])
        React.useEffect(()=>{
            
            console.log("useEffect in GetMESSAGES. RECEIVED MESSAGES: ",receivedMessage)
            console.log("useEffect in GetMESSAGES. RECEIVED MESSAGES selected user: ",selectedUserID.id)
            if(receivedMessage && (receivedMessage.sender_id === selectedUserID.id || receivedMessage.room_id === selectedUserID.id)){//to make sure that the selected user only gets his/her messages

                setMessages(prev=>{
                    return  (
                        [receivedMessage,...prev]
                    )
                })
            }
        },[receivedMessage])

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
        <>
            {messages.length>0?
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
        </>
    )
    
}

GetMessages.PropTypes ={
    selectedUserID:PropTypes.shape(
        {
         name:PropTypes.string.isRequired
    }),
    receivedMessage:PropTypes.shape(
        { 
            sender_id:PropTypes.number,
            room_id:PropTypes.number
        }
    ),
    sentMessage:PropTypes.string,
    roomID:PropTypes.number,
    sentFiles:PropTypes.shape(
        {
            public_id:PropTypes.string,
            secure_url:PropTypes.string,
            filename:PropTypes.string,
            format:PropTypes.string,
            resource_type:PropTypes.string,
            bytes:PropTypes.number
        }
    )}