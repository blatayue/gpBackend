// Runs backend GraphQL server
import graphqlHTTP from 'koa-graphql'
import Koa from 'koa'
import Router from 'koa-router'
import cors from '@koa/cors'
import {executableSchema as schema} from './Genius'

const port = parseInt(process.env.PORT || 3001)
const server = new Koa()
const router = new Router()

router.all('/graphql', graphqlHTTP({schema, graphiql: true, pretty: true}))
server.use(cors())
server.use(router.routes())
server.listen(port, () => {
  console.log('listening internally on port ' + port)
})
