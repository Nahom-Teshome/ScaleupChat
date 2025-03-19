const express = require('express')
const router = express.Router()
const {createSubscription} = require('../controllers/subscriptionController.js')
const auth = require('../middleware/Auth')

router.use(auth)
router.post('/subscribe',createSubscription)

module.exports = router
