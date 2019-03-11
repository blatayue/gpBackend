export = index
declare class index {
  constructor(options?: any)
  analyze(phrase: string, opts?: opts, callback?: callback): sentiment
  registerLanguage(languageCode: string, language: language): void
}

type callback = (err: null, sentiment: sentiment) => void

interface opts {
  extras: {
    labels: labels
  }
  language: string
}

interface labels {
  [key: string]: number
}
type sentiment = {
  score: number
  comparative: number
  tokens: string[]
  words: string[]
  positive: string[]
  negative: string[]
}

interface language {
  labels: labels
}
