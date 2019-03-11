"use strict";

var _microCors = _interopRequireDefault(require("micro-cors"));

var _apolloServerMicro = require("apollo-server-micro");

var _Genius = require("./Genius");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// class SCacheControl implements GraphQLExtension {
//   public willSendResponse(o: {graphqlResponse: GraphQLResponse}) {
//     o.graphqlResponse.http.headers.set(
//       'Cache-Control',
//       `max-age=0, s-maxage=86400`,
//     )
//     o.graphqlResponse.http.headers.set('Cache-Tag', 'lyric-graphql')
//   }
// }
const apolloServer = new _apolloServerMicro.ApolloServer({
  typeDefs: _Genius.typeDefs,
  resolvers: _Genius.resolvers,
  playground: true,
  introspection: true,
  engine: {
    apiKey: process.env.APOLLO_ENGINE_KEY
  } // tracing: true,
  // extensions: [() => new SCacheControl()], // will be changed to [GraphQLExtension] in next version, no need for func

});
module.exports = (0, _microCors.default)()(apolloServer.createHandler());