import R from 'ramda'
import stemmer from 'lancaster-stemmer'
import axios from 'axios'
import cheerio from 'cheerio'
import getColors from 'get-image-colors'

// Now I have two problems
const parseLyrics = R.pipe(
  R.replace(/.*(\[.*\])/gm, ''), // remove stuff like [Chorus] useful in future
  R.replace(/\n(\n)/, ''),
  R.replace(/\n/gm, ' '),
  R.replace(/[!"#$%&()*+,\-./:;<=>?@[\]\^_`{|}~”“]/g, ''),
  R.replace('\\', ''),
  R.split(' '),
  R.map(R.trim),
  R.reject(R.isEmpty),
  R.map(R.toLower)
)

const makeFrequency = ({ stemmed, lyrics }) => ({
  freq: stemmed.reduce(uniqStemming, new Map()),
  lyrics
})

const mapIndices = async ({ freq, lyrics }) => {
  const analyzed = []
  // Can't reduce a Map sadly
  freq = await freq
  await freq.forEach(async (val, stem) => {
    analyzed.push({
      stem,
      ...val,
      indices: R.flatten(val.originalWords.map(word => R.invert(lyrics)[word]))
    })
  })
  return await analyzed
}

const stemWords = async lyrics => ({
  stemmed: lyrics.map(word => ({
    stem: stemmer(word),
    word
  })),
  lyrics
})

export const resolveFrequency = R.composeP(
  mapIndices,
  makeFrequency,
  stemWords
)

const uniqStemming = async (freq, word) => {
  freq = await freq
  // console.log(freq)
  return await freq.set(word.stem, {
    freq: freq.get(word.stem) ? (freq.get(word.stem).freq += 1) : 1,
    originalWords: freq.get(word.stem)
      ? R.uniq([...freq.get(word.stem).originalWords, word.word])
      : [word.word]
  })
}

const getHex = R.ifElse(R.isNil, R.F, R.invoker(0, 'getHex'))

export const pathPalette = async path => {
  const fileType = R.last(path.split('.'))
  return axios
    .get(path, { responseType: 'arraybuffer' })
    .then(a => getColors(a.data, `image/${fileType}`))
    .then(R.map(R.invoker(0, 'hex')))
}
export const makeRgbArr = async ({ frequency, fullLyrics, palette } = obj) => {
  const colors = R.props(['DarkVibrant', 'LightMuted', 'DarkMuted'])(palette)
  // console.log('colors are: ', colors)
  const grid = frequency.map(stem => {
    let row = new Array(fullLyrics.length).fill().map(() => palette.Vibrant)
    stem.indices.forEach((indice, index) => (row[indice] = colors[index % 4]))
    return row
  })
  return grid
}

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
export const makeColorArr = async () => ({})
//   fullLyrics,
//   inputCellInfo,
//   inputPalette
// } = args) => {
//   const cellBackgroundFill = inputPalette[1] // second most common - hopefully complementary
//   // const titleAndButtonColor = args.inputPalette[0]
//   const cellFills = inputPalette.slice(2)
//   const gridColumns = fullLyrics.length
//   const gridRows = inputCellInfo.length
//   let gridArr = new Array(gridRows).fill(new Array(gridColumns).fill('#ffffff'))
//     // grid uniq x total
//     let uniqWordIndex = 0
//       R.forEachObjIndexed(
//         wordData => {
//           if (R.or( R.is(Array)(wordData), R.is(Number)(wordData) ) || R.is(String)(wordData)) return
//           // fullLyrics are an Array, not needed here, same with uniqueLyrics, but it's a Number
//           let row = gridArr[uniqWordIndex]
//           for( let i of wordData.indices) {
//            row = R.update(i, '#606060')(row)
//           }
//           gridArr = R.update(uniqWordIndex, row)(gridArr)
//           uniqWordIndex++
//       })(songAnalysis)

//   return gridArr;
// }
export const makeFullLyrics = async paths => {
  return await paths.map(async path => {
    console.log('Requesting', path)
    try {
      const body = await axios
        .get(`https://cors.io/?https://genius.com${path}`)
        .then(R.prop('data'))
    } catch (err) {
      console.error(err)
    }
    const lyricText = cheerio
      .load(body)('p', '.lyrics')
      .text()
    return await parseLyrics(lyricText)
  })
}

const updateInDbAndResolve = async (song, prop, resolver) => {
  //Some db call using song.id to update prop with resolved val
  const resolved = resolver(song)
}
