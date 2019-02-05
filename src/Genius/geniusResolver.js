import DataLoader from 'dataloader'
import * as R from 'ramda'
import {geniusQuery} from '../Genius'
import {
  gatherPoints,
  pathPalette,
  makeRepetitiveScore,
  makeFullLyrics,
  resolveFrequency,
  makeSentiment,
} from './lyricFrequency'

const lyricLoader = new DataLoader(makeFullLyrics)

export const resolvers = {
  Query: {
    makePlayer: async (_, args) => {
      const geniusResponse = await geniusQuery(args.query)
      return await geniusResponse.data
    },
    searchGenius: async (_, args) => {
      const geniusResponse = await geniusQuery(args.query)
      return await geniusResponse.data
    },
    makePalette: async (_, args) => await pathPalette(args.imagePath),
  },
  GeniusTrack: {
    frequency: obj => lyricLoader.load([obj.path]).then(resolveFrequency),
    lyricCount: async obj =>
      lyricLoader.load([obj.path]).then(arr => arr.length),
    dataArray: obj =>
      lyricLoader
        .load([obj.path])
        .then(resolveFrequency)
        .then(gatherPoints),
    fullLyrics: obj => lyricLoader.load([obj.path]),
    fullUniqueLyrics: obj =>
      lyricLoader.load([obj.path]).then(arr => [...new Set(arr)]),
    fullUniqueLyricCount: obj =>
      lyricLoader // get unique arr
        .load([obj.path])
        .then(arr => [...new Set(arr)].length),
    palette: obj => pathPalette(obj.header_image_url),
    sentiment: obj => lyricLoader.load([obj.path]).then(makeSentiment),
    repetitiveScore: obj =>
      lyricLoader
        .load([obj.path])
        .then(resolveFrequency)
        .then(gatherPoints)
        .then(makeRepetitiveScore),
  },
  GeniusResponse: {
    hits: async (obj, args) => await R.take(args.limit)(obj.hits),
  },
}
