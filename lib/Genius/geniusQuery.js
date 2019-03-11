"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.geniusQuery = void 0;

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const geniusQuery = async query => {
  console.log('Searching Genius for ' + query);

  try {
    // key check
    const geniusApiKey = process.env.GENIUS_API_KEY;
    if (!geniusApiKey) throw new Error('The genius API Key is not set');
    const response = await _axios.default.get('https://api.genius.com/search', {
      params: {
        q: query
      },
      headers: {
        Authorization: `Bearer ${geniusApiKey}`
      }
    }); // resp check

    if (response.data.meta.status !== 200) {
      throw new Error(`
        The Genius API did not return 200 OK \n
        ${response.data.meta}`);
    } // hopefully a valid response


    return await response;
  } catch (err) {
    console.error(err);
  }
};

exports.geniusQuery = geniusQuery;