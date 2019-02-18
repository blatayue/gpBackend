import axios from 'axios'

export const geniusQuery = async (query: string) => {
  console.log('Searching Genius for ' + query)
  try {
    // key check
    const geniusApiKey = process.env.geniusApiKey
    if (!geniusApiKey) throw new Error('The genius API Key is not set')

    const response = await axios.get('https://api.genius.com/search', {
      params: {
        q: query,
      },
      headers: {
        Authorization: `Bearer ${process.env.geniusApiKey}`,
      },
    })

    // resp check
    if (response.data.meta.status !== 200) {
      throw new Error(`
        The Genius API did not return 200 OK \n
        ${response.data.meta}`)
    }

    // hopefully a valid response
    return await response
  } catch (err) {
    console.error(err)
  }
}
