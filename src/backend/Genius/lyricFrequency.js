import R from 'ramda'
import stemmer from 'lancaster-stemmer'
import axios from 'axios'
import cheerio from 'cheerio'
const parseLyrics = R.pipe(
  R.replace(/.*(\[.*\])/gm, ''), // remove stuff like [Chorus] useful in future
  R.replace(/\n(\n)/, ''),
  R.replace(/\n/gm, ' '),
  R.replace(/[!"#$%&()*+,\-./:;<=>?@[\]\^_`{|}~]/g, ''),
  R.replace('\\', ''),
  R.trim(),
  R.split(' '),
  R.map(R.trim),
  R.reject(R.isEmpty),
  R.map(R.toLower)
)

const makeFrequency = ({ stemmed, lyrics }) => ({
  freq: stemmed.reduce(uniqStemming, new Map()),
  lyrics
})

const mapIndices = ({ freq, lyrics }) => {
  const analyzed = []
  // Can't reduce a Map sadly
  freq.forEach((val, stem) => {
    analyzed.push({
      stem,
      ...val,
      indices: R.flatten(
        val.originalWords.map(word => R.invert(lyrics)[word])
      ).map(Number)
    })
  })
  return analyzed
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

const uniqStemming = (freq, word) =>
  freq.set(word.stem, {
    freq: freq.get(word.stem) ? (freq.get(word.stem).freq += 1) : 1,
    originalWords: freq.get(word.stem)
      ? R.uniq([...freq.get(word.stem).originalWords, word.word])
      : [word.word]
  })

const gridColors = palette => ({
  Vibrant: palette.Vibrant ? palette.Vibrant.getHex() : null,
  DarkVibrant: palette.DarkVibrant ? palette.DarkVibrant.getHex() : null,
  Muted: Vibrant.Muted ? Vibrant.Muted.getHex() : null,
  LightMuted: palette.LightMuted ? palette.LightMuted.getHex() : null,
  DarkMuted: palette.DarkMuted ? palette.DarkMuted.getHex() : null
})

export const addPalette = async obj => {
  const image = obj.header_image_thumbnail_url
  console.log('IMAGE', image)
  const palette = await Vibrant.from(image).getPalette()
  return gridColors(palette)
}

export const makeRgbArr = ({ frequency, fullLyrics, palette } = obj) => {
  const colors = R.props(['DarkVibrant', 'LightMuted', 'DarkMuted'])(palette)
  console.log('colors are: ', colors)
  const grid = frequency.map(stem => {
    let row = new Array(fullLyrics.length).fill().map(() => palette.Vibrant)
    stem.indices.forEach((indice, index) => (row[indice] = colors[index % 4]))
    return row
  })
  return grid
}

export const makeFullLyrics = async paths =>
  await paths.map(async path => {
    const body = await axios
      .get(`https://cors.io/?https://genius.com${path}`)
      .then(R.prop('data'))
    const lyricText = cheerio
      .load(body)('p', '.lyrics')
      .text()
    return await parseLyrics(lyricText)
  })

const updateInDbAndResolve = (song, prop, resolver) => {
  //Some db call using song.id to update prop with resolved val
  const resolved = resolver(song)
}
