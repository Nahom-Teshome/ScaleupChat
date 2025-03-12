import React from 'react'
import { HiDotsVertical } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import ProfileCard from './components/ProfileCard'
import { useUserContext } from './hooks/useUserContext'
import GetGroups from './components/GetGroups'
import GetUsers from './components/GetUsers'
import GetMessages from './components/GetMessages'
import { useSocketContext } from './hooks/useSocketContext'
import { BsPaperclip } from "react-icons/bs";
import { IoChevronBack } from "react-icons/io5";
import {  FaLocationArrow } from "react-icons/fa";
import { useMediaQuery } from './hooks/useMediaQuery';
import {QueryClientContext, useQuery, useQueryClient   } from '@tanstack/react-query'
 function ChatPage(){
  // const [isConnected, setIsConnected] = React.useState(false)
  const queryClient = useQueryClient()
  const [message, setMessage] = React.useState('')
  const [file , setFile] = React.useState(null)
  const [newMessage, setNewMessage] = React.useState('')
  const [receivedMessage, setReceivedMessage] = React.useState('')
  const [loadMessage,setLoadMessage] = React.useState('')
  const [oldMessage,setOldMessage] = React.useState('')
  const [oldMessageLoading,setOldMessageLoading] = React.useState(false)
  const loadingRef = React.useRef(false)
  const [selectedUser,setSelectedUser] = React.useState({id:null,name:[]})
  const [roomId, setRoomId] = React.useState(null)
  const [moreClicked,setMoreClicked] = React.useState(false)
  const {user} = useUserContext()
  const {socket,onlineUsers} = useSocketContext()
  // const [typing, setTyping] = React.useState(false)
  const [noOfOnlineUsers,setNoOfOnlineUsers] = React.useState(0)
  const [newFile ,setNewFile] = React.useState(null)//array because the file field in Db is an[]
  const fileInputRef = React.useRef(null)
  const [miniImage , setMiniImage] = React.useState(null)
  const [usersShown, setUsersShown] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)
  const pageRef = React.useRef(1)
  const scrollRef = React.useRef(null)
  const messageCache = React.useRef(new Map())
   let screenSize = useMediaQuery("(max-width: 450px)")
  const newSocket = socket
  // console.log("THIS IS IN PRODUCTION GETTING THE BACKEND API URL: ",import.meta.env.VITE_API_URL)

  // React.useEffect(()=>{
  //   console.log("useEffect get cache data: looking for selectedUserId: ", selectedUser.id)
  //   const cacheQuery =queryClient.getQueryCache().getAll()
  //   // const cacheQuery =queryClient.getQueryData(['data',selectedUser.id])
  //    console.log('Query Data : ', cacheQuery)

  // },[selectedUser.id])
  socket&&socket.on("disconnect", (reason) => {
    console.log("Disconnected from server. Reason:", reason);
  });
  React.useEffect(()=>{
    
      console.log('subscription use effect')
      // console.log("this is room Id: ")
      const handleReceiveMessage=(message)=>
        {//listen for event before the event is emitted
        
              console.log("receiving messages that were sent from other users: ",message)
              const isRoomMessage = message.room_id !== 'client-to-client'&& message.room_id !== null
               
              console.log("Message Received looking in cache: ",queryClient.getQueryData(['data',isRoomMessage?message.room_id :message.sender_id]))
              setReceivedMessage(message)
      
        }
       const  handleLoadGroupMessages=(message)=>
          {//Make sure the listener is listening for the event before the event is emitted because it is only emitted once 
            console.log("loading new messages for room: ", roomId, " Messages: ",message)
            let key =`data${roomId}]`
           
            setOldMessage('')
            if(!messageCache.current.has(key)){
                console.log("doesn't exist in cache adding it",messageCache.current)
                messageCache.current.set(key,message)
                localStorage.setItem("messageData",JSON.stringify(messageCache.current))
            }
            else{
              console.log("Exists in cache")
            }
            // setLoadMessage(messageCache.current.get(key))
            setLoadMessage(message)
            console.log("localStorage: ", JSON.parse(localStorage.getItem("messageData")))
          }
        const handleLoadUserMessages =(message)=>{
          setOldMessage('')
          setLoadMessage(message)
      }
      newSocket.on('receiveMessage',handleReceiveMessage)

      if(roomId !== 'client-to-client' && roomId !== null)//when roomId exists
         {
            console.log("Joined room from subscription useEffect: ",roomId)
            newSocket.on('load-group-Messages',handleLoadGroupMessages)
            newSocket.emit("group-Room",roomId) 
          }
                  
      if(!roomId || roomId === 'client-to-client')//making sure roomId doesn't exist
          {
            const selectedUserId = selectedUser.id
            if(selectedUser.id)//then we can check for the value of selectedUser.id
              {
                // console.log("selectedUser.id in subscription: ",selectedUserId)
                // newSocket.emit("getSelectedUser",selectedUserId)
                console.log("loading new messages for user: ", selectedUserId, " Messages: ",message)
                newSocket.on('load-user-Messages',handleLoadUserMessages)  
              }
              newSocket.emit("private-Room",selectedUserId)
            }
           
            return () => {
              newSocket.off('load-user-Messages',handleLoadUserMessages);
              newSocket.off('load-group-Messages',handleLoadGroupMessages);
              newSocket.off('receiveMessage',handleReceiveMessage);
            }
          },[roomId,selectedUser.id])

          const handleScroll=()=>{
                const {clientHeight, scrollTop, scrollHeight} = scrollRef.current
                if((Math.ceil(-scrollTop) +10 +clientHeight) >= (scrollHeight) && !loadingRef.current)
                  {// chatContainer now has access to the chat-wrapper div's scroll property
                    console.log("Scrolled to the top!! pageCount: ",pageRef.current, "loading state: ",loadingRef.current )
                    loadingRef.current= true
                    
                     setOldMessageLoading(true)
                     loadOlderMessages()
                  }
                  else{console.log(`clientHeight:${clientHeight}, scrollTop:${Math.ceil(-scrollTop)}, scrollHeight:${scrollHeight} `)}
          }

          const loadOlderMessages=async()=>
            {            
              console.log("loading state in loadOlderMessages: ",loadingRef.current)
               newSocket.off('olderMessages')//detach previous event listener before attaching a new one below
                await newSocket.on('olderMessages',(oldMessage)=>
                {//event listener for old messages if triggered 
                  console.log("olderMessages event triggered ,oldMessages: ",oldMessage, "pageCount: ",pageRef.current,"loading state: ",   loadingRef.current , "roomId: ",roomId)
                   loadingRef.current= false
                   setOldMessage(oldMessage)
                   setOldMessageLoading(false)
                   pageRef.current += 1
                   
                  })     
                  if(loadingRef.current){
                    newSocket.emit('loadMoreMessages',{roomId, page:pageRef.current})
                 }
          }
          React.useEffect(()=>{
            pageRef.current = 1
            const chatContainer = scrollRef.current//points to the chat-wrapper div
              if(!chatContainer ) return;
            
              chatContainer.addEventListener('scroll',  roomId && roomId !== "client-to-client"&& handleScroll)//assigning an eventListener to the chat-wrapper div through chatContainer by  refference. the Pagination only works for GROUPS so roomId must be present
              return ()=>{
                chatContainer.removeEventListener('scroll', handleScroll)
              }
          },[roomId])



          React.useEffect(()=>{
            let onlineUsersCount = new Set()
            // console.log("No of oNline USERS useEffect")
          
            if(selectedUser && onlineUsers)
              {
                     // console.log("selectedUser: ", selectedUser)
                  selectedUser.name.map(user=>{
                    return ( onlineUsers.includes(user.id))? onlineUsersCount.add(user.id):console.log("Id Not in online users")
                  })
                  let countArray = [...onlineUsersCount]
                     // console.log("online users in chat : ", onlineUsers)
                  setNoOfOnlineUsers(countArray.length)
                     // console.log("selectedUser.name is included in onlineUsers: ", countArray.length)
                
              }
              // console.log("No of oNline USERS useEffect: ", noOfOnlineUsers)
              
            },[onlineUsers,selectedUser.id])
          


            const cloudinaryUpload= async(file)=>
              {
                      // console.log('inside cloudinaryUpload')
              const formData = new FormData()
              formData.append('file',file)
              formData.append('upload_preset',import.meta.env.VITE_UPLOADPRESET)
              formData.append('cloud_name',import.meta.env.VITE_CLOUDNAME)
              try
              {
                const res = await fetch(import.meta.env.VITE_CLOUDINARY_URL,{
                  method:'POST',
                  body:formData
                })
                const data  = await res.json()
                if(data.error){
                  throw Error(data.error)
                }
                // console.log("data from cloudinary: ", data)
                return data
              }
              catch(err){
                console.log("Error from cloudinary: ", err.message)
              }
            }
            React.useEffect(()=>{//image or file shouldn't display if user clicks outside of chat-input
              const clickOutside=(event)=>{
                // console.log("Clicked outside of CHAT")
                if(file &&  !event.target.closest('.chat-form')){
                  setMiniImage(null)
                  setFile(null)
                }
              }
              document.addEventListener('mousedown',clickOutside)

              return ()=>{
               document.removeEventListener('mousedown',clickOutside)
              }
            },[file])

            const sendMessage=async(e)=>{
              e.preventDefault()
              setNewFile(null)
         
              const fileInfo =file ? await(cloudinaryUpload(file[0])): null
            // file&&console.log("Cloudinary data fileInfo: ", fileInfo)
            // file&&console.log("Cloudinary data fileInfo: ", fileInfo.secure_url)
            setNewFile( fileInfo)

            const fileMessage = fileInfo? {
              public_id:fileInfo.public_id,
              secure_url:fileInfo.secure_url,
              filename:fileInfo.original_filename,
              format:fileInfo.format,
              resource_type:fileInfo.resource_type,
              bytes:fileInfo.bytes
            }:null
          if(fileMessage || message){
            if(socket && selectedUser.id)
            {
              setNewMessage(message)
              socket.emit('sendMessage',{senderId:user._id,receiverId:selectedUser.id, content: message ,roomId,file:fileMessage?fileMessage:null})
              setMessage('')
              if(fileInputRef.current){//clearing the file selector
                console.log("current FIle input ref ; ")
                fileInputRef.current.value = ''
               }
              setFile('')
              
              setMiniImage(null)
            }
            else{
              console.log("must select room or User","socket connection?: ",socket?socket:"no socket connection")
            }
          }
          else{
            console.error("either Message or File must be sent")
          }
        }

      
        const getSelectedUserId =(id,name,imageUrl)=>{
          setNewFile(null)
          setMoreClicked(false)
          setLoadMessage('')
          setSelectedUser({name:[name],id,imageUrl})//passing name as an array bc in room participants name is an array and i have to map through it
          setRoomId(null)
          
        }
          const getRoomId=(id,participants,groupName,groupImageUrl)=>{
            setNewFile(null)//so that old files are overwritten when a new  group is selected
            setRoomId(id)
            setOldMessage('')
            setLoadMessage('')
            setMoreClicked(false)
            pageRef.current = 1

            const members = participants.map(participant =>({name:upperCasing(participant.name),id:participant.id,imageUrl:participant.imageUrl}))
            setSelectedUser({name:members,id:id,groupName,imageUrl:groupImageUrl})
          
            // console.log("Room id IN CHAT: ",id , 'SelectedUserId set to group id')
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
       
          React.useEffect(()=>{
            // console.log("Checking Screen Size in Chat")
            setIsMobile(screenSize)
          },[screenSize])
console.log("Current LOGGED IN USER: ", user._id,user.name)
       
  return (
        <div className="main-container">
            <div className={isMobile?(usersShown?"users-container-mobile-show":"users-container-mobile-hide"):"users-container"}>
              {user && <div  className="active-user">
                <ProfileCard 
                   userId={user._id}//only if the user._id matches with the logged in user or only if it is sent will user be able to update image
                   >
                { (user&& onlineUsers)?
                                          <div 
                                            className={onlineUsers.includes(user._id)? 'user_online online-info':'user_offline offline-info'}>
                                          </div>:null
                                          }
                                           <img className="profilePic-img"src={user.imageUrl} alt={user.name[0].toUpperCase()} />
                 <h4 className="username-initial">
                  {/* {user.name[0].toUpperCase()} */}
                                          
                 </h4>
                </ProfileCard>
                <h3 >{upperCasing(user.name)}</h3>    
              </div>}
            
                <div className="user-list-container">
                      <GetUsers fetchMessages={getSelectedUserId}
                                selectedUser={selectedUser.id}
                                isOnline={onlineUsers}
                                sentMessage={newMessage}
                                receivedMessage={receivedMessage}
                                sentFiles={newFile}
                                mobileView={isMobile?()=>{setUsersShown(false)}:()=>{ return true}}
                                />

                      <GetGroups getRoomId={getRoomId}
                                selectedGroup={selectedUser.id}
                                sentMessage={newMessage}
                                receivedMessage={receivedMessage}
                                sentFiles={newFile}
                                mobileView={isMobile?()=>{setUsersShown(false)}:()=>{ return true}}
                                />
                    
                </div>
            </div>

            <div className={!isMobile? "chat-container" :"chat-container-mobile"}>
              {selectedUser.id &&<div className="chat-header"> 
               
                {selectedUser.id && <div className="user-info">
                  <button className="chat-header-back" onClick={()=>{setSelectedUser({id:null,name:[]});setRoomId(null);setMoreClicked(false);setUsersShown(true)}}><IoChevronBack /></button>
                      <ProfileCard> 
                        {/* <h4 className="username-initial">
                               {selectedUser.groupName?selectedUser.groupName[0]:selectedUser.name.map(n=>n[0])}
                               </h4> */}
                        <img className="profilePic-img"src={selectedUser?.imageUrl} alt={user.name[0].toUpperCase()}
                        onClick={()=>{selectedUser.groupName && setMoreClicked(prev =>!prev)}} />{/*if inside a groupChat pressing profilePic will display group info*/}
                      </ProfileCard>
                      <div className="chat-header-wrapper">
                        <p className="user-info-name">{selectedUser.groupName?selectedUser.groupName:selectedUser.name[0]}
                        </p>
                        
                        {/* {selectedUser.groupName&&selectedUser.name.map((user)=>{
                          setNoOfOnlineUsers(prev=> prev++)})} */}
                          
                         {selectedUser.groupName? <div className={noOfOnlineUsers > 0? 'ON':'OFF'}>
                           {noOfOnlineUsers > 0?`${noOfOnlineUsers} ONLINE`:'OFFLINE'}
                       </div>:onlineUsers ?
                        <div 
                        className={onlineUsers.includes(selectedUser.id)?'ON':' OFF'}>
                         {onlineUsers.includes(selectedUser.id)?'ONLINE':'OFFLINE'}
                         </div>:null
                       }
                          
                       {oldMessageLoading&& <h1 className="Loading-OldMessages">Loading OlderMessages</h1>}
                       </div>
                                         
                  </div>}
                
                                                             
                                              {roomId&& <button className="group-detail"
                                               onClick={()=>{setMoreClicked(prev=>!prev)}}>
                                                  <HiDotsVertical />
                                                </button> }
                                         
                                  
              </div>}
                <div className="chat-wrapper" ref={scrollRef}>
                    {(selectedUser.id || roomId)? <GetMessages 
                                                  selectedUserID={selectedUser}
                                                  sentMessage={newMessage}
                                                  sentFiles={newFile}
                                                  receivedMessage={receivedMessage}
                                                  loadMessage ={loadMessage}
                                                  oldMessages={oldMessage}
                                                  roomID={roomId}
                                                  loadingOldMessages={oldMessageLoading}
                                                  />:
                                                  <p>Select a user</p>}

                </div>

                 {selectedUser.id &&  <form className="chat-form" action="">
                    <div className="chat-input-wrapper">
                      <input className="file-input" type="file" multiple
                              onChange={(e)=>{
                                console.log("File loaded to Chat input: ",e.target.files[0])
                                setFile(Array.from(e.target.files));
                                setMiniImage(e.target.files[0].type.split('/')[0] === 'image'?([URL.createObjectURL(e.target.files[0]),e.target.files[0].name]):['/file.png',e.target.files[0].name]);
                              }}
                              ref={fileInputRef}
                              name='file'
                              />
                        <input className="chat-input" type="text"
                                id="text"
                                value={message} 
                                onChange={(e)=>{setMessage(e.target.value)}}
                                />
                    
                              <BsPaperclip className='paper-clip'/>
                           {file && <div className="mini-img-wrapper">
                                <img className="mini-img"src={miniImage[0]} />
                               {miniImage.length>1&& <p>{ miniImage[1]}</p>}
                            </div>}
                        <button className="chat-btn" onClick={sendMessage}><FaLocationArrow className='chat-btn-arrow'/></button>
                     </div>
                  </form>}

            </div>
           {moreClicked&& 
           <div className={isMobile?"more-group-details-mobile":"more-group-details"}>
               <div className="more-group-details-header">
                  <button className="exit-btn"onClick={()=>{setMoreClicked(false)}}>         <RxCross2 />
                  </button>
                  <h4>Group</h4> 
                </div> 
               <h5>Group Members</h5>
                 {selectedUser.name.map((user,ind)=>(
                                      <div key={ind} className="user-info user-info-more">
                                            <ProfileCard>
                                              {/* <h4 className="username-initial">{user.name[0]}</h4> */}
                                              <img className="profilePic-img"src={user.imageUrl} alt={user.name[0].toUpperCase()} />
                                              </ProfileCard>
                                          <div className="f">
                                              <p className="user-info-name user-info-more-name">{user.name}</p>
                                              
                                              <div 
                                                className={onlineUsers.includes(user.id)? 'ON user-info-ON':'OFF user-info-OFF'}>

                                                  {onlineUsers.includes(user.id)?'ONLINE':'OFFLINE'}
                                              </div>
                                          
                                          </div>
                                       </div>
                                  )) }
                <h5>Photos</h5>  
                <h5>Files</h5>  
                <h5>Links</h5>  
           </div>}
       </div>
  )
}


export default ChatPage


