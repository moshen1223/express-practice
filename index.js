const path = require('path')
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
const config = require('config-lite')(__dirname)
const routes = require('./routes')
const pkg = require('./package')

const winston = require('winston')
const expressWinston = require('express-winston')

const app = express()
// 设置模板目录
app.set('views', path.join(__dirname, 'views'))
// 设置模板引擎为 ejs
app.set('view engine', 'ejs')
// express 提供的static中间件； 设置静态文件目录
app.use(express.static(path.join(__dirname, 'public')))
/*
* session中间件
* resave: 强制更行session
* saveUninitialized: 强制创建一个session
*/
app.use(session({
  name: config.session.key,
  secret: config.session.secret,
  resave: true,
  saveUninitialized: false,
  cookie: {
    maxAge: config.session.maxAge
  },
  store: new MongoStore({
    url: config.mongodb
  })
}))
// flash中间件显示通知
app.use(flash())
/**
 * 处理表单及文件上传的中间件
 * keepExtensions 是否保留后缀
 * uploadDir 上传文件目录
 */
app.use(require('express-formidable')({
  uploadDir: path.join(__dirname, 'public/img'),
  keepExtensions: true
}))
// 设置模板全局常量
app.locals.blog = {
  title: pkg.name,
  description: pkg.description
}
// 添加模板必须的三个变量
app.use(function (req, res, next){
  res.locals.user = req.session.user
  res.locals.success = req.flash('success').toString()
  res.locals.error = req.flash('error').toString()
  next()
})

app.use(expressWinston.logger({
  transports: [
    new (winston.transports.Console)({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/success.log'
    })
  ]
}))
// 路由
routes(app)

app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.Console({
      json: true,
      colorize: true
    }),
    new winston.transports.File({
      filename: 'logs/error.log'
    })
  ]
}))

app.use(function (err, req, res, next) {
  req.flash('error', err.message)
  res.redirect('/posts')
})

if(module.parent){
  module.exports = app
}else{
  // 监听端口，启动程序
  app.listen(config.port, ()=>{
    console.log(`${pkg.name} listening on port ${config.port}`)
  })
}

