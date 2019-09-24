const mongoose = require('mongoose')
const {Schema, model} = mongoose
// userSchema
const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: { //头像
    type: String,
    default:''
  },
  gender: { // 性别，枚举
    type: String,
    enum: ['male', 'fmale'], default: 'male', required: true
  },
  personal:{ // 个人简介
    type: String
  },
  bankf:{
    type:Number,
    default:0
  },
  bankx:{ // 是否过关
    type: [
     {
       f:{type:Number},
       g:{type:String,default:'false'}
     }
    ],
  }

})
// 生成模型
module.exports = mo = model('User',userSchema)
