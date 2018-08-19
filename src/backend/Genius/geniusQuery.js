import axios from 'axios'
export const geniusQuery = async query => {
  console.log('Searching Genius for ' + query)
  try {
    const response = axios.get('https://api.genius.com/search', {
      params: {
        q: query,
        access_token: process.env.geniusApiKey
      }
    })
    return response
  } catch (err) {
    console.error(err)
  }
}
