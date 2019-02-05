"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolvers = void 0;

var _dataloader = _interopRequireDefault(require("dataloader"));

var R = _interopRequireWildcard(require("ramda"));

var _Genius = require("../Genius");

var _lyricFrequency = require("./lyricFrequency");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const lyricLoader = new _dataloader.default(_lyricFrequency.makeFullLyrics);
const resolvers = {
  Query: {
    makePlayer: async (_, args) => {
      const geniusResponse = await (0, _Genius.geniusQuery)(args.query);
      return await geniusResponse.data;
    },
    searchGenius: async (_, args) => {
      const geniusResponse = await (0, _Genius.geniusQuery)(args.query);
      return await geniusResponse.data;
    },
    makePalette: async (_, args) => await (0, _lyricFrequency.pathPalette)(args.imagePath)
  },
  GeniusTrack: {
    frequency: obj => lyricLoader.load([obj.path]).then(_lyricFrequency.resolveFrequency),
    lyricCount: async obj => lyricLoader.load([obj.path]).then(arr => arr.length),
    dataArray: obj => lyricLoader.load([obj.path]).then(_lyricFrequency.resolveFrequency).then(_lyricFrequency.gatherPoints),
    fullLyrics: obj => lyricLoader.load([obj.path]),
    fullUniqueLyrics: obj => lyricLoader.load([obj.path]).then(arr => [...new Set(arr)]),
    // get unique arr
    fullUniqueLyricCount: obj => lyricLoader.load([obj.path]).then(arr => [...new Set(arr)].length),
    palette: obj => (0, _lyricFrequency.pathPalette)(obj.header_image_url),
    sentiment: obj => lyricLoader.load([obj.path]).then(_lyricFrequency.getSentiment),
    frequencyArea: obj => lyricLoader.load([obj.path]).then(_lyricFrequency.resolveFrequency).then(_lyricFrequency.gatherPoints).then(_lyricFrequency.makeArea)
  },
  GeniusResponse: {
    hits: async (obj, args) => await R.take(args.limit)(obj.hits)
  }
};
exports.resolvers = resolvers;