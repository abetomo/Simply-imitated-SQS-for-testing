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
