const { isNil, isArray } = require('lodash')
const pubsub = require('./clients/pubsub.client')

class Topic {
  constructor (googleProject, googleToken, topic) {
    this.googleProject = googleProject
    this.googleToken = googleToken
    this.topic = topic

    if (isNil(this.googleProject)) throw new Error('googleProject cannot be nil')
    if (isNil(this.googleToken)) throw new Error('googleToken cannot be nil')
    if (isNil(this.topic)) throw new Error('topic cannot be nil')
  }

  async publish (messages) {
    if (isNil(messages)) throw new Error('messages cannot be nil')
    const publishMessages = isArray(messages) ? messages : [messages]

    const token = await this.googleToken.getToken()
    const result = await pubsub.publish(this.googleProject, this.topic, token, publishMessages)

    return isArray(messages) ? result.messageIds : result.messageIds[0]
  }
 }

module.exports = Topic
