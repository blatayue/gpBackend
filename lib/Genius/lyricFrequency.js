"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeColorArr = exports.gatherPoints = exports.pathPalette = exports.resolveFrequency = exports.makeFullLyrics = void 0;

var R = _interopRequireWildcard(require("ramda"));

var _lancasterStemmer = _interopRequireDefault(require("lancaster-stemmer"));

var _axios = _interopRequireDefault(require("axios"));

var _cheerio = _interopRequireDefault(require("cheerio"));

var _getImageColors = _interopRequireDefault(require("get-image-colors"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

// I guess prettier fails gracefully here
const parseLyrics = R.pipe(R.replace(/.*(\[.*\])/gm, ''), // remove stuff like [Chorus] useful in future
R.replace(/\n(\n)/, ''), R.replace(/\n/gm, ' '), R.replace(/[!"#$%&()*+,\-./:;<=>?@[\]\^_`{|}~”“]/g, ''), R.replace('\\', ''), R.split(' '), R.map(R.trim), R.reject(R.isEmpty), R.map(R.toLower));

const makeFrequency = ({
  stemmed,
  lyrics
}) => ({
  freq: stemmed.reduce(uniqStemming, new Map()),
  lyrics
});

const mapIndices = async ({
  freq,
  lyrics
}) => {
  const analyzed = []; // Can't reduce a Map sadly, dong it by hand

  freq = await freq;
  await freq.forEach(async (val, stem) => {
    analyzed.push({
      stem,
      ...val,
      indices: R.flatten(val.originalWords.map(word => R.invert(lyrics)[word]))
    });
  });
  return analyzed;
};

const stemWords = lyrics => ({
  stemmed: lyrics.map(word => ({
    stem: (0, _lancasterStemmer.default)(word),
    word
  })),
  lyrics
});

const makeFullLyrics = async paths => paths.map(async path => {
  const body = await (0, _axios.default)('https://genius.com' + path[0]).then(res => res.data).catch(console.log); // vomits into console on error. super bad

  const lyricText = await _cheerio.default.load(body)('p', '.lyrics').text();
  return await parseLyrics(lyricText);
});

exports.makeFullLyrics = makeFullLyrics;
const resolveFrequency = R.pipe(stemWords, makeFrequency, mapIndices); // reducer

exports.resolveFrequency = resolveFrequency;

const uniqStemming = (freq, word) => freq.set(word.stem, {
  freq: freq.get(word.stem) ? freq.get(word.stem).freq += 1 : 1,
  originalWords: freq.get(word.stem) ? R.uniq([...freq.get(word.stem).originalWords, word.word]) : [word.word]
}); // const getHex = R.ifElse(R.isNil, R.F, R.invoker(0, 'getHex')) dead


const pathPalette = async path => {
  const fileType = R.last(path.split('.'));
  return _axios.default.get(path, {
    responseType: 'arraybuffer'
  }).then(a => (0, _getImageColors.default)(a.data, `image/${fileType}`)) // no base64 bs required. yet
  .then(R.map(R.invoker(0, 'hex')));
}; // I think I could make this less steps, inverting beforeprobably makes the code
// repeat itself, but this works too


exports.pathPalette = pathPalette;

const gatherPoints = freqArr => freqArr.reduce((dataArr, freqObj, i) => {
  freqObj.indices.forEach(indice => {
    dataArr.push({
      x: indice,
      y: i
    }); // x, y
  });
  return dataArr;
}, []);
/**
 *
 * @param {args} args
 *
 *
 * @typedef {Object} inputCellInfo
 * @property {String} stem
 * @property {number} freq
 * @property {String[]} originalWords
 * @property {number[]} indices
 *
 * @typedef {Object} args
 * @property {String[]} fullLyrics
 * @property {Object[]} inputPalette
 * @property {Object[]} inputCellInfo
 *
 */


exports.gatherPoints = gatherPoints;

const makeColorArr = async () => ({
  fullLyrics,
  inputCellInfo,
  inputPalette
} = args) => {
  const cellBackgroundFill = inputPalette[1]; // second most common - hopefully complementary
  // const titleAndButtonColor = args.inputPalette[0]

  const cellFills = inputPalette.slice(2);
  const gridColumns = fullLyrics.length;
  const gridRows = inputCellInfo.length;
  let gridArr = new Array(gridRows).fill(new Array(gridColumns).fill('#ffffff')); // grid uniq x total

  let uniqWordIndex = 0;
  R.forEachObjIndexed(wordData => {
    if (R.or(R.is(Array)(wordData), R.is(Number)(wordData)) || R.is(String)(wordData)) return; // fullLyrics are an Array, not needed here, same with uniqueLyrics, but it's a
    // Number

    let row = gridArr[uniqWordIndex];

    for (let i of wordData.indices) {
      row = R.update(i, '#606060')(row);
    }

    gridArr = R.update(uniqWordIndex, row)(gridArr);
    uniqWordIndex++;
  })(songAnalysis);
  return gridArr;
};

exports.makeColorArr = makeColorArr;

const updateInDbAndResolve = async (song, prop, resolver) => {
  //Some db call using song.id to update prop with resolved val
  const resolved = resolver(song);
};