import * as R from 'ramda'
import stemmer from 'lancaster-stemmer'
import axios from 'axios'
import cheerio from 'cheerio'
import getColors from 'get-image-colors'

// I guess prettier fails gracefully here
const parseLyrics = R.pipe(R.replace(/.*(\[.*\])/gm, ''), // remove stuff like [Chorus] useful in future
    R.replace(/\n(\n)/, ''), R.replace(/\n/gm, ' '), R.replace(/[!"#$%&()*+,\-./:;<=>?@[\]\^_`{|}~”“]/g, ''), R.replace('\\', ''), R.split(' '), R.map(R.trim), R.reject(R.isEmpty), R.map(R.toLower))

const makeFrequency = ({stemmed, lyrics}) => ({
  freq: stemmed.reduce(uniqStemming, new Map()),
  lyrics
})

const mapIndices = async({freq, lyrics}) => {
  const analyzed = []
  // Can't reduce a Map sadly, dong it by hand
  freq = await freq
  await freq.forEach(async(val, stem) => {
    analyzed.push({
      stem,
      ...val,
      indices: R.flatten(val.originalWords.map(word => R.invert(lyrics)[word]))
    })
  })
  return analyzed
}

const stemWords = lyrics => ({
  stemmed: lyrics.map(word => ({stem: stemmer(word), word})),
  lyrics
})

export const makeFullLyrics = async paths => paths.map(async path => {
  const body = await axios('https://genius.com' + path[0])
    .then(res => res.data)
    .catch(console.log); // vomits into console on error. super bad
  const lyricText = await cheerio
    .load(body)('p', '.lyrics')
    .text()

  return await parseLyrics(lyricText)
})

export const resolveFrequency = R.pipe(stemWords, makeFrequency, mapIndices)

// reducer
const uniqStemming = (freq, word) => freq.set(word.stem, {
  freq: freq.get(word.stem)
    ? (freq.get(word.stem).freq += 1)
    : 1,
  originalWords: freq.get(word.stem)
    ? R.uniq([
      ...freq
        .get(word.stem)
        .originalWords,
      word.word
    ])
    : [word.word]
})

// const getHex = R.ifElse(R.isNil, R.F, R.invoker(0, 'getHex')) dead
export const pathPalette = async path => {
  const fileType = R.last(path.split('.'))
  return axios
    .get(path, {responseType: 'arraybuffer'})
    .then(a => getColors(a.data, `image/${fileType}`)) // no base64 bs required. yet
    .then(R.map(R.invoker(0, 'hex')))
}
export const makeRgbArr = async({frequency, fullLyrics, palette} = obj) => {
  const colors = R.props(['DarkVibrant', 'LightMuted', 'DarkMuted'])(palette)
  // console.log('colors are: ', colors)
  const grid = frequency.map(stem => {
    let row = new Array(fullLyrics.length)
      .fill()
      .map(() => palette.Vibrant)
    stem
      .indices
      .forEach((indice, index) => (row[indice] = colors[index % 4]))
    return row
  })
  return grid
}

// I think I could make this less steps, inverting beforeprobably makes the code
// repeat itself, but this works too
export const gatherPoints = freqArr => freqArr.reduce((dataArr, freqObj, i) => {
  freqObj
    .indices
    .forEach(indice => {
      dataArr.push({x: indice, y: i}) // x, y
    })
  return dataArr
}, [])

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
export const makeColorArr = async() => ({fullLyrics, inputCellInfo, inputPalette} = args) => {
  const cellBackgroundFill = inputPalette[1] // second most common - hopefully complementary
  // const titleAndButtonColor = args.inputPalette[0]
  const cellFills = inputPalette.slice(2)
  const gridColumns = fullLyrics.length
  const gridRows = inputCellInfo.length
  let gridArr = new Array(gridRows).fill(new Array(gridColumns).fill('#ffffff'))
  // grid uniq x total
  let uniqWordIndex = 0
  R.forEachObjIndexed(wordData => {
    if (R.or(R.is(Array)(wordData), R.is(Number)(wordData)) || R.is(String)(wordData)) 
      return
      // fullLyrics are an Array, not needed here, same with uniqueLyrics, but it's a
    // Number
    let row = gridArr[uniqWordIndex]
    for (let i of wordData.indices) {
      row = R.update(i, '#606060')(row)
    }
    gridArr = R.update(uniqWordIndex, row)(gridArr)
    uniqWordIndex++
  })(songAnalysis)

  return gridArr;
}

const updateInDbAndResolve = async(song, prop, resolver) => {
  //Some db call using song.id to update prop with resolved val
  const resolved = resolver(song)
}
