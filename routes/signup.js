const express = require('express')
const router = express.Router()

const checkNotLogin = require('../middlewares/check').checkNotLogin

router.get('/', checkNotLogin, (req,res,next)=>{
  res.render('signup')
})

router.post('/', checkNotLogin, (req,res,next)=>{
  res.send('注册')
})

module.exports = router
