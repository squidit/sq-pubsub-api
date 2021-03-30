const got = require('got')
const { get } = require('lodash')
const PubSubError = require('../errors/PubSubError')

const BASE_URL = 'https://pubsub.googleapis.com/v1'

async function makePost (url, body, token) {
  try {
    const { body: result } = await got.post(url, {
      headers: { Authorization: `Bearer ${token}` },
      body,
      json: true
    })
    return result
  } catch (err) {
    console.log(err)
    throw new PubSubError(err.statusCode || 0, get(err, 'response.body.error.message', err.message))
  }
}

async function ack (project, subscription, token, ackIds) {
  const url = `${BASE_URL}/projects/${project}/subscriptions/${subscription}:acknowledge`
  const body = {
    ackIds
  }
  await makePost(url, body, token)
}

async function pull (project, subscription, token, maxMessages) {
  const url = `${BASE_URL}/projects/${project}/subscriptions/${subscription}:pull`
  const body = {
    returnImmediately: true,
    maxMessages
  }
  return makePost(url, body, token)
}

async function publish (project, topic, token, messages) {
  const url = `${BASE_URL}/projects/${project}/topics/${topic}:publish`
  const body = {
    messages: messages.map(message => ({ data: Buffer.from(JSON.stringify(message)).toString('base64') }))
  }
  return makePost(url, body, token)
}

module.exports = {
  ack,
  pull,
  publish
}
