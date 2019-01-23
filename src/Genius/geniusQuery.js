import axios from 'axios'

export const geniusQuery = async query => {
  console.log('Searching Genius for ' + query)
  try {
    const response = axios.get('https://api.genius.com/search', {
      params: {
        q: query,
      },
      headers: {
        Authorization: `Bearer ${process.env.geniusApiKey}`,
      },
    })
    if ((await response).status === 401) {
      console.log('Genius Token Has Expired')
      return
    }
    return response
  } catch (err) {
    console.error(err)
  }
}
