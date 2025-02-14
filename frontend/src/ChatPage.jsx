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
import { FaLessThanEqual, FaLocationArrow } from "react-icons/fa";
import { useMediaQuery } from './hooks/useMediaQuery';
 function ChatPage(){
  // const [isConnected, setIsConnected] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [file , setFile] = React.useState(null)
  const [newMessage, setNewMessage] = React.useState('')
  const [receivedMessage, setReceivedMessage] = React.useState('')
  const [selectedUser,setSelectedUser] = React.useState({id:null,name:[]})
  const [roomId, setRoomId] = React.useState(null)
  const [moreClicked,setMoreClicked] = React.useState(false)
  const {user} = useUserContext()
  const {socket,onlineUsers} = useSocketContext()
  // const [typing, setTyping] = React.useState(false)
  const [noOfOnlineUsers,setNoOfOnlineUsers] = React.useState(0)
  const [newFile ,setNewFile] = React.useState(null)//array because the file field in Db is an[]
  const fileInputRef = React.useRef(null)
  const [usersShown, setUsersShown] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)
   let screenSize = useMediaQuery("(max-width: 450px)")
  const newSocket = socket
  console.log("THIS IS IN PRODUCTION GETTING THE BACKEND API URL: ",import.meta.env.VITE_API_URL)
  React.useEffect(()=>{
   
      try{
              if(roomId){
                newSocket.emit("joinRoom",roomId)
              }
              if(!roomId){
                newSocket.emit("joinRoom")
              }
          // console.log("this is room Id: ")
        
            newSocket.on('receiveMessage',(message)=>{
              console.log("receiving messages that were sent from other users: ",message)
                setReceivedMessage(message)
              
          
            })
            }
            catch(err){
              console.log("UseEffect Error: ",  err.message)
            }
           
          

            return () => {
              // newSocket.disconnect();
          }
          },[])

          React.useEffect(()=>{
            let onlineUsersCount = new Set()
            console.log("No of oNline USERS useEffect")
          
            if(selectedUser && onlineUsers)
              {
                console.log("selectedUser: ", selectedUser)
              selectedUser.name.map(user=>{
                return ( onlineUsers.includes(user.id))? onlineUsersCount.add(user.id):console.log("Id Not in online users")
              })
              let countArray = [...onlineUsersCount]
console.log("online users in chat : ", onlineUsers)
              setNoOfOnlineUsers(countArray.length)
              console.log("selectedUser.name is included in onlineUsers: ", countArray.length)
                
              }
              
              
              console.log("No of oNline USERS useEffect: ", noOfOnlineUsers)
              
            },[onlineUsers,selectedUser])
            
            // console.log(".env files",import.meta.env.VITE_CLOUDNAME)
            const cloudinaryUpload= async(file)=>{
console.log('inside cloudinaryUpload')
              const formData = new FormData()
              formData.append('file',file)
              formData.append('upload_preset',import.meta.env.VITE_UPLOADPRESET)
              formData.append('cloud_name',import.meta.env.VITE_CLOUDNAME)
              try{
                const res = await fetch(import.meta.env.VITE_CLOUDINARY_URL,{
                  method:'POST',
                  body:formData
                })
                const data  = await res.json()
                if(data.error){
                  throw Error(data.error)
                }
                console.log("data from cloudinary: ", data)
                return data
              }
              catch(err){
                console.log("Error from cloudinary: ", err.message)
              }
            }
            const sendMessage=async(e)=>{
              e.preventDefault()
            // setNewFile({secure_url:URL.createObjectURL(file[0])})
            console.log("file: ", file)
            // const fileInfo = await Promise.all(file.map(cloudinaryUpload))
         
              const fileInfo =file ? await(cloudinaryUpload(file[0])): null
            file&&console.log("Cloudinary data fileInfo: ", fileInfo)
            file&&console.log("Cloudinary data fileInfo: ", fileInfo.secure_url)
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
              setNewFile(null)
            }
            else{
              console.log("must select room or User","socket connection?: ",socket?socket:"no socket connection")
            }
          }
          else{
            console.error("either Message or File must be sent")
          }
        }
        // console.log("REceivedmessages: ", receivedMessage)
        const getSelectedUserId =(id,name,imageUrl)=>{
          setNewFile(null)
    // console.log("ID OF SELECTED uSER: ",id, 'name ', name)
          if(socket){
      // console.log("joining Own room")
            socket.emit('joinRoom')
          }
          setSelectedUser({name:[name],id,imageUrl})//passing name as an array bc in room participants name is an array and i have to map through it
          setRoomId(null)
          
        }
          const getRoomId=(id,participants,groupName,groupImageUrl)=>{
            setNewFile(null)//so that old files are overwritten when a new  group is selected
            setRoomId(id)
            if(socket){
      //  console.log("joining Group Room")
              socket.emit('joinRoom',id)
            }
            const members = participants.map(participant =>({name:upperCasing(participant.name),id:participant.id,imageUrl:participant.imageUrl}))
            setSelectedUser({name:members,id:id,groupName,imageUrl:groupImageUrl})
          
            console.log("Room id IN CHAT: ",id , 'SelectedUserId set to group id')
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
          // const changeFocus=(e)=>{
          //   console.log("what is the event: ", e)
          //   setTyping(true)
          //   console.log("TYPING")
          // }
          React.useEffect(()=>{
            console.log("Checking Screen Size in Chat")
            setIsMobile(screenSize)
          },[screenSize])
console.log("Current LOGGED IN USER: ", user)
       
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
                                mobileView={ screenSize?()=>{setUsersShown(false)}:null}
                                />

                      <GetGroups getRoomId={getRoomId}
                                selectedGroup={selectedUser.id}
                                sentMessage={newMessage}
                                receivedMessage={receivedMessage}
                                sentFiles={newFile}
                                mobileView={screenSize? ()=>{setUsersShown(false)}:null}
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
                          
                       </div>
                                         
                  </div>}
                
                                                             
                                              {roomId&& <button className="group-detail"
                                               onClick={()=>{setMoreClicked(prev=>!prev)}}>
                                                  <HiDotsVertical />
                                                </button> }
                                         
                                  
              </div>}
                <div className="chat-wrapper">
                
                    {(selectedUser.id || roomId)? <GetMessages 
                                                  selectedUserID={selectedUser}
                                                  sentMessage={newMessage}
                                                  sentFiles={newFile}
                                                  receivedMessage={receivedMessage}
                                                  roomID={roomId}
                                                  />:
                      <p>Select a user</p>}

                </div>

                 {selectedUser.id &&  <form className="chat-form" action="">
                    <div className="chat-input-wrapper">
                        <input className="chat-input" type="text"
                                id="text"
                                value={message} 
                                onChange={(e)=>{setMessage(e.target.value)}}
                                />
                    </div>
                        <input className="file-input" type="file" multiple
                                onChange={(e)=>{
                                  setFile(Array.from(e.target.files))
                                }}
                                ref={fileInputRef}
                                name='file'
                                />
                           <BsPaperclip className='paper-clip'/>
                        <button className="chat-btn" onClick={sendMessage}><FaLocationArrow /></button>
                  </form>}

            </div>
           {moreClicked&& 
           <div className="more-group-details">
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


