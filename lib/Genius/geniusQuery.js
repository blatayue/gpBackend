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
    const response = _axios.default.get('https://api.genius.com/search', {
      params: {
        q: query
      },
      headers: {
        Authorization: `Bearer ${process.env.geniusApiKey}`
      }
    });

    if ((await response).status === 401) {
      console.log('Genius Token Has Expired');
      return;
    }

    return response;
  } catch (err) {
    console.error(err);
  }
};

exports.geniusQuery = geniusQuery;