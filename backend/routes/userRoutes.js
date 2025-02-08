const express = require('express')
const router = express.Router()
const {userSignup, userLogin,getUsers,getCurrentUser,logout,getMyUsers,updateuser} = require('../controllers/userController')
const auth = require('../middleware/Auth')

router.post('/signup',userSignup)//route (/api/user/singup) for signin up calls a callback deifned in '../controllers/userController'

router.post('/login',userLogin)//route (/api/user/userLogin) for loggning in and  calls a callback deifned in '../controllers/userController'
router.use(auth)
router.get('/getusers', getUsers)
router.patch('/updateuser',updateuser)
router.get('/currentuser', getCurrentUser)
router.post('/logout', logout)
router.get('/myusers',getMyUsers)
// router.post('/logout', userLogout)

// router.delete('delete/:id',deleteAccount)




module.exports = router //export router, to be used in path "/api/user/..."