const User = require('../lib/mongo').User

module.exports = {
  // 注册一个用户
  create(user){
    return User.create(user).exec()
  },
  /**
   * 获取用户信息
   * addCreatedAt自定义插件(通过_id生成时间戳)
   */
  getUserByName(name){
    return User.findOne({name: name}).addCreatedAt().exec()
  }
}
