const Router = require('koa-router')
const User = require('../model/user')
const jwt = require('jsonwebtoken')
const path = require('path')
const fs = require('fs')
// const jwt = require('koa-jwt')
// 前缀
const userRouter = new Router({ prefix: '/users' })
// token认证中间件 放在路由 是函数
const auth = async (ctx, next) => {
  const { authorization = '' } = ctx.request.header
  const token = authorization.replace('Bearer ', '')
  try {
    const user = jwt.verify(token, 'aaa')
    ctx.state.user = user
  } catch (err) {
    ctx.throw(500, '没有权限')
    return;
  }
  await next()
}

// $route GET /api/users/test
// @desc 返回json
// @access public
userRouter.get('/test', async (ctx) => {
  ctx.body = { testf: 'ok' }
})

// $route POST /api/users/upload/:id
// @desc 上传头像
// @access public
userRouter.post('/upload/:id', async (ctx) => {
  const file = ctx.request.files.file
  // 拿到文件名包括扩展名
  const basename = path.basename(file.path)
  const userx = await User.findById(ctx.params.id)

  if (userx.avatar != '') {
    var filePath = userx.avatar.substr(ctx.origin.length)
    fs.unlink('./public' + filePath, (err) => {
      if (err) {
        console.log(err)
        return;
      }
    })


  }

  const user = await User.findByIdAndUpdate(ctx.params.id, { avatar: `${ctx.origin}/uploads/${basename}` })
  ctx.body = { meta: { msg: "上传成功", status: 200 }, data: user }

})

// $route GET /api/users/pai/:id
// @desc  获取排名
userRouter.get('/pai/:id',auth, async (ctx) => {
  const count = await User.find()
  const user = await User.aggregate([{ $project: { bankf: 1, avatar: 1, name: 1 } }, { $sort: { bankf: -1 } }])
  console.log(ctx.params.id)
  let paimin = -1
  let arr = []
  for(var i =0;i<user.length;i++){
    if(i<4){
      arr.push(user[i])
    }
    if(user[i]._id==ctx.params.id){
      paimin = i+1
    }
  }


  ctx.body = { meta: { msg: "ok", count: count.length, status: 200 }, data: {arr,paimin}}
})

// $route POST /api/users/register
// @desc 注册用户
userRouter.post('/register', async (ctx) => {
  ctx.verifyParams({
    name: { type: 'string', required: true },
    password: { type: 'string', required: true }
  })
  const { name } = ctx.request.body
  const reuser = await User.findOne({ name: name })
  if (reuser) {
    ctx.body = { meta: { msg: "用户名重复", status: 409 }, data: reuser }
    return;
  }
  const user = await new User(ctx.request.body).save()
  ctx.body = { meta: { msg: "ok", status: 200 }, data: user }
})
// $route POST /api/users/login
// @desc  登陆用户
userRouter.post('/login', async (ctx) => {
  ctx.verifyParams({
    name: { type: 'string', required: true },
    password: { type: 'string', required: true }
  })

  const user = await User.findOne(ctx.request.body)
  if (!user) {
    ctx.body = { meta: { msg: "用户名或密码错误", status: 500 }, data: user }
    return;

  }
  // 参数一  保存jwt 登陆后保留这些字段
  // 参数二加密名字 
  // 第三个参数 过期时间 分钟  
  // 第四个参数 回调函数
  const { _id, name } = user
  const token = jwt.sign({ _id, name }, 'aaa', { expiresIn: 3600 })

  ctx.body = { meta: { msg: "ok", status: 200 }, data:{token: "Bearer " + token,id:_id }}
})
// $route GET /api/users/
// @desc  获取用户列表 分页
userRouter.get('/',auth, async (ctx) => {
  let pagesize = ctx.query.pagesize
  let pagenumber = ctx.query.pagenumber
  const count = await User.find()
  const user = await User.find().skip(pagesize * (pagenumber - 1)).limit(pagesize * 1)
  ctx.body = { meta: { msg: "ok", count: count.length, status: 200 }, data: user }
})
// $route GET /api/users/search
// @desc  根据用户名搜索用户
userRouter.get('/search',auth, async (ctx) => {
  const user = await User.find()
  let reuser = user.filter((item) => {
    return -1 != item.name.indexOf(ctx.query.name)
  })
  ctx.body = { meta: { msg: "ok", status: 200 }, data: reuser }
})
// $route GET /api/users/:id
// @desc  获取指定用户用户
userRouter.get('/:id', auth,async (ctx) => {
  const user = await User.findById(ctx.params.id)
  if (!user) {
    ctx.throw(404, '用户不存在');
    return;
  }
  ctx.body = { meta: { msg: "ok", status: 200 }, data: user }
})
// $route PUT /api/users/:id
// @desc  编辑用户 通关关卡
userRouter.put('/:id',auth, async (ctx) => {
  const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
  if (!user) {
    ctx.body = { meta: { msg: "用户不存在", status: 404 }, data: user }
    return;
  }

  ctx.body = { meta: { msg: "ok", status: 200 }, data: user }
})
// $route DElETE /api/users/:id
// @desc  删除用户
userRouter.delete('/:id',auth, async (ctx) => {
  const user = await User.findByIdAndRemove(ctx.params.id)
  if (!user) {
    ctx.body = { meta: { msg: "用户不存在", status: 404 }, data: user }
    return;
  }
  ctx.body = { meta: { msg: "删除成功", status: 204 }, data: user }
})
// $route PUT /api/users/bank/:id
// @desc   通关关卡
userRouter.put('/bank/:id',auth, async (ctx) => {
  // 查出通关信息
  const userx = await User.findById(ctx.params.id)
  if (!userx) {
    ctx.throw(404, '用户不存在');
    return;
  }
  const { bankx } = userx
  const { index, f, g } = ctx.request.body
  bankx[index] = {
    g: g,
    f: f
  }
  // 计算总分数
  let fff = 0;
  for (let i = 0; i < bankx.length; i++) {
    if (typeof bankx[i] != "undefined") {
      fff += bankx[i].f
    }
  }
  userx.bankf = fff
  const user = await User.findByIdAndUpdate(ctx.params.id, userx)
  if (!user) {
    ctx.body = { meta: { msg: "用户不存在", status: 404 }, data: user }
    return;
  }

  ctx.body = { meta: { msg: "ok", status: 200 }, data: user }
})


module.exports = userRouter.routes()