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
 function ChatPage(){
  // const [isConnected, setIsConnected] = React.useState(false)
  const [message, setMessage] = React.useState(null)
  const [file , setFile] = React.useState(null)
  const [newMessage, setNewMessage] = React.useState('')
  const [receivedMessage, setReceivedMessage] = React.useState('')
  const [selectedUser,setSelectedUser] = React.useState({id:null,name:[]})
  const [roomId, setRoomId] = React.useState(null)
  const [moreClicked,setMoreClicked] = React.useState(false)
  const {user} = useUserContext()
  const {socket,onlineUsers} = useSocketContext()
  const [typing, setTyping] = React.useState(false)
  const [noOfOnlineUsers,setNoOfOnlineUsers] = React.useState(0)
  const [newFile ,setNewFile] = React.useState(null)//array because the file field in Db is an[]
  const fileInputRef = React.useRef(null)
  const newSocket = socket
  console.log("THIS IS IN PRODUCTION GETTING THE BACKEND API URL: ",import.meta.env.VITE_API_URL)
  React.useEffect(()=>{
    // console.log("Socket Connection useEffect")
    // const newSocket =io("http://localhost:300", {
      //   transports: ["websocket"],
      // })
      // const newSocket = io('/socket.io')
    // console.log(socket?'exists':"doesn't exist")
      try{
        
        // setSocket(newSocket)
        // dispatch({type:'CONNECT',payload:newSocket})
        
        // newSocket.on('connect',()=>{
               
        //           // newSocket.emit('userOnline',(user._id))

        //           // newSocket.on('online',(arg)=>{
        //             // console.log("expecting list of online Users:", arg)
        //             // setIsOnline(arg)
        //           // })
        //         console.log("Connected to io Sever")
        //       })
              if(roomId){
                newSocket.emit("joinRoom",roomId)
              }
              if(!roomId){
                newSocket.emit("joinRoom")
              }
          // console.log("this is room Id: ")
        
            newSocket.on('receiveMessage',(message)=>{
              console.log("receiving messages that were sent from other users: ",message)
              // console.log(` userId: ${userId}, message.sender_id ${message.sender_id}`)
              // if(userId=== message.sender_id){
                // console.log("message has come in : ", message.content)
          // console.log(`SELECTEDuser.id: ${selectedUser.id} === message.reciecer_id${message.receiver_id} `)
               
              
          // console.log(" Setting messages ")
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
            
            console.log(".env files",import.meta.env.VITE_CLOUDNAME)
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
              
           
   
            
           
            console.log("file: ", file)
            // const fileInfo = await Promise.all(file.map(cloudinaryUpload))
         
              const fileInfo =file ? await(cloudinaryUpload(file[0])): null
            file&&console.log("Cloudinary data fileInfo: ", fileInfo)
            file&&console.log("Cloudinary data fileInfo: ", fileInfo.secure_url)
            setNewFile( fileInfo)

            const fileMessage = fileInfo&& {
              public_id:fileInfo.public_id,
              secure_url:fileInfo.secure_url,
              filename:fileInfo.original_filename,
              format:fileInfo.format,
              resource_type:fileInfo.resource_type,
              bytes:fileInfo.bytes
            }
          if(file || message){
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
        const getSelectedUserId =(id,name)=>{
          setNewFile(null)
    // console.log("ID OF SELECTED uSER: ",id, 'name ', name)
          if(socket){
      // console.log("joining Own room")
            socket.emit('joinRoom')
          }
          setSelectedUser({name:[name],id})//passing name as an array bc in room participants name is an array and i have to map through it
          setRoomId(null)
          
        }
          const getRoomId=(id,participants,groupName)=>{
            setNewFile(null)//so that old files are overwritten when a new  group is selected
            setRoomId(id)
            if(socket){
      //  console.log("joining Group Room")
              socket.emit('joinRoom',id)
            }
            const members = participants.map(participant =>({name:upperCasing(participant.name),id:participant.id}))
            setSelectedUser({name:members,id:id,groupName})
          
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
// console.log("Typing state: ", typing)
       
  return (
        <div className="main-container">
            <div className="users-container">
              {user && <div className="active-user">
                <ProfileCard>
                { (user&& onlineUsers)?
                                          <div 
                                            className={onlineUsers.includes(user._id)? 'user_online online-info':'user_offline offline-info'}>
                                          </div>:null
                                          }
                 <h4 className="username-initial">{user.name[0].toUpperCase()}</h4>
                </ProfileCard>
                <h3 >{upperCasing(user.name)}</h3>    
              </div>}
            
                <div className="user-list-container">
                      <GetUsers fetchMessages={getSelectedUserId}
                                selectedUser={selectedUser.id}
                                isOnline={onlineUsers}
                                sentMessage={newMessage}
                                receivedMessage={receivedMessage}
                                />

                      <GetGroups getRoomId={getRoomId}
                                selectedGroup={selectedUser.id}
                                sentMessage={newMessage}
                                receivedMessage={receivedMessage}
                                // latestMessage={latestMessage}
                                />
                    
                </div>
            </div>

            <div className="chat-container">
              <div className="chat-header"> 
            
                { <div className="user-info">
                      <ProfileCard> 
                        <h4 className="username-initial">
                               {selectedUser.groupName?selectedUser.groupName[0]:selectedUser.name.map(n=>n[0])}
                        </h4>
                      </ProfileCard>
                      <div className="chat-header-wrapper">
                        <p className="user-info-name">{selectedUser.groupName?selectedUser.groupName:selectedUser.name[0]}
                        </p>
                        
                        {/* {selectedUser.groupName&&selectedUser.name.map((user)=>{
                          setNoOfOnlineUsers(prev=> prev++)})} */}
                          
                         {selectedUser.groupName? <div className={noOfOnlineUsers > 1? 'ON':'OFF'}>
                           {noOfOnlineUsers > 0?`${noOfOnlineUsers} ONLINE`:'OFFLINE'}
                       </div>:onlineUsers ?
                        <div 
                       className={onlineUsers.includes(selectedUser.id)?'ON':' OFF'}>
                         {onlineUsers.includes(selectedUser.id)?'ONLINE':'OFFLINE'}
                         </div>:null
                       }
                          
                       </div>
                                  {newFile && 
                                 <img  src={newFile.secure_url} alt="sentImage" 
                                    style={{border:'1px solid firebrick',width:'9rem',height:'100%'}}/>    }        
                  </div>}
                
                                                             
                                              {roomId&& <button className="group-detail"
                                               onClick={()=>{setMoreClicked(prev=>!prev)}}>
                                                  <HiDotsVertical />
                                                </button> }
                                         
                                  
              </div>
                <div className="chat-wrapper">
                
                    {(selectedUser.id || roomId)? <GetMessages 
                                                  selectedUserID={selectedUser}
                                                  sentMessage={newMessage}
                                                  sentFiles={newFile}
                                                  receivedMessage={receivedMessage}
                                                  roomID={roomId}
                                                  />:
                      <p>Select A user</p>}

                </div>

                 {selectedUser&&  <form className="chat-form" action="">
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
                        <button className="chat-btn" onClick={sendMessage}>Send</button>
                  </form>}

            </div>
           {moreClicked&& 
           <div className="more-group-details">
               <div className="more-group-details-header">
                  <button className="exit-btn"onClick={()=>{setMoreClicked(false)}}>         <RxCross2 />
                  </button>
                  <h4>Group Members</h4> 
                </div> 
              
                 {selectedUser.name.map((user,ind)=>(
                                      <div key={ind} className="user-info user-info-more">
                                            <ProfileCard>
                                              <h4 className="username-initial">{user.name[0]}</h4>
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
           </div>}
       </div>
  )
}


export default ChatPage


