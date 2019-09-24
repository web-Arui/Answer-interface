const Router = require('koa-router')
const userRouter = require('./userRouter')
const bankRouter = require('./bankRouter')
var router = new Router()
// /api/user/:id
router.use('/api', userRouter);
router.use('/api', bankRouter);
module.exports = router