"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.typeDefs = void 0;

var _apolloServer = require("apollo-server");

const typeDefs = _apolloServer.gql`
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
    sentiment: Sentiment
    repetitiveScore: Float
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

  type Query {
    makePlayer(query: String!): Song
    searchGenius(query: String!): Song
    makePalette(imagePath: String!): [String]
  }

  schema {
    query: Query
  }
`;
exports.typeDefs = typeDefs;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9HZW5pdXMvdHlwZURlZnMuanMiXSwibmFtZXMiOlsidHlwZURlZnMiLCJncWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTs7QUFDTyxNQUFNQSxRQUFRLEdBQUdDLGlCQUFJOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQXJCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtncWx9IGZyb20gJ2Fwb2xsby1zZXJ2ZXInXHJcbmV4cG9ydCBjb25zdCB0eXBlRGVmcyA9IGdxbGBcclxuICB0eXBlIFNvbmcge1xyXG4gICAgbWV0YTogR2VuaXVzTWV0YVxyXG4gICAgcmVzcG9uc2U6IEdlbml1c1Jlc3BvbnNlXHJcbiAgfVxyXG5cclxuICB0eXBlIEdlbml1c01ldGEge1xyXG4gICAgc3RhdHVzOiBJbnRcclxuICB9XHJcbiAgdHlwZSBHZW5pdXNSZXNwb25zZSB7XHJcbiAgICBoaXRzKGxpbWl0OiBJbnQpOiBbR2VuaXVzSGl0XVxyXG4gIH1cclxuXHJcbiAgdHlwZSBHZW5pdXNIaXQge1xyXG4gICAgaGlnaGxpZ2h0czogW1N0cmluZ11cclxuICAgIGluZGV4OiBTdHJpbmdcclxuICAgIHR5cGU6IFN0cmluZ1xyXG4gICAgcmVzdWx0OiBHZW5pdXNUcmFja1xyXG4gIH1cclxuXHJcbiAgdHlwZSBHZW5pdXNUcmFjayB7XHJcbiAgICBpZDogSUQhXHJcbiAgICBhbm5vdGF0aW9uX2NvdW50OiBJbnRcclxuICAgIGFwaV9wYXRoOiBTdHJpbmdcclxuICAgIGZ1bGxfdGl0bGU6IFN0cmluZ1xyXG4gICAgaGVhZGVyX2ltYWdlX3RodW1ibmFpbF91cmw6IFN0cmluZ1xyXG4gICAgaGVhZGVyX2ltYWdlX3VybDogU3RyaW5nXHJcbiAgICBseXJpY19vd25lcl9pZDogSW50XHJcbiAgICBseXJpY3Nfc3RhdGU6IFN0cmluZ1xyXG4gICAgcGF0aDogU3RyaW5nXHJcbiAgICBweW9uZ3NfY291bnQ6IEludFxyXG4gICAgc29uZ19hcnRfdGh1bWJuYWlsX3VybDogU3RyaW5nXHJcbiAgICBzdGF0czogR2VuaXVzU3RhdHNcclxuICAgIHRpdGxlOiBTdHJpbmdcclxuICAgIHRpdGxlX3dpdGhfZmVhdHVyZWQ6IFN0cmluZ1xyXG4gICAgdXJsOiBTdHJpbmdcclxuICAgIHByaW1hcnlfYXJ0aXN0OiBHZW5pdXNBcnRpc3RcclxuICAgIGZ1bGxMeXJpY3M6IFtTdHJpbmddXHJcbiAgICBmcmVxdWVuY3k6IFtDZWxsSW5mb11cclxuICAgIGx5cmljQ291bnQ6IEludFxyXG4gICAgZnVsbFVuaXF1ZUx5cmljQ291bnQ6IEludFxyXG4gICAgZnVsbFVuaXF1ZUx5cmljczogW1N0cmluZ11cclxuICAgIHBhbGV0dGU6IFtTdHJpbmddXHJcbiAgICBkYXRhQXJyYXk6IFtQb2ludF1cclxuICAgIHNlbnRpbWVudDogU2VudGltZW50XHJcbiAgICByZXBldGl0aXZlU2NvcmU6IEZsb2F0XHJcbiAgfVxyXG4gIHR5cGUgU2VudGltZW50IHtcclxuICAgIHNjb3JlOiBJbnRcclxuICAgIGNvbXBhcmF0aXZlOiBGbG9hdFxyXG4gICAgdG9rZW5zOiBbU3RyaW5nXVxyXG4gICAgd29yZHM6IFtTdHJpbmddXHJcbiAgICBwb3NpdGl2ZTogW1N0cmluZ11cclxuICAgIG5lZ2F0aXZlOiBbU3RyaW5nXVxyXG4gIH1cclxuICB0eXBlIFBvaW50IHtcclxuICAgIHg6IEludFxyXG4gICAgeTogSW50XHJcbiAgfVxyXG4gIHR5cGUgR2VuaXVzU3RhdHMge1xyXG4gICAgaG90OiBCb29sZWFuXHJcbiAgICB1bnJldmlld2VkX2Fubm90YXRpb25zOiBJbnRcclxuICAgIGNvbmN1cnJlbnRzOiBJbnRcclxuICAgIHBhZ2V2aWV3OiBJbnRcclxuICB9XHJcblxyXG4gIHR5cGUgR2VuaXVzQXJ0aXN0IHtcclxuICAgIGlkOiBJRCFcclxuICAgIGFwaV9wYXRoOiBTdHJpbmdcclxuICAgIGhlYWRlcl9pbWFnZV91cmw6IFN0cmluZ1xyXG4gICAgaW1hZ2VfdXJsOiBTdHJpbmdcclxuICAgIGlzX21lbWVfdmVyaWZpZWQ6IEJvb2xlYW5cclxuICAgIGlzX3ZlcmlmaWVkOiBCb29sZWFuXHJcbiAgICBuYW1lOiBTdHJpbmdcclxuICAgIHVybDogU3RyaW5nXHJcbiAgfVxyXG5cclxuICB0eXBlIENlbGxJbmZvIHtcclxuICAgIHN0ZW06IFN0cmluZ1xyXG4gICAgZnJlcTogSW50XHJcbiAgICBvcmlnaW5hbFdvcmRzOiBbU3RyaW5nXVxyXG4gICAgaW5kaWNlczogW0ludF1cclxuICB9XHJcblxyXG4gIHR5cGUgbHlyaWNGcmVxdWVuY3kge1xyXG4gICAgZnJlcXVlbmN5OiBbU3RyaW5nXVxyXG4gICAgZnVsbEx5cmljczogW1N0cmluZ11cclxuICAgIHRpdGxlOiBTdHJpbmdcclxuICAgIHVuaXF1ZUx5cmljczogSW50XHJcbiAgICBwYWxldHRlOiBbU3RyaW5nXVxyXG4gICAgZ3JpZChwYXRoUHJvcDogSW1hZ2VQYXRoKTogW1tTdHJpbmddXVxyXG4gIH1cclxuXHJcbiAgZW51bSBJbWFnZVBhdGgge1xyXG4gICAgaGVhZGVyX2ltYWdlX3RodW1ibmFpbF91cmxcclxuICAgIGhlYWRlcl9pbWFnZV91cmxcclxuICAgIHNvbmdfYXJ0X3RodW1ibmFpbF91cmxcclxuICB9XHJcblxyXG4gIGlucHV0IGlucHV0Q2VsbEluZm8ge1xyXG4gICAgc3RlbTogU3RyaW5nXHJcbiAgICBmcmVxOiBJbnRcclxuICAgIG9yaWdpbmFsV29yZHM6IFtTdHJpbmddXHJcbiAgICBpbmRpY2VzOiBbSW50XVxyXG4gIH1cclxuXHJcbiAgdHlwZSBRdWVyeSB7XHJcbiAgICBtYWtlUGxheWVyKHF1ZXJ5OiBTdHJpbmchKTogU29uZ1xyXG4gICAgc2VhcmNoR2VuaXVzKHF1ZXJ5OiBTdHJpbmchKTogU29uZ1xyXG4gICAgbWFrZVBhbGV0dGUoaW1hZ2VQYXRoOiBTdHJpbmchKTogW1N0cmluZ11cclxuICB9XHJcblxyXG4gIHNjaGVtYSB7XHJcbiAgICBxdWVyeTogUXVlcnlcclxuICB9XHJcbmBcclxuIl19