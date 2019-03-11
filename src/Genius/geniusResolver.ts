import DataLoader from 'dataloader'
import {geniusQuery} from '.'
import {
  gatherPoints,
  pathPalette,
  makeRepetitiveScore,
  makeFullLyrics,
  resolveFrequency,
  selfSimilar,
  makeBins,
  gatherPointsAsArray,
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
    makePlayer: async (root: any, args: {query: string}) => {
      const geniusResponse = await geniusQuery(args.query)
      return await geniusResponse.data
    },
    searchGenius: async (root: any, args: {query: string}) => {
      const geniusResponse = await geniusQuery(args.query)
      return await geniusResponse.data
    },
    makePalette: async (root: any, args: {imagePath: string; id: number}) =>
      await pathPalette(args.imagePath, args.id),
  },
  GeniusTrack: {
    frequency: (root: GeniusTrack) =>
      lyricLoader.load(root.path).then(resolveFrequency),
    lyricCount: (root: GeniusTrack) =>
      lyricLoader
        .load(root.path)
        .then(
          async (sentiment: Promise<sentiment>) =>
            (await sentiment).tokens.length,
        ),
    dataArray: (root: GeniusTrack) =>
      lyricLoader
        .load(root.path)
        .then(resolveFrequency)
        .then(gatherPoints),
    smallDataArray: (root: GeniusTrack) =>
      lyricLoader
        .load(root.path)
        .then(resolveFrequency)
        .then(gatherPointsAsArray),
    fullLyrics: (root: GeniusTrack) =>
      lyricLoader
        .load(root.path)
        .then(
          async (sentiment: Promise<sentiment>) => (await sentiment).tokens,
        ),
    fullUniqueLyrics: (root: GeniusTrack) =>
      lyricLoader
        .load(root.path)
        .then(async (sentiment: Promise<sentiment>) => [
          ...new Set((await sentiment).tokens),
        ]),
    fullUniqueLyricCount: (root: GeniusTrack) =>
      lyricLoader
        .load(root.path)
        .then(
          async (sentiment: Promise<sentiment>) =>
            [...new Set((await sentiment).tokens)].length,
        ),
    palette: (root: GeniusTrack) => pathPalette(root.header_image_url, root.id),
    sentiment: (root: GeniusTrack) => lyricLoader.load(root.path),
    repetitiveScore: (root: GeniusTrack) =>
      lyricLoader
        .load(root.path)
        .then(resolveFrequency)
        .then(gatherPoints)
        .then(makeRepetitiveScore),
    bins: (root: GeniusTrack) =>
      lyricLoader
        .load(root.path)
        .then(resolveFrequency)
        .then(gatherPoints)
        .then(selfSimilar)
        .then(makeBins),
  },
  GeniusResponse: {
    hits: (root: GeniusResponse, args: limit): GeniusHit[] =>
      root.hits.slice(0, args.limit),
  },
}

type hits = (root: GeniusResponse, args?: limit) => GeniusHit[]
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
