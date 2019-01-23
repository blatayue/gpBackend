import cors from 'micro-cors'
import {ApolloServer} from 'apollo-server-micro'
import {resolvers, typeDefs} from './Genius'

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  playground: {
    settings: {
      'editor.theme': 'light',
    },
  },
})

module.exports = cors()(apolloServer.createHandler())
