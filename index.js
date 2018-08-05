const Koa = require('koa')
const next = require('next')
const Router = require('koa-router')

const graphqlHTTP = require('koa-graphql')
const { graphql, buildSchema } = require('graphql')
const MyGraphQLSchema = buildSchema(`
  type Query {
    hello: String
  }
`)
const root = { hello: () => 'Hello World' }

const port = parseInt(process.env.PORT || 3000)
const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = new Koa()
  const router = new Router()
  router.all(
    '/graphql',
    graphqlHTTP({
      schema: MyGraphQLSchema,
      graphiql: true,
      rootValue: root,
      pretty: true
    })
  )
  router.get('*', async ctx => {
    await handle(ctx.req, ctx.res)
    ctx.respond = false
  })

  server.use(async (ctx, next) => {
    ctx.res.statusCode = 200
    await next()
  })

  server.use(router.routes())
  server.listen(port, () => {
    console.log('listening internally on port ' + port)
  })
})
