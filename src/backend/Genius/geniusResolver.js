import DataLoader from 'dataloader'
import { makeExecutableSchema } from 'graphql-tools'
import R from 'ramda'
import { geniusQuery } from '../Genius'
import {
  pathPalette,
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
    generateGrid: async (_, obj) => makeColorArr(obj)
  },
  Query: {
    makePlayer: async (_, args) => {
      const geniusResponse = await geniusQuery(args.query)
      return await geniusResponse.data
    },
    makePalette: async (_, args) => await pathPalette(args.imagePath)
  },
  GeniusTrack: {
    fullLyrics: obj => lyricLoader.load([obj.path]),
    frequency: obj => lyricLoader.load([obj.path]).then(resolveFrequency),
    uniqueLyrics: async obj =>
      lyricLoader.load([obj.path]).then(arr => arr.length),
    palette: obj => pathPalette(obj.header_image_url)
  },
  GeniusResponse: {
    hits: async (obj, args) => await R.take(args.limit)(obj.hits)
  }
}

export const executableSchema = makeExecutableSchema({ typeDefs, resolvers })
