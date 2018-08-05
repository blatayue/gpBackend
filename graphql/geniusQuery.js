const cheerio = require('cheerio')
const R = require('ramda')
const axios = require('axios')

const searchGenius = async query =>
  axios
    .get('https://api.genius.com/search', {
      params: {
        q: query,
        access_token: process.env.geniusApiKey
      }
    })
    .then(response => ({
      path: R.path(['data', 'response', 'hits', 0, 'result', 'path'])(response),
      title: R.path(['data', 'response', 'hits', 0, 'result', 'title'])(
        response
      ),
      image: R.path([
        'data',
        'response',
        'hits',
        0,
        'result',
        'song_art_image_thumbnail_url'
      ])(response)
    }))

module.exports = getGeniusLyrics = async query => {
  const songData = await searchGenius(query)
  const { path, title, image } = songData
  const body = await axios
    .get(`https://cors.io/?https://genius.com${path}`)
    .then(R.prop('data'))
  const lyricText = cheerio
    .load(body)('p', '.lyrics')
    .text()
    .replace(/.*(\[.*\])/gm, '')
    .replace(/\n(\n)/, '')
    .replace(/\n/gm, ' ')
    .replace(/[!"#$%&()*+,\-./:;<=>?@[\]\^_`{|}~]/g, '')
    .trim()
  return {
    lyrics: lyricText,
    title,
    image
  }
}
