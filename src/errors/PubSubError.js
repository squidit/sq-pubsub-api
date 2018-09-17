class PubSubError extends Error {
  constructor (statusCode, message) {
    super(`{PubSub Client}: Error ${statusCode} calling API - ${message}`)
    this.statusCode = statusCode
    this.name = 'PubSubError'
  }
}

module.exports = PubSubError
