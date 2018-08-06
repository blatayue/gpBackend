const cheerio = require('cheerio')
const R = require('ramda')
const axios = require('axios')

const searchGenius = async query => {
  console.log('Searching Genius for ' + query)
  return axios.get('https://api.genius.com/search', {
    params: {
      q: query,
      access_token: process.env.geniusApiKey
    }
  })
}
const firstSongResult = ['data', 'response', 'hits', 0, 'result']
const transformResponse = response => ({
  path: R.path([...firstSongResult, 'path'])(response),
  title: R.path([...firstSongResult, 'title'])(response),
  image: R.path([...firstSongResult, 'song_art_image_thumbnail_url'])(response),
  artist: R.path([...firstSongResult, 'primary_artist', 'name'])(response)
})

const getGeniusLyrics = async path => {
  // const songData = await searchGenius(query).then(transformResponse)
  const { path } = songData
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
  // return {
  //   lyrics: lyricText,
  //   ...songData
  // }
}
module.exports.getGeniusLyrics = getGeniusLyrics
module.exports.searchGenius = searchGenius
