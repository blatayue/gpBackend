import DataLoader from 'dataloader'
import { makeExecutableSchema } from 'graphql-tools'
import R from 'ramda'
import { geniusQuery } from '../Genius'
import {
  addPalette,
  makeColorArr,
  makeFullLyrics,
  resolveFrequency
} from './lyricFrequency'
import { typeDefs } from '../graphql'
const lyricLoader = new DataLoader(makeFullLyrics)

const resolvers = {
  Mutation: {
    searchGenius: async (_, args) => {
      const geniusResponse = await geniusQuery(args.query)
      return await geniusResponse.data
    },
    generateGrid: (_, obj) => makeColorArr(obj)
  },
  Query: {},
  GeniusTrack: {
    fullLyrics: R.pipe(
      R.prop('path'),
      R.of,
      lyricLoader.load
    ),
    frequency: R.pipe(
      R.prop('path'),
      R.of,
      lyricLoader.load,
      resolveFrequency
    ),
    uniqueLyrics: R.pipe(
      R.prop('path'),
      R.of,
      lyricLoader.load,
      R.prop('length')
    ),
    palette: R.pipe(
      R.prop('header_image_thumbnail_url'),
      addPalette
    )
  },
  GeniusResponse: {
    hits: (obj, args) => R.take(args.limit)(obj.hits)
  }
}

export const executableSchema = makeExecutableSchema({ typeDefs, resolvers })
