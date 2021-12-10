# Simply-imitated-SQS-for-testing

[![npm version](https://badge.fury.io/js/%40abetomo%2Fsimply-imitated-sqs.svg)](https://badge.fury.io/js/%40abetomo%2Fsimply-imitated-sqs)
![Test](https://github.com/abetomo/Simply-imitated-SQS-for-testing/workflows/Test/badge.svg)

Simply imitated SQS for testing

Simple SQS class that can be used for local test.
You do not even need to use Docker.

You can send, receive and delete data, so you can do better unit tests than with mocks.

## install

```
% npm install -D @abetomo/simply-imitated-sqs
```

## Application example

### Replace `sqs` instance

```javascript
// !!!
// If the value of the environment variable LOCAL_TEST is set,
// it will be tested with SimplyImitatedSQS

import AWS from 'aws-sdk'
import SimplyImitatedSQS from '@abetomo/simply-imitated-sqs'

const sqs = (() => {
  // !!! If environment variable is set, use SimplyImitatedSQS
  if (process.env.LOCAL_TEST === '1') {
    return new SimplyImitatedSQS()
  }
  return new AWS.SQS({
    region: 'us-east-1',
    apiVersion: '2012-11-05'
  })
})()

// Once you create the sqs instance, you do not need to modify any other code.
const queueUrl = 'https://sqs.us-east-1.amazonaws.com/xxx/test'

// sendMessage
try {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: 'hoge' + (new Date()).toString()
  }
  const sendRes = await sqs.sendMessage(params).promise()
  console.log('+++\n%s\n+++', JSON.stringify(sendRes, null, ' '))
} catch (err) {
  console.error(err)
}

// receiveMessage
let message = null
try {
  const params = { QueueUrl: queueUrl }
  message = await sqs.receiveMessage(params).promise()
  console.log('===\n%s\n===', JSON.stringify(message, null, ' '))
} catch (err) {
  console.error(err)
}

// deleteMessage
try {
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle: message.Messages[0].ReceiptHandle
  }
  const delRes = await sqs.deleteMessage(params).promise()
  console.log('---\n%s\n---', JSON.stringify(delRes, null, ' '))
} catch (err) {
  console.error(err)
}

// !!! SimplyImitatedSQS creates a file to store the queue, so remove it.
if (process.env.LOCAL_TEST === '1') {
  sqs.clear()
}
```

### Starting http server

```javascript
// !!!
// If the value of the environment variable LOCAL_TEST is set,
// it will be tested with SimplyImitatedSQS
//
import AWS from 'aws-sdk'
import { Server } from '@abetomo/simply-imitated-sqs'

const sqs = new AWS.SQS({
  region: 'us-east-1',
  apiVersion: '2012-11-05'
})

// Existing code remains the same except booting the server
// and reassigning the `queueUrl`.
const server = new Server()
let queueUrl = 'https://sqs.us-east-1.amazonaws.com/xxx/test'
if (process.env.LOCAL_TEST === '1') {
  /// !!! Server start and `queueUrl` reassignment
  queueUrl = server.run({
    port: '1234',
    host: 'localhost'
  })
}

// sendMessage
try {
  const params = {
    QueueUrl: queueUrl,
    MessageBody: 'hoge' + (new Date()).toString()
  }
  const res = await sqs.sendMessage(params).promise()
  console.log('+++\n%s\n+++', JSON.stringify(res, null, ' '))
} catch (err) {
  console.error(err)
}

// receiveMessage
let message = null
try {
  const params = { QueueUrl: queueUrl }
  message = await sqs.receiveMessage(params).promise()
  console.log('===\n%s\n===', JSON.stringify(message, null, ' '))
} catch (err) {
  console.error(err)
}

// deleteMessage
try {
  const params = {
    QueueUrl: queueUrl,
    ReceiptHandle: message.Messages[0].ReceiptHandle
  }
  const res = await sqs.deleteMessage(params).promise()
  console.log('---\n%s\n---', JSON.stringify(res, null, ' '))
} catch (err) {
  console.error(err)
}

if (process.env.LOCAL_TEST === '1') {
  // !!! Finally shutdown the server
  console.log('server shutdown')
  server.close()
}
```

### Execution

```
# Access AWS.
% node example.js

# Local Completion Test
% LOCAL_TEST=1 node example.js
```
