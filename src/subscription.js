const { isNil, isArray, isFunction } = require('lodash')
const sleep = require('./utils/sleep.util')
const log = require('./utils/log.util')
const pubsub = require('./clients/pubsub.client')
class Subscription {
  constructor (googleProject, googleToken, subscription) {
    this.googleProject = googleProject
    this.googleToken = googleToken
    this.subscription = subscription
    this.sleepMs = null
    this.lastPing = null

    if (isNil(this.googleProject)) throw new Error('googleProject cannot be nil')
    if (isNil(this.googleToken)) throw new Error('googleToken cannot be nil')
    if (isNil(this.subscription)) throw new Error('subscription cannot be nil')
  }

  _updateLastPing () {
    this.lastPing = new Date()
  }

  _validateLastPing (that) {
    log('Validating last ping')
    if (!that.lastPing) return
    if (new Date().getTime() - that.lastPing.getTime() > that.sleepMs * 3) {
      log(`Killing process because last ping = ${that.lastPing.toISOString()}`)
      process.exit(1)
    }
  }

  async pull (maxMessages) {
    const token = await this.googleToken.getToken()
    const result = await pubsub.pull(this.googleProject, this.subscription, token, maxMessages)

    return result.receivedMessages || []
  }

  async ack (ids) {
    if (isNil(ids)) throw new Error('ids cannot be nil')
    const ackIds = isArray(ids) ? ids : [ids]

    const token = await this.googleToken.getToken()
    await pubsub.ack(this.googleProject, this.subscription, token, ackIds)
  }

  async listen (handler, { maxMessages, limitMessageTime, poolSleep } = {}) {
    if (!isFunction(handler)) throw new Error('handler must be a function')
    this.sleepMs = poolSleep || 30000

    // Validate lastPing
    setInterval(this._validateLastPing, this.sleepMs * 3, this)

    log(`Listening [${this.subscription}]...`)
    while (true) {
      try {
        const messages = await this.pull(maxMessages || 1)
        this._updateLastPing()

        // No messages
        if (messages.length === 0) {
          log(`No messages on [${this.subscription}] - sleeping for ${this.sleepMs}ms...`)
          await sleep(this.sleepMs)
          continue
        }

        // Process retrieved messages
        const processMessage = async ({ message, ackId }) => {
          try {
            this._updateLastPing()
            if (!message.data) {
              return
            }

            // Check if message publishTime is on deadline
            if (limitMessageTime && (new Date().getTime() - new Date(message.publishTime).getTime()) > limitMessageTime) {
              log(`Message [${message.messageId}] pass limit time - ${message.publishTime}`)
              return
            }

            const data = JSON.parse(Buffer.from(message.data, 'base64').toString())
            log(`Processing message [${message.messageId}]`)
            await handler(data)
          } catch (err) {
            log(`Error processing message [${message.messageId}] - ${err.message}`)
          } finally {
            log(`Ack message [${message.messageId}]`)
            this.ack(ackId)
          }
        }
        await Promise.all(messages.map(message => processMessage(message)))
      } catch (err) {
        log(`Error on listen [${this.subscription}] - ${err.message} - sleeping for ${this.sleepMs}ms...`)
        await sleep(this.sleepMs)
      }
    }
  }
 }

module.exports = Subscription
