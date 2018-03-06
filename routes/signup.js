const fs = require('fs')
const path = require('path')
const sha1 = require('sha1')

const express = require('express')
const router = express.Router()

const UserModel= require('../models/users')
const checkNotLogin = require('../middlewares/check').checkNotLogin
// 注册页
router.get('/', checkNotLogin, (req,res,next)=>{
  res.render('signup')
})
// 用户注册
router.post('/', checkNotLogin, (req,res,next)=>{
  const name = req.fields.name
  const gender = req.fields.gender
  const bio = req.fields.bio
  const avatar = req.files.avatar.path.split(path.sep).pop()
  let password = req.fields.password
  const repassword = req.fields.repassword

  try{
    if(!(name.length >=1 && name.length<=10)){
      throw new Error('名字请限制在1-10个字符')
    }
    if(['m','f','x'].indexOf(gender) === -1){
      throw new Error('性别错误')
    }
    if(!(bio.length >= 1 && bio.length <= 30)){
      throw new Error('简介请限制在1-30个字符')
    }
    if(!req.files.avatar.name){
      throw new Error('缺少头像')
    }
    if(password.length<6){
      throw new Error('密码至少6个字符')
    }
    if(password !== repassword){
      throw new Error('两次输入密码不一致')
    }
  }catch(e){
    // 注册失败，异步删除上传的头像
    fs.unlink(req.files.avatar.path)
    req.flash('error', e.message)
    return res.redirect('/signup')
  }
  // 明文密码加密
  password = sha1(password)

  let user = {
    name: name,
    password: password,
    gender: gender,
    bio: bio,
    avatar: avatar
  }
  // 用户信息写入数据库
  UserModel.create(user).then((result)=>{
    // 插入MongoDB后的值，包含_id
    user = result.ops[0]
    delete user.password
    req.session.user = user
    req.flash('success', '注册成功')
    res.redirect('/posts')
  }).catch((e)=>{
    // 注册失败删除上传的头像
    fs.unlink(req.files.avatar.path)
    if(e.message.match('duplicate key')){
      req.flash('error', '用户名已被占用')
      return res.redirect('signup')
    }
    next(e)
  })
})



module.exports = router
