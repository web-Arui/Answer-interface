const Koa = require('koa')
const app = new Koa()
const path = require('path')
const router = require('./router/router')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
// 指定目录
app.use(koaStatic(path.join(__dirname, '/public')))
// 解决跨域 
const zhoux = require('koa2-cors')
app.use(zhoux()); 

app.use(koaBody({
  multipart: true, // 启用文件
  formidable: {
    uploadDir: path.join(__dirname, '/public/uploads'), // 设置上传文件目录
    keepExtensions: true, // 保留扩展名
    maxFileSize: 2*1024*1024, // 限制文件大小2M
  }
}))

// 参数 校验
const parameter = require('koa-parameter')
app.use(parameter(app))
// 链接数据库
const mongoose = require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/dati',{useNewUrlParser: true})
.then(()=>{
  console.log('mongodb dati start')
})
.catch((err)=>{
  console.log(err)
})
// 挂载总路由
app
  .use(router.routes())
  .use(router.allowedMethods());
app.listen(3010,()=>{
  console.log('3010 start')
})


