import React from 'react'
import { FiUpload } from "react-icons/fi";
import {useUserContext} from '../hooks/useUserContext'
export default function UpdateUser({profileForm}){

     const [profileImage,setProfileImage] = React.useState(null)
     const [previewImage,setPreviewImage] = React.useState(null)
     const {dispatch,user} = useUserContext()
     const cloudinaryUpload= async()=>{
        console.log('inside cloudinaryUpload viewing UPLOADED PROFILE: ',profileImage )
                      const formData = new FormData()
                      formData.append('file',profileImage)
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
                        return data.secure_url
                      }
                      catch(err){
                        console.log("Error from cloudinary: ", err.message)
                      }
                    }

    const upload=async(e)=>{
        e.preventDefault()
        console.log("URL.createObjectURL(profileImage): ",URL.createObjectURL(profileImage))
        setPreviewImage(URL.createObjectURL(profileImage))
    }
    const save=async(e)=>{
        e.preventDefault()
        console.log("inside save")
        const cloudImageUrl= await cloudinaryUpload()
        try{
            console.log("inside try")
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/updateuser`,{
                method:"PATCH",
                headers:{'Content-Type':'application/json'},
                credentials:'include',
                body:JSON.stringify({imageUrl:cloudImageUrl})
            })
            console.log("making backend requeste")
            if(!res.ok){
                const errorData = await res.json()
                console.log("error in profileCard upload(): ",errorData)
                throw Error(errorData)
            }
            const data = await res.json()
            console.log("Success Uploading Profile: ",data)
            dispatch({type:'UPDATE',payload:previewImage})
            profileForm()
        }
        catch(err){
            console.log("error in Profile Pic: ",err)
        }

    }
    return(
        <div className="update-profile">
            {!previewImage&&<form className="update-profile-form">
                <div className="update-profile-form-btns">
                    <input type="file" className="update-profile-input" onChange={(e)=>{setProfileImage(e.target.files[0])}} />
                    <div className="cloudUpload">
                         <FiUpload />
                    </div>
                    <button onClick={upload}> Preview</button>
                    <button className="preview-btn cancle" onClick={profileForm}>cancel</button>
                </div>
            </form>}
            {!previewImage&&<img className="update-profile-current-pic"src={user.imageUrl} alt="" />}

            {previewImage&& <form className="preveiw-btns">
                    <button className="preview-btn save" onClick={save}>save</button>
                    <button className="preview-btn cancle" onClick={()=>{setPreviewImage(false)}}>cancel</button>
                </form>}
            {previewImage&& <img className="preview-image" src={previewImage}/>}
        </div>
    )
}