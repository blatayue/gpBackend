import * as R from 'ramda'
import {stem} from 'stemr'
import axios from 'axios'
import cheerio from 'cheerio'
import Sentiment from 'sentiment'
const sentiment = new Sentiment()

type makeFullLyrics = (paths: string[]) => Promise<Promise<sentiment>[]>
export const makeFullLyrics: makeFullLyrics = async paths =>
  paths.map(async path => {
    try {
      if (!path) throw new Error(`Did not receive a path from the API response`)

      const body = await axios('https://genius.com' + path)
      if (body.status !== 200) throw new Error(JSON.stringify(body))
      const rawLyrics = cheerio
        .load(body.data)('p', '.lyrics')
        .text()
      // console.log(sentiment.analyze(rawLyrics))
      return sentiment.analyze(rawLyrics)
    } catch (err) {
      throw err
    }
  })

type sentiment = {
  score: number
  comparative: number
  tokens: string[]
  words: string[]
  positive: string[]
  negative: string[]
}

type mapWithIndex = (lyrics: Promise<sentiment>) => Promise<word[]>
const mapWithIndex: mapWithIndex = async lyrics =>
  (await lyrics).tokens.map((word, index) => ({
    word,
    index,
    stem: stem(word),
  }))

type word = {
  word: string
  stem: string
  index: number
}
type freqArrObj = {
  freq: number
  originalWords: Set<string>
  indices: number[]
  stem: string
}

type freqObjFactory = (word: word) => freqArrObj
const freqObjFactory: freqObjFactory = word => ({
  freq: 1,
  originalWords: new Set([word.word]),
  indices: [word.index],
  stem: word.stem,
})

type freqObjUpdater = (word: word) => (freqObjArr: freqArrObj) => freqArrObj
const freqObjUpdater: freqObjUpdater = word =>
  R.evolve({
    freq: R.add(1),
    originalWords: (set: Set<string>) => set.add(word.word),
    indices: (idx: number[]) => [...idx, word.index],
    stem: (stem: string) => stem,
  })

type reduceFreqMap = (
  freqP: Promise<Map<string, freqArrObj>>,
  word: word,
) => Promise<Map<string, freqArrObj>>
const reduceFreqMap: reduceFreqMap = async (freqP, word) => {
  const freq = await freqP
  return freq.has(word.word)
    ? freq.set(word.word, freqObjUpdater(word)(freq.get(word.word)))
    : freq.set(word.word, freqObjFactory(word))
}

type resolveFrequency = (
  lyrics: Promise<sentiment>,
) => Promise<Map<string, freqArrObj>>
export const resolveFrequency: resolveFrequency = R.pipeP(
  mapWithIndex,
  R.reduce(reduceFreqMap, Promise.resolve(new Map())),
)

interface bucketParams {
  id: number
  buffer: Buffer
}
const uploadToBucket = ({id, buffer}: bucketParams) => {
  axios
    .post(
      `https://www.googleapis.com/upload/storage/v1/b/sparend.app/o`,
      buffer,
      {
        params: {
          uploadType: 'media',
          name: id,
        },
        headers: {
          Authorization: `Bearer ya29.GlusBnlPaR5kBtg276hVWKTRfEDGA5LLwsSvx8QFD7SEN7Jt75LSkfYtPpw6awFUj-khHWAz_LvSO4NvIjCn-mZ5p8LUzRFhIdwgES9L3Ir-t2nbjodjCxsd5ov4`,
          contentType: 'image/jpeg',
        },
      },
    )
    .then(_ => console.log('done'))
    .catch(console.error)
}

export const pathPalette = async (path: string, id: number) => {
  const fileType = R.last(path.split('.'))
  return axios
    .get(path, {responseType: 'arraybuffer'})
    .then(res => uploadToBucket({id, buffer: res.data}))
}

type gatherPoints = (freqMap: Map<string, freqArrObj>) => point[]
export const gatherPoints: gatherPoints = freqMap =>
  Array.from(freqMap.values()).reduce(
    (dataArr: point[], freqObj, i) => [
      ...dataArr,
      ...freqObj.indices.reduce((acc, idx) => [...acc, {x: idx, y: i}], []),
    ],
    [],
  )

interface point {
  x: number
  y: number
}

type makeRepetitiveScore = (dataArray: point[]) => Promise<number>
// This is a sum of the change in height between every point
export const makeRepetitiveScore: makeRepetitiveScore = async dataArray => {
  const additiveAreas = dataArray.reduce((area, point, idx, arr): number => {
    if (point.x === 1) return 1

    // already factored into last area calculation
    if (idx === arr.length - 1) return area
    // add average height between current point and next
    // because width = 1 this is the same as a trapezoid area func
    else return area + (point.y + arr[idx + 1].y) / 2
  }, 0)
  const xMax = (value = (d: point) => d.x) => Math.max(...dataArray.map(value))

  return additiveAreas
}

type selfSimilar = (freqMap: Map<string, freqArrObj>) => Map<number, twoDColumn>
interface twoDColumn {
  y: number[]
}
export const selfSimilar: selfSimilar = freqMap =>
  Array.from(freqMap.keys()).reduce((map, freqArrObj, y) => {
    return map.has(y)
      ? map.set(y, similarUpdater(map.get(i)))
      : map.set(y, similarFactory(freqArrObj))
  }, new Map())

  const similarUpdater= R.evolve({
    y: R.append
  })
  
  