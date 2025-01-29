const express = require('express')
const router= express.Router()
const {createRoom, getMyRooms} = require('../controllers/roomController')
const auth = require('../middleware/Auth')
router.post('/create-room',createRoom)
router.use(auth)
router.get('/getmyrooms',getMyRooms)
module.exports = router