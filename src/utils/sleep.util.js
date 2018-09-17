function sleep (ms) {
  if (ms > 0) {
    return new Promise(resolve => setTimeout(resolve, ms))
  } else {
    return Promise.resolve()
  }
}

module.exports = sleep
