"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolvers = void 0;

var _dataloader = _interopRequireDefault(require("dataloader"));

var _ = require(".");

var _lyricFrequency = require("./lyricFrequency");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const lyricLoader = new _dataloader.default(_lyricFrequency.makeFullLyrics);
const resolvers = {
  Query: {
    makePlayer: async (root, args) => {
      const geniusResponse = await (0, _.geniusQuery)(args.query);
      return await geniusResponse.data;
    },
    searchGenius: async (root, args) => {
      const geniusResponse = await (0, _.geniusQuery)(args.query);
      return await geniusResponse.data;
    },
    makePalette: async (root, args) => await (0, _lyricFrequency.pathPalette)(args.imagePath, args.id)
  },
  GeniusTrack: {
    frequency: root => lyricLoader.load(root.path).then(_lyricFrequency.resolveFrequency),
    lyricCount: root => lyricLoader.load(root.path).then(async sentiment => (await sentiment).tokens.length),
    dataArray: root => lyricLoader.load(root.path).then(_lyricFrequency.resolveFrequency).then(_lyricFrequency.gatherPoints),
    smallDataArray: root => lyricLoader.load(root.path).then(_lyricFrequency.resolveFrequency).then(_lyricFrequency.gatherPointsAsArray),
    fullLyrics: root => lyricLoader.load(root.path).then(async sentiment => (await sentiment).tokens),
    fullUniqueLyrics: root => lyricLoader.load(root.path).then(async sentiment => [...new Set((await sentiment).tokens)]),
    fullUniqueLyricCount: root => lyricLoader.load(root.path).then(async sentiment => [...new Set((await sentiment).tokens)].length),
    palette: root => (0, _lyricFrequency.pathPalette)(root.header_image_url, root.id),
    sentiment: root => lyricLoader.load(root.path),
    repetitiveScore: root => lyricLoader.load(root.path).then(_lyricFrequency.resolveFrequency).then(_lyricFrequency.gatherPoints).then(_lyricFrequency.makeRepetitiveScore),
    bins: root => lyricLoader.load(root.path).then(_lyricFrequency.resolveFrequency).then(_lyricFrequency.gatherPoints).then(_lyricFrequency.selfSimilar).then(_lyricFrequency.makeBins)
  },
  GeniusResponse: {
    hits: (root, args) => root.hits.slice(0, args.limit)
  }
};
exports.resolvers = resolvers;