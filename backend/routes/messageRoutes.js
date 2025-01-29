const express = require('express')
const router = express.Router()
const multer = require('multer')
const {sendMessage, receiveMessage, getAllMessages, getLastMessage} = require('../controllers/messageController')
const auth = require('../middleware/Auth')
const storage = require('../middleware/multer')
const upload = multer({storage:storage})
router.use(auth)// this is the auth middleware. All request that have the path '/api/message' lead  here and must go through "auth" which verifies the users before they can access the routes below


router.post('/send', sendMessage)// route from sending messages. Which has a second argument of a callbackfunction "sendMessages" defined in "../controllers/messageController"

router.get(['/receive/one2one/:senderId/','/receive/group/:roomId'], receiveMessage )// route for reveiving messages. 
router.get('/receive/all',getAllMessages)
router.get('/receive/lastmessages',getLastMessage)
module.exports = router// EXPORT the routes to use them when a specific path is used(/api/messages/...)