const R = require('ramda')
const stemmer = require('lancaster-stemmer')
const getGeniusLyrics = require('./geniusQuery.js')
const Vibrant = require('node-vibrant')
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

const makeFrequency = ({ stemmed, ...songData } = songData) => {
  console.log('SONGDATA', songData)
  return {
    freq: stemmed.reduce(
      (freq, word) => ({
        ...freq,

        [word.stem]: {
          freq: freq[word.stem] ? (freq[word.stem].freq += 1) : 1,
          originalWords: freq[word.stem]
            ? R.uniq([...freq[word.stem].originalWords, word.word])
            : [word.word]
        }
      }),
      {}
    ),
    ...songData
  }
}
const mapIndices = ({ freq, lyrics, ...songData } = songData) => {
  const analyzed = R.mapObjIndexed(freqObj => ({
    ...freqObj,
    indices: R.flatten(
      freqObj.originalWords.map(word => R.invert(lyrics)[word])
    ).map(Number)
  }))(freq)
  /* fuck, this is complex. ^ is explaned as follows
    * basically the entire line above gets the unique words from the originals before stemming, then finds them in an inverted 
    * array that is now an object with each word/array value as a key and an array of indexes from that array as the values. 
    * The inverted array is an array of all the lyrics split into words
    * This is a case where using "types" or just jsdoc obj shapes would help immensely in the mental model of the transformation
    */
  return {
    ...analyzed,
    fullLyrics: lyrics,
    ...songData,
    uniqueLyrics: Object.keys(analyzed).length
  }
}

const addPalette = async songFreq => ({
  ...songFreq,
  palette: await Vibrant.from(songFreq.image)
    .getPalette()
    .then(JSON.stringify)
})

module.exports = analyzeWithGenius = query =>
  getGeniusLyrics(query)
    .then(parseLyrics)
    .then(stemWords)
    .then(makeFrequency)
    .then(mapIndices)
    .then(addPalette)
    .then(console.log)
    .catch(console.log)
