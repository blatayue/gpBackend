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
    const geniusApiKey = process.env.geniusApiKey;
    if (!geniusApiKey) throw new Error('The genius API Key is not set');
    const response = await _axios.default.get('https://api.genius.com/search', {
      params: {
        q: query
      },
      headers: {
        Authorization: `Bearer ${process.env.geniusApiKey}`
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9HZW5pdXMvZ2VuaXVzUXVlcnkuanMiXSwibmFtZXMiOlsiZ2VuaXVzUXVlcnkiLCJxdWVyeSIsImNvbnNvbGUiLCJsb2ciLCJnZW5pdXNBcGlLZXkiLCJwcm9jZXNzIiwiZW52IiwiRXJyb3IiLCJyZXNwb25zZSIsImF4aW9zIiwiZ2V0IiwicGFyYW1zIiwicSIsImhlYWRlcnMiLCJBdXRob3JpemF0aW9uIiwiZGF0YSIsIm1ldGEiLCJzdGF0dXMiLCJlcnIiLCJlcnJvciJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOzs7O0FBRU8sTUFBTUEsV0FBVyxHQUFHLE1BQU1DLEtBQU4sSUFBZTtBQUN4Q0MsRUFBQUEsT0FBTyxDQUFDQyxHQUFSLENBQVksMEJBQTBCRixLQUF0Qzs7QUFDQSxNQUFJO0FBQ0Y7QUFDQSxVQUFNRyxZQUFZLEdBQUdDLE9BQU8sQ0FBQ0MsR0FBUixDQUFZRixZQUFqQztBQUNBLFFBQUksQ0FBQ0EsWUFBTCxFQUFtQixNQUFNLElBQUlHLEtBQUosQ0FBVSwrQkFBVixDQUFOO0FBRW5CLFVBQU1DLFFBQVEsR0FBRyxNQUFNQyxlQUFNQyxHQUFOLENBQVUsK0JBQVYsRUFBMkM7QUFDaEVDLE1BQUFBLE1BQU0sRUFBRTtBQUNOQyxRQUFBQSxDQUFDLEVBQUVYO0FBREcsT0FEd0Q7QUFJaEVZLE1BQUFBLE9BQU8sRUFBRTtBQUNQQyxRQUFBQSxhQUFhLEVBQUcsVUFBU1QsT0FBTyxDQUFDQyxHQUFSLENBQVlGLFlBQWE7QUFEM0M7QUFKdUQsS0FBM0MsQ0FBdkIsQ0FMRSxDQWNGOztBQUNBLFFBQUlJLFFBQVEsQ0FBQ08sSUFBVCxDQUFjQyxJQUFkLENBQW1CQyxNQUFuQixLQUE4QixHQUFsQyxFQUF1QztBQUNyQyxZQUFNLElBQUlWLEtBQUosQ0FBVzs7VUFFYkMsUUFBUSxDQUFDTyxJQUFULENBQWNDLElBQUssRUFGakIsQ0FBTjtBQUdELEtBbkJDLENBcUJGOzs7QUFDQSxXQUFPLE1BQU1SLFFBQWI7QUFDRCxHQXZCRCxDQXVCRSxPQUFPVSxHQUFQLEVBQVk7QUFDWmhCLElBQUFBLE9BQU8sQ0FBQ2lCLEtBQVIsQ0FBY0QsR0FBZDtBQUNEO0FBQ0YsQ0E1Qk0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnXHJcblxyXG5leHBvcnQgY29uc3QgZ2VuaXVzUXVlcnkgPSBhc3luYyBxdWVyeSA9PiB7XHJcbiAgY29uc29sZS5sb2coJ1NlYXJjaGluZyBHZW5pdXMgZm9yICcgKyBxdWVyeSlcclxuICB0cnkge1xyXG4gICAgLy8ga2V5IGNoZWNrXHJcbiAgICBjb25zdCBnZW5pdXNBcGlLZXkgPSBwcm9jZXNzLmVudi5nZW5pdXNBcGlLZXlcclxuICAgIGlmICghZ2VuaXVzQXBpS2V5KSB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBnZW5pdXMgQVBJIEtleSBpcyBub3Qgc2V0JylcclxuXHJcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldCgnaHR0cHM6Ly9hcGkuZ2VuaXVzLmNvbS9zZWFyY2gnLCB7XHJcbiAgICAgIHBhcmFtczoge1xyXG4gICAgICAgIHE6IHF1ZXJ5LFxyXG4gICAgICB9LFxyXG4gICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgQXV0aG9yaXphdGlvbjogYEJlYXJlciAke3Byb2Nlc3MuZW52Lmdlbml1c0FwaUtleX1gLFxyXG4gICAgICB9LFxyXG4gICAgfSlcclxuXHJcbiAgICAvLyByZXNwIGNoZWNrXHJcbiAgICBpZiAocmVzcG9uc2UuZGF0YS5tZXRhLnN0YXR1cyAhPT0gMjAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgXHJcbiAgICAgICAgVGhlIEdlbml1cyBBUEkgZGlkIG5vdCByZXR1cm4gMjAwIE9LIFxcblxyXG4gICAgICAgICR7cmVzcG9uc2UuZGF0YS5tZXRhfWApXHJcbiAgICB9XHJcblxyXG4gICAgLy8gaG9wZWZ1bGx5IGEgdmFsaWQgcmVzcG9uc2VcclxuICAgIHJldHVybiBhd2FpdCByZXNwb25zZVxyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgY29uc29sZS5lcnJvcihlcnIpXHJcbiAgfVxyXG59XHJcbiJdfQ==