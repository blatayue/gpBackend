"use strict";

var _microCors = _interopRequireDefault(require("micro-cors"));

var _apolloServerMicro = require("apollo-server-micro");

var _Genius = require("./Genius");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('newrelic');

const apolloServer = new _apolloServerMicro.ApolloServer({
  typeDefs: _Genius.typeDefs,
  resolvers: _Genius.resolvers,
  introspection: true,
  playground: {
    settings: {
      'editor.theme': 'light'
    }
  }
});
module.exports = (0, _microCors.default)()(apolloServer.createHandler());