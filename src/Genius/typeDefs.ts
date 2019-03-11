import {gql} from 'apollo-server'
export const typeDefs = gql`
  type Song {
    meta: GeniusMeta
    response: GeniusResponse
  }

  type GeniusMeta {
    status: Int
  }
  type GeniusResponse {
    hits(limit: Int): [GeniusHit]
  }

  type GeniusHit {
    highlights: [String]
    index: String
    type: String
    result: GeniusTrack
  }

  type GeniusTrack {
    id: ID!
    annotation_count: Int
    api_path: String
    full_title: String
    header_image_thumbnail_url: String
    header_image_url: String
    lyric_owner_id: Int
    lyrics_state: String
    path: String
    pyongs_count: Int
    song_art_thumbnail_url: String
    stats: GeniusStats
    title: String
    title_with_featured: String
    url: String
    primary_artist: GeniusArtist
    fullLyrics: [String]
    frequency: [CellInfo]
    lyricCount: Int
    fullUniqueLyricCount: Int
    fullUniqueLyrics: [String]
    palette: [String]
    dataArray: [Point]
    smallDataArray: [[Int]]
    sentiment: Sentiment
    repetitiveScore: Float
    bins: [yBin]
  }
  type Sentiment {
    score: Int
    comparative: Float
    tokens: [String]
    words: [String]
    positive: [String]
    negative: [String]
  }
  type Point {
    x: Int
    y: Int
  }
  type GeniusStats {
    hot: Boolean
    unreviewed_annotations: Int
    concurrents: Int
    pageview: Int
  }

  type GeniusArtist {
    id: ID!
    api_path: String
    header_image_url: String
    image_url: String
    is_meme_verified: Boolean
    is_verified: Boolean
    name: String
    url: String
  }

  type CellInfo {
    stem: String
    freq: Int
    originalWords: [String]
    indices: [Int]
  }

  type lyricFrequency {
    frequency: [String]
    fullLyrics: [String]
    title: String
    uniqueLyrics: Int
    palette: [String]
    grid(pathProp: ImagePath): [[String]]
  }
  type yBin {
    bin: Int
    bins: [xBin]
  }
  type xBin {
    bin: Int
  }

  enum ImagePath {
    header_image_thumbnail_url
    header_image_url
    song_art_thumbnail_url
  }

  input inputCellInfo {
    stem: String
    freq: Int
    originalWords: [String]
    indices: [Int]
  }

  type palette {
    palette: [String]
  }

  type Query {
    makePlayer(query: String!): Song
    searchGenius(query: String!): Song
    makePalette(imagePath: String!, id: Int!): palette
  }

  schema {
    query: Query
  }
`
