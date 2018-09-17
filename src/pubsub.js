const fs = require('fs')
const path = require('path')
const { GoogleToken } = require('gtoken')
const Subscription = require('./subscription')
const Topic = require('./topic')

class PubSub {
  constructor (credentials) {
    this.credentials = this._readCredentials(credentials)
    this.token = new GoogleToken({
      key: this.credentials.private_key,
      email: this.credentials.client_email,
      scope: ['https://www.googleapis.com/auth/pubsub']
    })
  }

  _readCredentials (fileName) {
    const credentialsPath = path.join(process.cwd(), fileName)
    if (!fs.existsSync(credentialsPath)) {
      throw new Error(`Credentials file not found: ${credentialsPath}`)
    }
    return JSON.parse(fs.readFileSync(credentialsPath))
  }

  subscription (name) {
    return new Subscription(this.credentials.project_id, this.token, name)
  }

  topic (name) {
    return new Topic(this.credentials.project_id, this.token, name)
  }
}

module.exports = PubSub
