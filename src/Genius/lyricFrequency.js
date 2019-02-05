import * as R from 'ramda'
import {stem as stemmer} from 'stemr'
import axios from 'axios'
import cheerio from 'cheerio'
import getColors from 'get-image-colors'
import Sentiment from 'sentiment'

// chaining regex is gross, bit it works
const parseLyrics = R.pipe(
  R.replace(/\[.*\s*.*\]/g, ''), // remove [Chorus], could actually be useful in future
  R.replace(/\n\n/gm, ''),
  R.replace(/\n/gm, ' '), // I gaurantee this vioates DRY, but it's fragile-ish
  R.replace(/[!"#$%&()*+,\-./:;<=>?@[\]\^_`{|}~”“…—]/g, ''), // I have the bestest special char stripping
  R.replace('\\', ''), // for some reason these are in there sometimes
  R.split(' '), // should make an array of words
  R.map(R.trim), // removes extra spaces
  R.reject(R.isEmpty), // rejects those empty words
  R.map(R.toLower), // normalize
)

export const makeFullLyrics = async paths =>
  paths.map(async path => {
    try {
      if (!path) throw new Error(`Did not receive a path from the API response`)

      const body = await axios('https://genius.com' + path[0])
      if (body.status !== 200) throw new Error(body)

      const lyricText = await cheerio
        .load(body.data)('p', '.lyrics')
        .text()

      return await parseLyrics(lyricText)
    } catch (err) {
      console.log(err)
    }
  })

const mapWithIndex = lyrics =>
  lyrics.map((word, index) => ({
    word,
    index,
    stem: stemmer(word),
  }))
const otherReduce = (freq, word) => {
  // find where in the [] and obj has a stem property equal to the current word stem
  const prevObjIndex = R.findIndex(R.propEq('stem', word.stem))(freq)
  const isInFreq = prevObjIndex != -1
  // if it is, update it according to the following property functions
  return isInFreq
    ? R.update(prevObjIndex)(
        R.evolve(
          {
            freq: R.add(1),
            originalWords: set => set.add(word.word),
            indices: R.append(word.index),
            stem: R.identity,
          },
          freq[prevObjIndex],
        ),
      )(freq)
    : // or add it to the list with this shape
      R.append({
        freq: 1,
        originalWords: new Set([word.word]),
        indices: [word.index],
        stem: word.stem,
      })(freq)
}

export const resolveFrequency = R.pipe(
  mapWithIndex,
  R.reduce(otherReduce, []),
)

export const pathPalette = async path => {
  const fileType = R.last(path.split('.'))
  return axios
    .get(path, {responseType: 'arraybuffer'})
    .then(a => getColors(a.data, `image/${fileType}`))
    .then(R.map(R.invoker(0, 'hex')))
}

export const gatherPoints = freqArr => {
  return freqArr.reduce((dataArr, freqObj, i) => {
    freqObj.indices.forEach(indice => {
      dataArr.push({x: indice, y: i})
    })
    return dataArr
  }, [])
}

const sentiment = new Sentiment()
export const makeSentiment = async lyrics => sentiment.analyze(lyrics.join(' '))

// [{x: int, y: int}]
// This is a sum of the change in height between every point
export const makeRepetitiveScore = dataArray => {
  const additiveAreas = dataArray.reduce((area, point, idx, arr) => {
    if (idx === 0) {
      // include initial triangle with point at 1,1
      return Math.sqrt(2)
    }
    if (idx === arr.length - 1) {
      // already factored into last area calculation
      return area
    } else {
      // add average height between current point and next
      // because width = 1 this is the same as a trapezoid area func
      return (area += (point.y + arr[idx + 1].y) / 2)
    }
  }, 0)
  // normalize across word count, limit between 0 and 100
  return 100 / (additiveAreas / dataArray.length)
}
