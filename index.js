import graphqlHTTP from 'koa-graphql'
import Koa from 'koa'
import Router from 'koa-router'
import { executableSchema as schema } from './src/backend/Genius'

const port = parseInt(process.env.PORT || 3000)
const server = new Koa()
const router = new Router()

router.all(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
    pretty: true
  })
)
server.use(router.routes())
server.listen(port, () => {
  console.log('listening internally on port ' + port)
})
