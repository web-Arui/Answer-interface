const mongoose = require('mongoose')
const { Schema, model } = mongoose
// 题库
const bankSchema = new Schema({
  name: {
    type: String,
  },
  subName: {
    type: String,
  },
  bank_url: { // 图库图片
    type: String,
  },
  
    bankTi:[{
      zhou:[ // 装九个关卡
        { title: String, A: String, B: String, C: String, D: String, answea: String }
      ]}
    ]
      
    
     
   
})
// 生成模型
module.exports = mo = model('Bank', bankSchema)
