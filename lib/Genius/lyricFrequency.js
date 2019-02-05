'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true,
})
exports.makeRepetitiveScore = exports.makeSentiment = exports.gatherPoints = exports.pathPalette = exports.resolveFrequency = exports.makeFullLyrics = void 0

var R = _interopRequireWildcard(require('ramda'))

var _stemr = require('stemr')

var _axios = _interopRequireDefault(require('axios'))

var _cheerio = _interopRequireDefault(require('cheerio'))

var _getImageColors = _interopRequireDefault(require('get-image-colors'))

var _sentiment = _interopRequireDefault(require('sentiment'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj}
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj
  } else {
    var newObj = {}
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc =
            Object.defineProperty && Object.getOwnPropertyDescriptor
              ? Object.getOwnPropertyDescriptor(obj, key)
              : {}
          if (desc.get || desc.set) {
            Object.defineProperty(newObj, key, desc)
          } else {
            newObj[key] = obj[key]
          }
        }
      }
    }
    newObj.default = obj
    return newObj
  }
}

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

const makeFullLyrics = async paths =>
  paths.map(async path => {
    try {
      if (!path) throw new Error(`Did not receive a path from the API response`)
      const body = await (0, _axios.default)('https://genius.com' + path[0])
      if (body.status !== 200) throw new Error(body)
      const lyricText = await _cheerio.default
        .load(body.data)('p', '.lyrics')
        .text()
      return await parseLyrics(lyricText)
    } catch (err) {
      console.log(err)
    }
  })

exports.makeFullLyrics = makeFullLyrics

const mapWithIndex = lyrics =>
  lyrics.map(async (word, index) => ({
    word,
    index,
    stem: (0, _stemr.stem)(word),
  }))

const otherReduce = async (freq, word) => {
  // find where in the [] and obj has a stem property equal to the current word stem
  const prevObjIndex = R.findIndex(R.propEq('stem', word.stem))(freq)
  const isInFreq = prevObjIndex != -1 // if it is, update it according to the following property functions

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
      )(freq) // or add it to the list with this shape
    : R.append({
        freq: 1,
        originalWords: new Set([word.word]),
        indices: [word.index],
        stem: word.stem,
      })(freq)
}

const resolveFrequency = R.pipe(
  mapWithIndex,
  R.reduce(otherReduce, []),
)
exports.resolveFrequency = resolveFrequency

const pathPalette = async path => {
  const fileType = R.last(path.split('.'))
  return _axios.default
    .get(path, {
      responseType: 'arraybuffer',
    })
    .then(a => (0, _getImageColors.default)(a.data, `image/${fileType}`))
    .then(R.map(R.invoker(0, 'hex')))
}

exports.pathPalette = pathPalette

const gatherPoints = async freqArr =>
  await freqArr.reduce(
    async (dataArr, freqObj, i) => [
      ...(await dataArr),
      ...(await freqObj.indices.reduce(
        async (acc, idx) => [
          ...(await acc),
          {
            x: idx,
            y: i,
          },
        ],
        Promise.resolve([]),
      )),
    ],
    Promise.resolve([]),
  )

exports.gatherPoints = gatherPoints
const sentiment = new _sentiment.default()

const makeSentiment = async lyrics => sentiment.analyze(lyrics.join(' ')) // [{x: int, y: int}]
// This is a sum of the change in height between every point

exports.makeSentiment = makeSentiment

const makeRepetitiveScore = async dataArray => {
  const additiveAreas = await dataArray.reduce(
    async (areaP, point, idx, arr) => {
      const area = await areaP

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
    },
    Promise.resolve(0),
  ) // normalize across word count, limit between 0 and 100

  return 100 / (additiveAreas / dataArray.length)
}

exports.makeRepetitiveScore = makeRepetitiveScore
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9HZW5pdXMvbHlyaWNGcmVxdWVuY3kuanMiXSwibmFtZXMiOlsicGFyc2VMeXJpY3MiLCJSIiwicGlwZSIsInJlcGxhY2UiLCJzcGxpdCIsIm1hcCIsInRyaW0iLCJyZWplY3QiLCJpc0VtcHR5IiwidG9Mb3dlciIsIm1ha2VGdWxsTHlyaWNzIiwicGF0aHMiLCJwYXRoIiwiRXJyb3IiLCJib2R5Iiwic3RhdHVzIiwibHlyaWNUZXh0IiwiY2hlZXJpbyIsImxvYWQiLCJkYXRhIiwidGV4dCIsImVyciIsImNvbnNvbGUiLCJsb2ciLCJtYXBXaXRoSW5kZXgiLCJseXJpY3MiLCJ3b3JkIiwiaW5kZXgiLCJzdGVtIiwib3RoZXJSZWR1Y2UiLCJmcmVxIiwicHJldk9iakluZGV4IiwiZmluZEluZGV4IiwicHJvcEVxIiwiaXNJbkZyZXEiLCJ1cGRhdGUiLCJldm9sdmUiLCJhZGQiLCJvcmlnaW5hbFdvcmRzIiwic2V0IiwiaW5kaWNlcyIsImFwcGVuZCIsImlkZW50aXR5IiwiU2V0IiwicmVzb2x2ZUZyZXF1ZW5jeSIsInJlZHVjZSIsInBhdGhQYWxldHRlIiwiZmlsZVR5cGUiLCJsYXN0IiwiYXhpb3MiLCJnZXQiLCJyZXNwb25zZVR5cGUiLCJ0aGVuIiwiYSIsImludm9rZXIiLCJnYXRoZXJQb2ludHMiLCJmcmVxQXJyIiwiZGF0YUFyciIsImZyZXFPYmoiLCJpIiwiYWNjIiwiaWR4IiwieCIsInkiLCJQcm9taXNlIiwicmVzb2x2ZSIsInNlbnRpbWVudCIsIlNlbnRpbWVudCIsIm1ha2VTZW50aW1lbnQiLCJhbmFseXplIiwiam9pbiIsIm1ha2VSZXBldGl0aXZlU2NvcmUiLCJkYXRhQXJyYXkiLCJhZGRpdGl2ZUFyZWFzIiwiYXJlYVAiLCJwb2ludCIsImFyciIsImFyZWEiLCJNYXRoIiwic3FydCIsImxlbmd0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOztBQUNBOzs7Ozs7QUFFQTtBQUNB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LEdBQVVhLEdBQUcsQ0FBQ2YsR0FBRyxHQUFHLENBQVAsQ0FBSCxDQUFhRSxDQUF4QixJQUE2QixDQUE3QztBQUNEO0FBQ0YsR0FmeUIsRUFnQjFCQyxPQUFPLENBQUNDLE9BQVIsQ0FBZ0IsQ0FBaEIsQ0FoQjBCLENBQTVCLENBRG9ELENBbUJwRDs7QUFDQSxTQUFPLE9BQU9RLGFBQWEsR0FBR0QsU0FBUyxDQUFDUSxNQUFqQyxDQUFQO0FBQ0QsQ0FyQk0iLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBSIGZyb20gJ3JhbWRhJ1xyXG5pbXBvcnQge3N0ZW0gYXMgc3RlbW1lcn0gZnJvbSAnc3RlbXInXHJcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcydcclxuaW1wb3J0IGNoZWVyaW8gZnJvbSAnY2hlZXJpbydcclxuaW1wb3J0IGdldENvbG9ycyBmcm9tICdnZXQtaW1hZ2UtY29sb3JzJ1xyXG5pbXBvcnQgU2VudGltZW50IGZyb20gJ3NlbnRpbWVudCdcclxuXHJcbi8vIGNoYWluaW5nIHJlZ2V4IGlzIGdyb3NzLCBiaXQgaXQgd29ya3NcclxuY29uc3QgcGFyc2VMeXJpY3MgPSBSLnBpcGUoXHJcbiAgUi5yZXBsYWNlKC9cXFsuKlxccyouKlxcXS9nLCAnJyksIC8vIHJlbW92ZSBbQ2hvcnVzXSwgY291bGQgYWN0dWFsbHkgYmUgdXNlZnVsIGluIGZ1dHVyZVxyXG4gIFIucmVwbGFjZSgvXFxuXFxuL2dtLCAnJyksXHJcbiAgUi5yZXBsYWNlKC9cXG4vZ20sICcgJyksIC8vIEkgZ2F1cmFudGVlIHRoaXMgdmlvYXRlcyBEUlksIGJ1dCBpdCdzIGZyYWdpbGUtaXNoXHJcbiAgUi5yZXBsYWNlKC9bIVwiIyQlJigpKissXFwtLi86Ozw9Pj9AW1xcXVxcXl9ge3x9fuKAneKAnOKApuKAlF0vZywgJycpLCAvLyBJIGhhdmUgdGhlIGJlc3Rlc3Qgc3BlY2lhbCBjaGFyIHN0cmlwcGluZ1xyXG4gIFIucmVwbGFjZSgnXFxcXCcsICcnKSwgLy8gZm9yIHNvbWUgcmVhc29uIHRoZXNlIGFyZSBpbiB0aGVyZSBzb21ldGltZXNcclxuICBSLnNwbGl0KCcgJyksIC8vIHNob3VsZCBtYWtlIGFuIGFycmF5IG9mIHdvcmRzXHJcbiAgUi5tYXAoUi50cmltKSwgLy8gcmVtb3ZlcyBleHRyYSBzcGFjZXNcclxuICBSLnJlamVjdChSLmlzRW1wdHkpLCAvLyByZWplY3RzIHRob3NlIGVtcHR5IHdvcmRzXHJcbiAgUi5tYXAoUi50b0xvd2VyKSwgLy8gbm9ybWFsaXplXHJcbilcclxuXHJcbmV4cG9ydCBjb25zdCBtYWtlRnVsbEx5cmljcyA9IGFzeW5jIHBhdGhzID0+XHJcbiAgcGF0aHMubWFwKGFzeW5jIHBhdGggPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgaWYgKCFwYXRoKSB0aHJvdyBuZXcgRXJyb3IoYERpZCBub3QgcmVjZWl2ZSBhIHBhdGggZnJvbSB0aGUgQVBJIHJlc3BvbnNlYClcclxuXHJcbiAgICAgIGNvbnN0IGJvZHkgPSBhd2FpdCBheGlvcygnaHR0cHM6Ly9nZW5pdXMuY29tJyArIHBhdGhbMF0pXHJcbiAgICAgIGlmIChib2R5LnN0YXR1cyAhPT0gMjAwKSB0aHJvdyBuZXcgRXJyb3IoYm9keSlcclxuXHJcbiAgICAgIGNvbnN0IGx5cmljVGV4dCA9IGF3YWl0IGNoZWVyaW9cclxuICAgICAgICAubG9hZChib2R5LmRhdGEpKCdwJywgJy5seXJpY3MnKVxyXG4gICAgICAgIC50ZXh0KClcclxuXHJcbiAgICAgIHJldHVybiBhd2FpdCBwYXJzZUx5cmljcyhseXJpY1RleHQpXHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgY29uc29sZS5sb2coZXJyKVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG5jb25zdCBtYXBXaXRoSW5kZXggPSBseXJpY3MgPT5cclxuICBseXJpY3MubWFwKGFzeW5jICh3b3JkLCBpbmRleCkgPT4gKHtcclxuICAgIHdvcmQsXHJcbiAgICBpbmRleCxcclxuICAgIHN0ZW06IHN0ZW1tZXIod29yZCksXHJcbiAgfSkpXHJcbmNvbnN0IG90aGVyUmVkdWNlID0gYXN5bmMgKGZyZXEsIHdvcmQpID0+IHtcclxuICAvLyBmaW5kIHdoZXJlIGluIHRoZSBbXSBhbmQgb2JqIGhhcyBhIHN0ZW0gcHJvcGVydHkgZXF1YWwgdG8gdGhlIGN1cnJlbnQgd29yZCBzdGVtXHJcbiAgY29uc3QgcHJldk9iakluZGV4ID0gUi5maW5kSW5kZXgoUi5wcm9wRXEoJ3N0ZW0nLCB3b3JkLnN0ZW0pKShmcmVxKVxyXG4gIGNvbnN0IGlzSW5GcmVxID0gcHJldk9iakluZGV4ICE9IC0xXHJcbiAgLy8gaWYgaXQgaXMsIHVwZGF0ZSBpdCBhY2NvcmRpbmcgdG8gdGhlIGZvbGxvd2luZyBwcm9wZXJ0eSBmdW5jdGlvbnNcclxuICByZXR1cm4gaXNJbkZyZXFcclxuICAgID8gUi51cGRhdGUocHJldk9iakluZGV4KShcclxuICAgICAgICBSLmV2b2x2ZShcclxuICAgICAgICAgIHtcclxuICAgICAgICAgICAgZnJlcTogUi5hZGQoMSksXHJcbiAgICAgICAgICAgIG9yaWdpbmFsV29yZHM6IHNldCA9PiBzZXQuYWRkKHdvcmQud29yZCksXHJcbiAgICAgICAgICAgIGluZGljZXM6IFIuYXBwZW5kKHdvcmQuaW5kZXgpLFxyXG4gICAgICAgICAgICBzdGVtOiBSLmlkZW50aXR5LFxyXG4gICAgICAgICAgfSxcclxuICAgICAgICAgIGZyZXFbcHJldk9iakluZGV4XSxcclxuICAgICAgICApLFxyXG4gICAgICApKGZyZXEpXHJcbiAgICA6IC8vIG9yIGFkZCBpdCB0byB0aGUgbGlzdCB3aXRoIHRoaXMgc2hhcGVcclxuICAgICAgUi5hcHBlbmQoe1xyXG4gICAgICAgIGZyZXE6IDEsXHJcbiAgICAgICAgb3JpZ2luYWxXb3JkczogbmV3IFNldChbd29yZC53b3JkXSksXHJcbiAgICAgICAgaW5kaWNlczogW3dvcmQuaW5kZXhdLFxyXG4gICAgICAgIHN0ZW06IHdvcmQuc3RlbSxcclxuICAgICAgfSkoZnJlcSlcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IHJlc29sdmVGcmVxdWVuY3kgPSBSLnBpcGUoXHJcbiAgbWFwV2l0aEluZGV4LFxyXG4gIFIucmVkdWNlKG90aGVyUmVkdWNlLCBbXSksXHJcbilcclxuXHJcbmV4cG9ydCBjb25zdCBwYXRoUGFsZXR0ZSA9IGFzeW5jIHBhdGggPT4ge1xyXG4gIGNvbnN0IGZpbGVUeXBlID0gUi5sYXN0KHBhdGguc3BsaXQoJy4nKSlcclxuICByZXR1cm4gYXhpb3NcclxuICAgIC5nZXQocGF0aCwge3Jlc3BvbnNlVHlwZTogJ2FycmF5YnVmZmVyJ30pXHJcbiAgICAudGhlbihhID0+IGdldENvbG9ycyhhLmRhdGEsIGBpbWFnZS8ke2ZpbGVUeXBlfWApKVxyXG4gICAgLnRoZW4oUi5tYXAoUi5pbnZva2VyKDAsICdoZXgnKSkpXHJcbn1cclxuXHJcbmV4cG9ydCBjb25zdCBnYXRoZXJQb2ludHMgPSBhc3luYyBmcmVxQXJyID0+XHJcbiAgYXdhaXQgZnJlcUFyci5yZWR1Y2UoXHJcbiAgICBhc3luYyAoZGF0YUFyciwgZnJlcU9iaiwgaSkgPT4gW1xyXG4gICAgICAuLi4oYXdhaXQgZGF0YUFyciksXHJcbiAgICAgIC4uLihhd2FpdCBmcmVxT2JqLmluZGljZXMucmVkdWNlKFxyXG4gICAgICAgIGFzeW5jIChhY2MsIGlkeCkgPT4gWy4uLihhd2FpdCBhY2MpLCB7eDogaWR4LCB5OiBpfV0sXHJcbiAgICAgICAgUHJvbWlzZS5yZXNvbHZlKFtdKSxcclxuICAgICAgKSksXHJcbiAgICBdLFxyXG4gICAgUHJvbWlzZS5yZXNvbHZlKFtdKSxcclxuICApXHJcblxyXG5jb25zdCBzZW50aW1lbnQgPSBuZXcgU2VudGltZW50KClcclxuZXhwb3J0IGNvbnN0IG1ha2VTZW50aW1lbnQgPSBhc3luYyBseXJpY3MgPT4gc2VudGltZW50LmFuYWx5emUobHlyaWNzLmpvaW4oJyAnKSlcclxuXHJcbi8vIFt7eDogaW50LCB5OiBpbnR9XVxyXG4vLyBUaGlzIGlzIGEgc3VtIG9mIHRoZSBjaGFuZ2UgaW4gaGVpZ2h0IGJldHdlZW4gZXZlcnkgcG9pbnRcclxuZXhwb3J0IGNvbnN0IG1ha2VSZXBldGl0aXZlU2NvcmUgPSBhc3luYyBkYXRhQXJyYXkgPT4ge1xyXG4gIGNvbnN0IGFkZGl0aXZlQXJlYXMgPSBhd2FpdCBkYXRhQXJyYXkucmVkdWNlKFxyXG4gICAgYXN5bmMgKGFyZWFQLCBwb2ludCwgaWR4LCBhcnIpID0+IHtcclxuICAgICAgY29uc3QgYXJlYSA9IGF3YWl0IGFyZWFQXHJcbiAgICAgIGlmIChpZHggPT09IDApIHtcclxuICAgICAgICAvLyBpbmNsdWRlIGluaXRpYWwgdHJpYW5nbGUgd2l0aCBwb2ludCBhdCAxLDFcclxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KDIpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKGlkeCA9PT0gYXJyLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAvLyBhbHJlYWR5IGZhY3RvcmVkIGludG8gbGFzdCBhcmVhIGNhbGN1bGF0aW9uXHJcbiAgICAgICAgcmV0dXJuIGFyZWFcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBhZGQgYXZlcmFnZSBoZWlnaHQgYmV0d2VlbiBjdXJyZW50IHBvaW50IGFuZCBuZXh0XHJcbiAgICAgICAgLy8gYmVjYXVzZSB3aWR0aCA9IDEgdGhpcyBpcyB0aGUgc2FtZSBhcyBhIHRyYXBlem9pZCBhcmVhIGZ1bmNcclxuICAgICAgICByZXR1cm4gKGFyZWEgKz0gKHBvaW50LnkgKyBhcnJbaWR4ICsgMV0ueSkgLyAyKVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgUHJvbWlzZS5yZXNvbHZlKDApLFxyXG4gIClcclxuICAvLyBub3JtYWxpemUgYWNyb3NzIHdvcmQgY291bnQsIGxpbWl0IGJldHdlZW4gMCBhbmQgMTAwXHJcbiAgcmV0dXJuIDEwMCAvIChhZGRpdGl2ZUFyZWFzIC8gZGF0YUFycmF5Lmxlbmd0aClcclxufVxyXG4iXX0=
