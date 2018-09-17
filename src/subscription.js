const { isNil, isArray, isFunction } = require('lodash')
const sleep = require('./utils/sleep.util')
const log = require('./utils/log.util')
const pubsub = require('./clients/pubsub.client')

class Subscription {
  constructor (googleProject, googleToken, subscription) {
    this.googleProject = googleProject
    this.googleToken = googleToken
    this.subscription = subscription

    if (isNil(this.googleProject)) throw new Error('googleProject cannot be nil')
    if (isNil(this.googleToken)) throw new Error('googleToken cannot be nil')
    if (isNil(this.subscription)) throw new Error('subscription cannot be nil')
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
    const sleepMs = poolSleep || 30000

    log(`Listening [${this.subscription}]...`)
    while (true) {
      try {
        const messages = await this.pull(maxMessages || 1)

        // No messages
        if (messages.length === 0) {
          log(`No messages on [${this.subscription}] - sleeping for ${sleepMs}ms...`)
          await sleep(sleepMs)
          continue
        }

        // Process retrieved messages
        const processMessage = async ({ message, ackId }) => {
          try {
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
        log(`Error on listen [${this.subscription}] - ${err.message} - sleeping for ${sleepMs}ms...`)
        await sleep(sleepMs)
      }
    }
  }
 }

module.exports = Subscription
