import Koa from 'koa'
import Router from 'koa-router'

const port = parseInt(process.env.PORT || 3000)
const server = new Koa()
const router = new Router()

router.all('/')
server.use(router.routes())
server.listen(port, () => {
  console.log('NextJS listening internally on port ' + port)
})
