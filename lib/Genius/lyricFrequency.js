"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeRepetitiveScore = exports.makeSentiment = exports.gatherPoints = exports.pathPalette = exports.resolveFrequency = exports.makeFullLyrics = void 0;

var R = _interopRequireWildcard(require("ramda"));

var _stemr = require("stemr");

var _axios = _interopRequireDefault(require("axios"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _getImageColors = _interopRequireDefault(require("get-image-colors"));

var _sentiment = _interopRequireDefault(require("sentiment"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// chaining regex is gross, bit it works
const parseLyrics = R.pipe(R.replace(/\[.*\s*.*\]/g, ''), // remove [Chorus], could actually be useful in future
R.replace(/\n\n/gm, ''), R.replace(/\n/gm, ' '), // I gaurantee this vioates DRY, but it's fragile-ish
R.replace(/[!"#$%&()*+,\-./:;<=>?@[\]\^_`{|}~”“…—]/g, ''), // I have the bestest special char stripping
R.replace('\\', ''), // for some reason these are in there sometimes
R.split(' '), // should make an array of words
R.map(R.trim), // removes extra spaces
R.reject(R.isEmpty), // rejects those empty words
R.map(R.toLower) // normalize
);

const makeFullLyrics = async paths => paths.map(async path => {
  try {
    if (!path) throw new Error(`Did not receive a path from the API response`);
    const body = await (0, _axios.default)('https://genius.com' + path[0]);
    if (body.status !== 200) throw new Error(body);
    const lyricText = await _cheerio.default.load(body.data)('p', '.lyrics').text();
    return await parseLyrics(lyricText);
  } catch (err) {
    console.log(err);
  }
});

exports.makeFullLyrics = makeFullLyrics;

const mapWithIndex = lyrics => lyrics.map((word, index) => ({
  word,
  index,
  stem: (0, _stemr.stem)(word)
}));

const otherReduce = (freq, word) => {
  // find where in the [] and obj has a stem property equal to the current word stem
  const prevObjIndex = R.findIndex(R.propEq('stem', word.stem))(freq);
  const isInFreq = prevObjIndex != -1; // if it is, update it according to the following property functions

  return isInFreq ? R.update(prevObjIndex)(R.evolve({
    freq: R.add(1),
    originalWords: set => set.add(word.word),
    indices: R.append(word.index),
    stem: R.identity
  }, freq[prevObjIndex]))(freq) : // or add it to the list with this shape
  R.append({
    freq: 1,
    originalWords: new Set([word.word]),
    indices: [word.index],
    stem: word.stem
  })(freq);
};

const resolveFrequency = R.pipe(mapWithIndex, R.reduce(otherReduce, []));
exports.resolveFrequency = resolveFrequency;

const pathPalette = async path => {
  const fileType = R.last(path.split('.'));
  return _axios.default.get(path, {
    responseType: 'arraybuffer'
  }).then(a => (0, _getImageColors.default)(a.data, `image/${fileType}`)).then(R.map(R.invoker(0, 'hex')));
};

exports.pathPalette = pathPalette;

const gatherPoints = freqArr => {
  return freqArr.reduce((dataArr, freqObj, i) => {
    freqObj.indices.forEach(indice => {
      dataArr.push({
        x: indice,
        y: i
      });
    });
    return dataArr;
  }, []);
};

exports.gatherPoints = gatherPoints;
const sentiment = new _sentiment.default();

const makeSentiment = async lyrics => sentiment.analyze(lyrics.join(' ')); // [{x: int, y: int}]
// This is a sum of the change in height between every point


exports.makeSentiment = makeSentiment;

const makeRepetitiveScore = dataArray => {
  const additiveAreas = dataArray.reduce((area, point, idx, arr) => {
    if (idx === 0) {
      // include initial triangle with point at 1,1
      return Math.sqrt(2);
    }

    if (idx === arr.length - 1) {
      // already factored into last area calculation
      return area;
    } else {
      // add average height between current point and next
      // because width = 1 this is the same as a trapezoid area func
      return area += (point.y + arr[idx + 1].y) / 2;
    }
  }, 0); // normalize across word count, limit between 0 and 100

  return 100 / (additiveAreas / dataArray.length);
};

exports.makeRepetitiveScore = makeRepetitiveScore;