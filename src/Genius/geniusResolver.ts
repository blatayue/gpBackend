import DataLoader from 'dataloader'
import {geniusQuery} from '.'
import {
  gatherPoints,
  pathPalette,
  makeRepetitiveScore,
  makeFullLyrics,
  resolveFrequency,
} from './lyricFrequency'

interface sentiment {
  score: number
  comparative: number
  tokens: string[]
  words: string[]
  positive: string[]
  negative: string[]
}

const lyricLoader = new DataLoader(makeFullLyrics)

export const resolvers = {
         Query: {
           makePlayer: async (_: any, args: {query: string}) => {
             const geniusResponse = await geniusQuery(args.query)
             return await geniusResponse.data
           },
           searchGenius: async (_: any, args: {query: string}) => {
             const geniusResponse = await geniusQuery(args.query)
             return await geniusResponse.data
           },
           makePalette: async (
             _: any,
             args: {imagePath: string; id: number},
           ) => await pathPalette(args.imagePath, args.id),
         },
         GeniusTrack: {
           frequency: (obj: GeniusTrack) =>
             lyricLoader.load(obj.path).then(resolveFrequency),
           lyricCount: (obj: GeniusTrack) =>
             lyricLoader
               .load(obj.path)
               .then(
                 async (sentiment: Promise<sentiment>) =>
                   (await sentiment).tokens.length,
               ),
           dataArray: (obj: GeniusTrack) =>
             lyricLoader
               .load(obj.path)
               .then(resolveFrequency)
               .then(gatherPoints),
           fullLyrics: (obj: GeniusTrack) =>
             lyricLoader
               .load(obj.path)
               .then(
                 async (sentiment: Promise<sentiment>) =>
                   (await sentiment).tokens,
               ),
           fullUniqueLyrics: (obj: GeniusTrack) =>
             lyricLoader
               .load(obj.path)
               .then(async (sentiment: Promise<sentiment>) => [
                 ...new Set((await sentiment).tokens),
               ]),
           fullUniqueLyricCount: (obj: GeniusTrack) =>
             lyricLoader // get unique arr
               .load(obj.path)
               .then(
                 async (sentiment: Promise<sentiment>) =>
                   [...new Set((await sentiment).tokens)].length,
               ),
           palette: (obj: GeniusTrack) =>
             pathPalette(obj.header_image_url, obj.id),
           sentiment: (obj: GeniusTrack) => lyricLoader.load(obj.path),
           repetitiveScore: (obj: GeniusTrack) =>
             lyricLoader
               .load(obj.path)
               .then(resolveFrequency)
               .then(gatherPoints)
               .then(makeRepetitiveScore),
         },
         GeniusResponse: {
           hits: (obj: GeniusResponse, args: limit): GeniusHit[] =>
             obj.hits.slice(0, args.limit),
         },
       }

type hits = (obj: GeniusResponse, args?: limit) => GeniusHit[]
type GeniusResponse = {
  hits: GeniusHit[]
}
interface limit {
  limit: number
}
type GeniusHit = {
  highlights: [string]
  index: string
  type: string
  result: GeniusTrack
}
interface GeniusResponseArgs {
  limit: number
}
interface GeniusTrack {
  id: number
  annotation_count: number
  api_path: string
  full_title: string
  header_image_thumbnail_url: string
  header_image_url: string
  lyric_owner_id: number
  lyrics_state: string
  path: string
  pyongs_count: number
  song_art_thumbnail_url: string
  title: string
  title_with_featured: string
  url: string
  fullLyrics: [string]
  lyricCount: number
  fullUniqueLyricCount: number
  fullUniqueLyrics: [string]
  palette: [string]
  dataArray: [{x: number; y: number}]
  sentiment: sentiment
  repetitiveScore: number
}
