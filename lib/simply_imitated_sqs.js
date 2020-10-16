'use strict'

const os = require('os')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const EventEmitter = require('events').EventEmitter
const VerySimpleQueueLikeSQS = require('@abetomo/vsq').SQS

class SimplyImitatedSQS {
  constructor (dbFile) {
    this.vsq = new VerySimpleQueueLikeSQS()
    this.dbFile = (() => {
      if (dbFile != null) return dbFile
      return this.defaultDbFile()
    })()
    this.vsq.load(this.dbFile)
  }

  defaultDbFile () {
    const getRandomInt = () => Math.floor(Math.random() * 10000000)
    return path.join(
      os.tmpdir(),
      `SimplyImitatedSQS-${getRandomInt()}.json`
    )
  }

  reload () {
    this.vsq = new VerySimpleQueueLikeSQS()
    this.vsq.load(this.dbFile)
  }

  clear () {
    delete this.vsq
    if (fs.existsSync(this.dbFile)) fs.unlinkSync(this.dbFile)
  }

  md5_ (str) {
    return crypto
      .createHash('md5')
      .update(str, 'utf8')
      .digest('hex')
  }

  eventEmitter_ (err, data) {
    const eventEmitter = new EventEmitter()
    eventEmitter.promise = () => {
      if (err) return Promise.reject(err)
      return Promise.resolve(data)
    }
    return eventEmitter
  }

  // TODO: Other methods

  sendMessage (params, callback) {
    this.vsq.send(params.MessageBody)
    const data = {
      ResponseMetadata: {
        RequestId: 'SimplyImitatedSQS-RequestId'
      },
      MD5OfMessageBody: this.md5_(params.MessageBody),
      MessageId: 'SimplyImitatedSQS-MessageId'
    }
    if (callback) callback(null, data)
    return this.eventEmitter_(null, data)
  }

  sendMessageBatch (params, callback) {
    const data = {
      ResponseMetadata: {
        RequestId: 'SimplyImitatedSQS-RequestId'
      },
      Successful: params.Entries.map((entry, i) => {
        this.vsq.send(entry.MessageBody)
        return {
          Id: entry.Id,
          MessageId: `SimplyImitatedSQS-MessageId-${i}`,
          MD5OfMessageBody: this.md5_(entry.MessageBody)
        }
      }),
      Failed: []
    }
    if (callback) callback(null, data)
    return this.eventEmitter_(null, data)
  }

  receiveMessage (params, callback) {
    const response = this.vsq.receive()
    const data = {
      ResponseMetadata: {
        RequestId: 'SimplyImitatedSQS-RequestId'
      }
    }
    if (response != null) {
      data.Messages = [{
        MessageId: 'SimplyImitatedSQS-MessageId',
        ReceiptHandle: response.id,
        MD5OfBody: this.md5_(response.body),
        Body: response.body
      }]
    }

    if (callback) callback(null, data)
    return this.eventEmitter_(null, data)
  }

  deleteMessage (params, callback) {
    this.vsq.delete(params.ReceiptHandle)
    const data = {
      ResponseMetadata: {
        RequestId: 'SimplyImitatedSQS-RequestId'
      }
    }
    if (callback) callback(null, data)
    return this.eventEmitter_(null, data)
  }
}

module.exports = SimplyImitatedSQS
