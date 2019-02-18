"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolvers = void 0;

var _dataloader = _interopRequireDefault(require("dataloader"));

var _2 = require(".");

var _lyricFrequency = require("./lyricFrequency");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const lyricLoader = new _dataloader.default(_lyricFrequency.makeFullLyrics);
const resolvers = {
  Query: {
    makePlayer: async (_, args) => {
      const geniusResponse = await (0, _2.geniusQuery)(args.query);
      return await geniusResponse.data;
    },
    searchGenius: async (_, args) => {
      const geniusResponse = await (0, _2.geniusQuery)(args.query);
      return await geniusResponse.data;
    },
    makePalette: async (_, args) => await (0, _lyricFrequency.pathPalette)(args.imagePath, args.id)
  },
  GeniusTrack: {
    frequency: obj => lyricLoader.load(obj.path).then(_lyricFrequency.resolveFrequency),
    lyricCount: obj => lyricLoader.load(obj.path).then(async sentiment => (await sentiment).tokens.length),
    dataArray: obj => lyricLoader.load(obj.path).then(_lyricFrequency.resolveFrequency).then(_lyricFrequency.gatherPoints),
    fullLyrics: obj => lyricLoader.load(obj.path).then(async sentiment => (await sentiment).tokens),
    fullUniqueLyrics: obj => lyricLoader.load(obj.path).then(async sentiment => [...new Set((await sentiment).tokens)]),
    fullUniqueLyricCount: obj => lyricLoader // get unique arr
    .load(obj.path).then(async sentiment => [...new Set((await sentiment).tokens)].length),
    palette: obj => (0, _lyricFrequency.pathPalette)(obj.header_image_url, obj.id),
    sentiment: obj => lyricLoader.load(obj.path),
    repetitiveScore: obj => lyricLoader.load(obj.path).then(_lyricFrequency.resolveFrequency).then(_lyricFrequency.gatherPoints).then(_lyricFrequency.makeRepetitiveScore),
    bins: obj => lyricLoader.load(obj.path).then(_lyricFrequency.resolveFrequency).then(_lyricFrequency.gatherPoints).then(_lyricFrequency.selfSimilar).then(_lyricFrequency.makeBins)
  },
  GeniusResponse: {
    hits: (obj, args) => obj.hits.slice(0, args.limit)
  }
};
exports.resolvers = resolvers;