import DataLoader from 'dataloader'
import {makeExecutableSchema} from 'graphql-tools'
import * as R from 'ramda'
import {geniusQuery} from '../Genius'
import {gatherPoints, pathPalette, makeColorArr, makeFullLyrics, resolveFrequency} from './lyricFrequency'

import {typeDefs} from './typeDefs'

const lyricLoader = new DataLoader(makeFullLyrics) // Literally saves my ass sooooooo much

const resolvers = {
  Mutation: {
    generateGrid: async(_, obj) => makeColorArr(obj)
  },
  Query: {
    makePlayer: async(_, args) => {
      const geniusResponse = await geniusQuery(args.query)
      return await geniusResponse.data
    },
    searchGenius: async(_, args) => {
      const geniusResponse = await geniusQuery(args.query)
      return await geniusResponse.data
    },
    makePalette: async(_, args) => await pathPalette(args.imagePath)
  },
  GeniusTrack: {
    frequency: obj => lyricLoader
      .load([obj.path])
      .then(resolveFrequency),
    lyricCount: async obj => lyricLoader
      .load([obj.path])
      .then(arr => arr.length),
    dataArray: obj => lyricLoader
      .load([obj.path])
      .then(resolveFrequency)
      .then(gatherPoints),
    fullLyrics: obj => lyricLoader.load([obj.path]),
    fullUniqueLyrics: obj => lyricLoader
      .load([obj.path])
      .then(arr => [...new Set(arr)]), // get unique arr
    fullUniqueLyricCount: obj => lyricLoader
      .load([obj.path])
      .then(arr => [...new Set(arr)].length),
    palette: obj => pathPalette(obj.header_image_url)
  },
  GeniusResponse: {
    hits: async(obj, args) => await R.take(args.limit)(obj.hits)
  }
}

export const executableSchema = makeExecutableSchema({typeDefs, resolvers})
