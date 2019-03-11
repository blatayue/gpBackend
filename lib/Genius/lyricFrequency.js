"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeBins = exports.selfSimilar = exports.makeRepetitiveScore = exports.gatherPointsAsArray = exports.gatherPoints = exports.pathPalette = exports.resolveFrequency = exports.makeFullLyrics = void 0;

var R = _interopRequireWildcard(require("ramda"));

var _stemr = require("stemr");

var _axios = _interopRequireDefault(require("axios"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _sentiment = _interopRequireDefault(require("sentiment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const sentiment = new _sentiment.default();

const makeFullLyrics = async paths => paths.map(async path => {
  try {
    if (!path) throw new Error(`Did not receive a path from the API response`);
    const body = await (0, _axios.default)('https://genius.com' + path);
    if (body.status !== 200) throw new Error(JSON.stringify(body));

    const rawLyrics = _cheerio.default.load(body.data)('p', '.lyrics').text(); // console.log(sentiment.analyze(rawLyrics))


    return sentiment.analyze(rawLyrics);
  } catch (err) {
    throw err;
  }
});

exports.makeFullLyrics = makeFullLyrics;

const mapWithIndex = async lyrics => (await lyrics).tokens.map((word, index) => ({
  word,
  index,
  stem: (0, _stemr.stem)(word)
}));

const freqObjFactory = word => ({
  freq: 1,
  originalWords: new Set([word.word]),
  indices: [word.index],
  stem: word.stem
});

const freqObjUpdater = word => R.evolve({
  freq: R.add(1),
  originalWords: set => set.add(word.word),
  indices: idx => [...idx, word.index],
  stem: stem => stem
});

const reduceFreqMap = async (freqP, word) => {
  const freq = await freqP;
  return freq.has(word.word) ? freq.set(word.word, freqObjUpdater(word)(freq.get(word.word))) : freq.set(word.word, freqObjFactory(word));
};

const resolveFrequency = R.pipeP(mapWithIndex, R.reduce(reduceFreqMap, Promise.resolve(new Map())));
exports.resolveFrequency = resolveFrequency;

const uploadToBucket = ({
  id,
  buffer
}) => {
  _axios.default.post(`https://www.googleapis.com/upload/storage/v1/b/sparend.app/o`, buffer, {
    params: {
      uploadType: 'media',
      name: id
    },
    headers: {
      Authorization: `Bearer ya29.GlusBnlPaR5kBtg276hVWKTRfEDGA5LLwsSvx8QFD7SEN7Jt75LSkfYtPpw6awFUj-khHWAz_LvSO4NvIjCn-mZ5p8LUzRFhIdwgES9L3Ir-t2nbjodjCxsd5ov4`,
      contentType: 'image/jpeg'
    }
  }).then(_ => console.log('done')).catch(console.error);
};

const pathPalette = async (path, id) => {
  const fileType = R.last(path.split('.'));
  return _axios.default.get(path, {
    responseType: 'arraybuffer'
  }).then(R.tap(async res => uploadToBucket({
    id,
    buffer: (await res).data
  })));
};

exports.pathPalette = pathPalette;

const gatherPoints = freqMap => Array.from(freqMap.values()).reduce((dataArr, freqObj, i) => [...dataArr, ...freqObj.indices.reduce((acc, idx) => [...acc, {
  x: idx,
  y: i
}], [])], []);

exports.gatherPoints = gatherPoints;

const gatherPointsAsArray = freqMap => Array.from(freqMap.values()).reduce((dataArr, freqObj, i) => [...dataArr, ...freqObj.indices.reduce((acc, idx) => [...acc, [idx, i]], [])], []);

exports.gatherPointsAsArray = gatherPointsAsArray;

// This is a sum of the change in height between every point
const makeRepetitiveScore = async dataArray => {
  const additiveAreas = dataArray.reduce((area, point, idx, arr) => {
    if (point.x === 1) return 1; // already factored into last area calculation

    if (idx === arr.length - 1) return area; // add average height between current point and next
    // because width = 1 this is the same as a trapezoid area func
    else return area + (point.y + arr[idx + 1].y) / 2;
  }, 0);

  const xMax = (value = d => d.x) => Math.max(...dataArray.map(value));

  return additiveAreas;
};

exports.makeRepetitiveScore = makeRepetitiveScore;

const selfSimilar = points => ({
  pointMap: points.reduce((map, point) => map.has(point.y) ? map.set(point.y, similarUpdater(point.x)(map.get(point.y))) : map.set(point.y, similarFactory(point.x)), new Map()),
  length: Math.max(...points.map(point => point.x))
});

exports.selfSimilar = selfSimilar;

const similarUpdater = x => R.evolve({
  x: R.append(x)
});

const similarFactory = x => {
  return {
    x: [x]
  };
};

const makeBins = similar => Array.from(similar.pointMap.entries()).reduce((arr, [y, rowData]) => [...arr, {
  bin: y,
  bins: fillRows(similar.length, rowData.x)
}], []); // fills array to length then adds the data to the proper index
// technically it starts at 1, but its a chart, so whatever


exports.makeBins = makeBins;

const fillRows = (length, data) => data.reduce((row, x) => R.update(x - 1, {
  bin: x
}, row), Array(length).fill({
  bin: 0
}));

const testMap = new Map().set(1, {
  x: [1, 2, 3]
}); // makeBins({length: 5, pointMap: testMap}) //?
// [{bin: 1, bins: [1, 2, 3, 0, 0]}]