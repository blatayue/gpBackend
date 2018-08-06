const R = require('ramda')
const stemmer = require('lancaster-stemmer')
const genius = require('../Genius/geniusQuery.js')
const Vibrant = require('node-vibrant')
const color = require('color')
const fs = require('fs')
const parseLyrics = R.evolve({
  lyrics: R.pipe(
    R.replace(/[!"#$%&()*+,\-./:;<=>?@[\]\^_`{|}~]/g, ''), // remove punctuation
    R.replace('\\', ''),
    R.split(' '),
    R.map(R.trim),
    R.reject(R.isEmpty)
  )
})
const stemWords = ({ lyrics, ...songData } = songData) => ({
  stemmed: lyrics.map(word => ({
    stem: stemmer(word),
    word
  })),
  lyrics,
  ...songData
})

const makeFrequency = ({ stemmed, ...songData } = songData) => ({
  freq: stemmed.reduce(uniqStemming, new Map()),
  ...songData
})

const uniqStemming = (freq, word) =>
  freq.set(word.stem, {
    freq: freq.get(word.stem) ? (freq.get(word.stem).freq += 1) : 1,
    originalWords: freq.get(word.stem)
      ? R.uniq([...freq.get(word.stem).originalWords, word.word])
      : [word.word]
  })

const mapIndices = ({ freq, lyrics, ...songData } = songData) => {
  const analyzed = []
  freq.forEach((val, stem, map) => {
    analyzed.push({
      stem,
      ...val,
      indices: R.flatten(
        val.originalWords.map(word => R.invert(lyrics)[word])
      ).map(Number)
    })
  })

  // const analyzed = R.mapObjIndexed(freqObj => ({
  //   ...freqObj,
  //   indices: R.flatten(
  //     freqObj.originalWords.map(word => R.invert(lyrics)[word])
  //   ).map(Number)
  // }))(freq)
  /* fuck, this is complex. ^ is explaned as follows
    * basically the entire line above gets the unique words from the originals before stemming, then finds them in an inverted 
    * array that is now an object with each word/array value as a key and an array of indexes from that array as the values. 
    * The inverted array is an array of all the lyrics split into words
    * This is a case where using "types" or just jsdoc obj shapes would help immensely in the mental model of the transformation
    */
  return {
    lyricFrequency: analyzed,
    fullLyrics: lyrics,
    ...songData,
    uniqueLyrics: analyzed.length
  }
}

// const arrayIndices = songData => {
//   const stems = Object.keys(songData.lyricFrequency)
//   const analysis = Object.values(songData.lyricFrequency)
//   return {
//     ...songData,
//     lyricFrequency: R.zipWith(addStemKey, stems, analysis)
//   }
// }

// const addStemKey = (stem, analysis) => ({
//   stem,
//   ...analysis
// })

const addPalette = async songFreq => ({
  ...songFreq,
  palette: await Vibrant.from(songFreq.image).getPalette()
})

module.exports = analyzeWithGenius = query =>
  genius
    .getGeniusLyrics(query)
    .then(parseLyrics)
    .then(stemWords)
    .then(makeFrequency)
    .then(mapIndices)
    // .then(arrayIndices)
    .then(addPalette)
    .then(makeRgbArr)
    // .then(songObject => {
    //   fs.writeFile('analyzed_lyrics.json', JSON.stringify(songObject))
    //   // return songObject
    // })
    // .then(console.log)
    .catch(console.log)

const makeRgbArr = songData => {
  const toHex = colorFormat => color(colorFormat).hex()
  const { palette } = songData
  const Vibrant = palette.Vibrant
  const titleTextColor = toHex(Vibrant.getTitleTextColor())
  const VibrantHex = Vibrant.getHex()
  const bodyColor = color(VibrantHex)
    .lighten(0.5)
    .hex()
  const gridColors = [
    palette.DarkVibrant.getHex(),
    palette.Muted.getHex(),
    palette.LightMuted.getHex(),
    palette.DarkMuted.getHex()
  ]
  const grid = songData.lyricFrequency.map(stem => {
    let row = new Array(songData.fullLyrics.length).fill().map(() => bodyColor)
    stem.indices.forEach(
      (indice, index) => (row[indice] = gridColors[index % 4])
    )
    return row
  })
  return {
    ...songData,
    bodyColor,
    titleTextColor,
    Vibrant: VibrantHex,
    grid,
    palette: JSON.stringify(songData.palette)
  }
}
const resolve = {
  Mutation: {
    analyzeSong: (obj, {song} = args) => ({
      frequency: 
    })
  }

}

// analyzeWithGenius('Sleepyhead')
