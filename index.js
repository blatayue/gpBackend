const Koa = require('koa')
const Router = require('koa-router')

const graphqlHTTP = require('koa-graphql')
import { importSchema } from 'graphql-import'
import { makeExecutableSchema } from 'graphql-tools'
const typeDefs = importSchema('./Genius/genius.graphql')
import { searchGenius } from './Genius/geniusQuery'
import { analyzeWithGenius } from './graphql/lyricFrequency'
const resolvers = {
  Query: {
    searchGenius: async (obj, args) => {
      const geniusResponse = await searchGenius(args.query)
      return await geniusResponse.data
    }
  },
  Mutation: {
    makeFrequency: (obj, args) => analyzeWithGenius(args.query)
  }
}
// },
// Song: {
//   meta: obj => obj.meta,
//   response: obj => obj.response
// },
// GeniusMeta: {
//   status: obj => obj.status
// },
// GeniusResponse: {
//   hits: (obj, args) => R.take(args.limit || 10)(obj.hits)
// },
// GeniusHit: {
//   highlights: obj => obj.highlights,
//   index: obj => obj.index,
//   type: obj => obj.type,
//   result: obj => obj.result
// },
// GeniusTrack: {
//   id: obj => obj.id,
//   annotation_count: obj => obj.annotation_count,
//   api_path: obj => obj.api_path,
//   full_title: obj => obj.full_title,
//   header_image_thumbnail_url: obj => obj.header_image_thumbnail_url,
//   header_image_url: obj => obj.header_image_url,
//   lyric_owner_id: obj => obj.lyric_owner_id,
//   lyrics_state: obj => obj.lyrics_state,
//   path: obj => obj.path,
//   pyongs_count: obj => obj.pyongs_count,
//   song_art_thumbnail_url: obj => obj.song_art_thumbnail_url,
//   stats: obj => obj.stats,
//   title: obj => obj.title,
//   title_with_featured: obj => obj.title_with_featured,
//   url: obj => obj.url,
//   primary_artist: obj => obj.primary_artist
// },
// GeniusStats: {
//   hot: obj => obj.hot,
//   unreviewed_annotations: obj => obj.unreviewed_annotations,
//   concurrents: obj => obj.concurrents,
//   pageview: obj => obj.pageview
// },
// GeniusArtist: {
//   id: obj => obj.id,
//   api_path: obj => obj.api_path,
//   header_image_url: obj => obj.header_image_url,
//   image_url: obj => obj.image_url,
//   is_meme_verified: obj => obj.is_meme_verified,
//   is_verified: obj => obj.is_verified,
//   name: obj => obj.name,
//   url: obj => obj.url
//   }
// }
const schema = makeExecutableSchema({ typeDefs, resolvers })

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
