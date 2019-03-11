import cors from 'micro-cors'
import {ApolloServer} from 'apollo-server-micro'
import {GraphQLExtension, GraphQLResponse} from 'graphql-extensions'
import {resolvers, typeDefs} from './Genius'
import compress from 'micro-compress'
import {createSet, applyMiddleware} from 'micro-mw'

// class SCacheControl implements GraphQLExtension {
//   public willSendResponse(o: {graphqlResponse: GraphQLResponse}) {
//     o.graphqlResponse.http.headers.set(
//       'Cache-Control',
//       `max-age=0, s-maxage=86400`,
//     )
//     o.graphqlResponse.http.headers.set('Cache-Tag', 'lyric-graphql')
//   }
// }

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  playground: true,
  introspection: true,
  engine: {
    apiKey: process.env.APOLLO_ENGINE_KEY,
  },
  // tracing: true,
  // extensions: [() => new SCacheControl()], // will be changed to [GraphQLExtension] in next version, no need for func
})

module.exports = cors()(apolloServer.createHandler())
